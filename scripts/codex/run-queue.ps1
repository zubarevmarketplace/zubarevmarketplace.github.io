<#
.SYNOPSIS
  Раннер очереди задач для Codex CLI. Берёт задачи со статусом todo из docs/BACKLOG.md,
  запускает исполнителя, прогоняет проверку (npm run check), запускает ревьюера (без права
  правок), при замечаниях отправляет их исполнителю, при успехе коммитит и пушит.
  Задача в статусе running с незавершённой работой в дереве возобновляется с проверки.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\codex\run-queue.ps1
  powershell -ExecutionPolicy Bypass -File scripts\codex\run-queue.ps1 -Once -NoPush
#>
param(
  [string]$Repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
  [string]$Model = "gpt-6.1-sol",
  [string]$Effort = "high",
  [string]$ReviewModel = "gpt-6.1-sol",
  [string]$ReviewEffort = "medium",
  [int]$MaxTasks = 50,
  [int]$MaxFixRounds = 2,
  [switch]$NoPush,
  [switch]$Once
)

$ErrorActionPreference = "Continue"
$Utf8 = New-Object System.Text.UTF8Encoding($false)
$OutputEncoding = $Utf8
[Console]::OutputEncoding = $Utf8

$BacklogPath = Join-Path $Repo "docs\BACKLOG.md"
$RunsDir = Join-Path $Repo "docs\runs"
$WorkDir = Join-Path $Repo ".codex-work"
$LockPath = Join-Path $WorkDir "runner.lock"
$ImplPromptPath = Join-Path $PSScriptRoot "implementer-prompt.md"
$ReviewPromptPath = Join-Path $PSScriptRoot "reviewer-prompt.md"

New-Item -ItemType Directory -Force -Path $RunsDir | Out-Null
New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null

function Read-Text($path) { [IO.File]::ReadAllText($path, $Utf8) }
function Write-Text($path, $text) { [IO.File]::WriteAllText($path, $text, $Utf8) }
function Append-Text($path, $text) { [IO.File]::AppendAllText($path, $text, $Utf8) }

$script:RunLog = $null
$script:RunLogFrozen = $false
function Log($msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
  Write-Host $line
  if ($script:RunLog -and -not $script:RunLogFrozen) { Append-Text $script:RunLog ($line + "`n") }
  Append-Text (Join-Path $WorkDir "runner.log") ($line + "`n")
}

function Get-Tasks {
  $lines = Read-Text $BacklogPath
  $result = @()
  foreach ($line in ($lines -split "`n")) {
    if ($line -match '^\|\s*(\d{3})\s*\|\s*(\w+)\s*\|\s*(.+?)\s*\|\s*(\S+)\s*\|\s*$') {
      $result += [pscustomobject]@{ Id = $Matches[1]; Status = $Matches[2]; Title = $Matches[3]; Spec = $Matches[4] }
    }
  }
  return $result
}

function Set-TaskStatus($id, $status) {
  $text = Read-Text $BacklogPath
  $pattern = "(?m)^(\|\s*$id\s*\|\s*)\w+(\s*\|)"
  $text = [regex]::Replace($text, $pattern, ('${1}' + $status + '${2}'))
  Write-Text $BacklogPath $text
}

function Invoke-Codex($prompt, $outFile, $model, $effort, $sandbox, $ephemeral) {
  $streamLog = "$outFile.stream.log"
  $args = @("exec", "-m", $model, "-c", "model_reasoning_effort=`"$effort`"", "-s", $sandbox,
            "--skip-git-repo-check", "--color", "never", "-C", $Repo, "-o", $outFile)
  if ($ephemeral) { $args += "--ephemeral" }
  $args += "-"
  if (Test-Path $outFile) { Remove-Item $outFile -Force }
  $prompt | & codex @args 2>&1 | ForEach-Object { $_.ToString() } | Out-File -FilePath $streamLog -Encoding utf8
  $code = $LASTEXITCODE
  if (Test-Path $outFile) { return @{ Code = $code; Text = (Read-Text $outFile) } }
  return @{ Code = $code; Text = "" }
}

function Invoke-Check($logFile) {
  Push-Location $Repo
  try {
    $pkg = Read-Text (Join-Path $Repo "package.json")
    $scriptName = "build"
    if ($pkg -match '"check"\s*:') { $scriptName = "check" }
    & npm run $scriptName 2>&1 | ForEach-Object { $_.ToString() } | Out-File -FilePath $logFile -Encoding utf8
    $code = $LASTEXITCODE
    $tail = (Get-Content $logFile -Encoding utf8 | Select-Object -Last 60) -join "`n"
    return @{ Code = $code; Script = $scriptName; Tail = $tail }
  } finally { Pop-Location }
}

function Get-DiffSummary {
  Push-Location $Repo
  try {
    $stat = (& git diff --stat 2>&1 | Out-String)
    $untracked = (& git ls-files --others --exclude-standard 2>&1 | Out-String)
    return "git diff --stat:`n$stat`nНовые файлы:`n$untracked"
  } finally { Pop-Location }
}

function Test-CleanTree {
  Push-Location $Repo
  try { $s = (& git status --porcelain 2>&1 | Out-String).Trim(); return ($s.Length -eq 0) } finally { Pop-Location }
}

function Get-DiffFingerprint {
  Push-Location $Repo
  try {
    $d = (& git diff 2>&1 | Out-String) + (& git ls-files --others --exclude-standard 2>&1 | Out-String)
    $sha = [Security.Cryptography.SHA256]::Create()
    return [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($d)))
  } finally { Pop-Location }
}

if (Test-Path $LockPath) {
  Write-Host "Раннер уже запущен (есть $LockPath). Если это ошибка, удалите файл."
  exit 1
}
Write-Text $LockPath ("pid=" + $PID + " started=" + (Get-Date -Format s))

try {
  $implTemplate = Read-Text $ImplPromptPath
  $reviewTemplate = Read-Text $ReviewPromptPath
  $done = 0

  while ($done -lt $MaxTasks) {
    # Возобновление: задача в статусе running с незавершённой работой в дереве продолжается с проверки и ревью
    $resume = $false
    $task = Get-Tasks | Where-Object { $_.Status -eq "running" } | Select-Object -First 1
    if ($task -and -not (Test-CleanTree)) {
      $resume = $true
    } elseif (-not (Test-CleanTree)) {
      Write-Host "Рабочее дерево не чистое, а задач в статусе running нет. Разберите изменения (git status) и запустите снова."
      break
    } else {
      $task = Get-Tasks | Where-Object { $_.Status -eq "todo" } | Select-Object -First 1
    }
    if (-not $task) { Write-Host "Очередь пуста."; break }

    $id = $task.Id
    $script:RunLog = Join-Path $RunsDir "$id.md"
    $script:RunLogFrozen = $false
    if ($resume) {
      if (-not (Test-Path $script:RunLog)) { Write-Text $script:RunLog ("# Задача ${id}: " + $task.Title + "`n`nСпецификация: " + $task.Spec + "`n`n## Журнал`n`n") }
      Log "Возобновление задачи ${id}: работа уже в дереве, исполнитель раунда 0 пропущен."
    } else {
      Write-Text $script:RunLog ("# Задача ${id}: " + $task.Title + "`n`nСпецификация: " + $task.Spec + "`n`n## Журнал`n`n")
      Log "Старт задачи ${id}: $($task.Title)"
      Set-TaskStatus $id "running"
    }

    $spec = Read-Text (Join-Path $Repo $task.Spec)
    $taskWork = Join-Path $WorkDir $id
    New-Item -ItemType Directory -Force -Path $taskWork | Out-Null

    $status = "blocked"
    $feedback = ""
    for ($round = 0; $round -le $MaxFixRounds; $round++) {
      # 1. Исполнитель (при возобновлении раунд 0 пропускается: работа уже в дереве)
      if (-not ($resume -and $round -eq 0)) {
        $prompt = $implTemplate.Replace("{{SPEC}}", $spec).Replace("{{FEEDBACK}}", $feedback)
        $implOut = Join-Path $taskWork "impl-$round.md"
        Log "Раунд $round. Исполнитель ($Model/$Effort) запущен."
        $impl = Invoke-Codex $prompt $implOut $Model $Effort "workspace-write" $false
        Log ("Исполнитель завершил работу, код " + $impl.Code + ".")
        Append-Text $script:RunLog ("`n### Отчёт исполнителя, раунд $round`n`n" + $impl.Text + "`n")
      }

      # 2. Проверка сборки и тестов
      $checkLog = Join-Path $taskWork "check-$round.log"
      $check = Invoke-Check $checkLog
      if ($check.Code -ne 0) {
        Log ("npm run " + $check.Script + " не прошёл (код " + $check.Code + ").")
        $feedback = "ПРОВЕРКА НЕ ПРОШЛА. Команда npm run " + $check.Script + " завершилась с ошибкой. Хвост вывода:`n`n" + $check.Tail + "`n`nИсправь ошибки, не отключая проверки."
        continue
      }
      Log ("npm run " + $check.Script + " прошёл.")

      # 3. Ревьюер. Песочница read-only на Windows нестабильна (helper_unknown_error), поэтому ревьюер
      #    работает в workspace-write с запретом правок в промпте, а раннер проверяет, что файлы не изменились.
      $reviewPrompt = $reviewTemplate.Replace("{{SPEC}}", $spec).Replace("{{DIFF}}", (Get-DiffSummary))
      $review = $null
      for ($attempt = 0; $attempt -lt 3; $attempt++) {
        $reviewOut = Join-Path $taskWork "review-$round-$attempt.md"
        Log "Ревьюер ($ReviewModel/$ReviewEffort) запущен, попытка $attempt."
        $diffBefore = Get-DiffFingerprint
        $review = Invoke-Codex $reviewPrompt $reviewOut $ReviewModel $ReviewEffort "workspace-write" $true
        if ((Get-DiffFingerprint) -ne $diffBefore) { Log "ВНИМАНИЕ: ревьюер изменил файлы, хотя это запрещено. Проверьте git diff." }
        $envFailure = ($review.Text -match '(?m)^\s*VERDICT:\s*RETRY') -or ($review.Text -match 'helper_unknown_error') -or ($review.Text.Trim().Length -eq 0)
        if (-not $envFailure) { break }
        Log "Ревьюер не смог изучить изменения (сбой среды), повтор."
      }
      Append-Text $script:RunLog ("`n### Ревью, раунд $round`n`n" + $review.Text + "`n")
      if ($review.Text -match '(?m)^\s*VERDICT:\s*PASS') {
        Log "Ревью: PASS."
        $status = "done"
        break
      }
      Log "Ревью: FAIL, замечания отправлены исполнителю."
      $feedback = "РЕВЬЮ НАШЛО ЗАМЕЧАНИЯ. Исправь их. Текущие изменения уже в рабочем дереве (смотри git diff). Замечания:`n`n" + $review.Text
    }

    Set-TaskStatus $id $status
    Append-Text $script:RunLog ("`n## Итог: " + $status + "`n")

    Push-Location $Repo
    try {
      # После этой точки журнал задачи больше не меняется: иначе дерево станет грязным после коммита
      $script:RunLogFrozen = $true
      if ($status -eq "done") {
        & git add -A 2>&1 | Out-Null
        & git commit -q -m ("task " + $id + ": " + $task.Title + "`n`nАвтоматическая реализация через Codex, см. docs/runs/" + $id + ".md") 2>&1 | Out-Null
        Log "Коммит создан."
        if (-not $NoPush) {
          $pushOut = (& git push origin main 2>&1 | Out-String)
          if ($LASTEXITCODE -eq 0) { Log "Пуш в main выполнен." } else { Log ("Пуш не удался: " + $pushOut.Trim()) }
        }
        $done++
      } else {
        # Сохраняем незавершённую работу в ветку, чтобы main оставался чистым
        $branch = "codex/blocked-$id"
        & git checkout -q -b $branch 2>&1 | Out-Null
        & git add -A 2>&1 | Out-Null
        & git commit -q -m ("task " + $id + " (blocked): " + $task.Title) 2>&1 | Out-Null
        & git checkout -q main 2>&1 | Out-Null
        Log "Задача заблокирована. Незавершённая работа сохранена в ветке $branch. Раннер остановлен."
        break
      }
    } finally { Pop-Location }

    if ($Once) { break }
  }
} finally {
  Remove-Item $LockPath -Force -ErrorAction SilentlyContinue
}
