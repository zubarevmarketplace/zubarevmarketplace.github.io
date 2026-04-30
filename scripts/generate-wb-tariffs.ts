import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

const root = process.cwd();

const commissionPath = path.join(root, "data/raw/commission.xlsx");
const warehousePath = path.join(root, "data/raw/warehouse-coefficients.xlsx");

const commissionOut = path.join(
  root,
  "src/calculator/data/commissionTariffs.json",
);

const warehouseOut = path.join(
  root,
  "src/calculator/config/warehouseTariffs.ts",
);

type WarehouseKey =
  | "koledino"
  | "podolsk"
  | "tula"
  | "kazan"
  | "krasnodar"
  | "nevinnomyssk"
  | "ekaterinburg";

type WarehouseTariff = {
  label: string;
  logistics: number;
  storage: number;
  fbs: number | null;
};

type WarehouseCandidate = WarehouseTariff & {
  key: WarehouseKey;
  isSpecial: boolean;
};

type CommissionTariff = {
  id: string;
  category: string;
  subject: string;
  fboCommissionRate: number;
  fbsCommissionRate: number;
};

const REQUIRED_WAREHOUSES: WarehouseKey[] = [
  "koledino",
  "podolsk",
  "tula",
  "kazan",
  "krasnodar",
  "nevinnomyssk",
  "ekaterinburg",
];

const DEBUG_EKB = false;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

const num = (value: unknown) => {
  if (value == null || value === "") return null;

  const normalized = String(value).replace("%", "").replace(",", ".").trim();

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Комиссии храним как проценты:
 * 27.5 -> 27.5
 * 31 -> 31
 * 0.5 -> 0.5
 *
 * Важно: не превращаем 0.5 в 50, потому что в тарифах WB могут быть комиссии 0.5%.
 */
const parseCommissionPercent = (value: unknown) => {
  const parsed = num(value);
  if (parsed == null) return null;

  return parsed;
};

/**
 * Складские коэффициенты храним как множители:
 * 195 -> 1.95
 * 150 -> 1.5
 * 100 -> 1
 * 75 -> 0.75
 * 2.25 -> 2.25
 * 1.95 -> 1.95
 */
const parseWarehouseCoefficient = (value: unknown) => {
  const parsed = num(value);
  if (parsed == null) return null;

  if (parsed > 10) {
    return parsed / 100;
  }

  return parsed;
};

const normalizeText = (value: string) =>
  value.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();

const normalizeColumnName = (value: string) =>
  value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[%.,:;()\-_/\\\s]+/g, "")
    .trim();

const getCell = (
  row: Record<string, unknown>,
  possibleNames: string[],
): unknown => {
  for (const name of possibleNames) {
    if (row[name] != null && row[name] !== "") {
      return row[name];
    }
  }

  const normalizedNames = possibleNames.map(normalizeColumnName);

  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = normalizeColumnName(key);

    if (normalizedNames.includes(normalizedKey) && value !== "") {
      return value;
    }
  }

  return null;
};

const getWarehouseKey = (label: string): WarehouseKey | null => {
  const normalized = normalizeText(label);

  if (normalized.includes("коледино")) return "koledino";
  if (normalized.includes("подольск")) return "podolsk";
  if (normalized.includes("тула")) return "tula";
  if (normalized.includes("казань")) return "kazan";
  if (normalized.includes("краснодар")) return "krasnodar";
  if (normalized.includes("невинномысск")) return "nevinnomyssk";
  if (normalized.includes("екатеринбург")) return "ekaterinburg";

  return null;
};

const isSpecialWarehouseRow = (label: string) => {
  const normalized = normalizeText(label);

  return (
    normalized.includes(": питание") ||
    (normalized.includes(" питание") && normalized.includes(":")) ||
    normalized.includes("сгт") ||
    normalized.includes("кгт") ||
    normalized.includes("фарма") ||
    normalized.includes("ювелир") ||
    normalized.includes("fashion") ||
    normalized.includes("обувь")
  );
};

const isBetterWarehouseCandidate = (
  current: WarehouseCandidate | undefined,
  next: WarehouseCandidate,
) => {
  if (!current) return true;

  /**
   * Обычные строки склада всегда приоритетнее спецстрок:
   * - не берём ": Питание", если есть обычный склад;
   * - не берём СГТ / КГТ / Фарма / Ювелирка, если есть обычный склад.
   */
  if (current.isSpecial !== next.isSpecial) {
    return !next.isSpecial;
  }

  /**
   * Если обе строки одного типа, выбираем склад с меньшей логистикой.
   * Например для Екатеринбурга сравниваем:
   * - Екатеринбург - Перспективная 14
   * - Екатеринбург - Испытателей 14г
   */
  if (next.logistics !== current.logistics) {
    return next.logistics < current.logistics;
  }

  /**
   * Если логистика одинаковая — выбираем меньшее хранение.
   */
  if (next.storage !== current.storage) {
    return next.storage < current.storage;
  }

  /**
   * Если хранение одинаковое — лучше оставить строку, где есть FBS.
   */
  if (current.fbs == null && next.fbs != null) {
    return true;
  }

  return false;
};

const ensureFileExists = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
};

ensureFileExists(commissionPath);
ensureFileExists(warehousePath);

fs.mkdirSync(path.dirname(commissionOut), { recursive: true });
fs.mkdirSync(path.dirname(warehouseOut), { recursive: true });

/**
 * COMMISSION TARIFFS
 */

const commissionWorkbook = xlsx.readFile(commissionPath);
const commissionSheet =
  commissionWorkbook.Sheets[commissionWorkbook.SheetNames[0]];

if (!commissionSheet) {
  throw new Error("Commission workbook does not contain sheets");
}

const commissionRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(
  commissionSheet,
  { defval: "" },
);

const commissionTariffs: CommissionTariff[] = commissionRows.flatMap((row) => {
  const category = String(getCell(row, ["Категория", "category"]) ?? "").trim();

  const subject = String(getCell(row, ["Предмет", "subject"]) ?? "").trim();

  const fboCommissionRate = parseCommissionPercent(
    getCell(row, ["Склад WB, %", "Склад WB", "FBO", "Комиссия FBO"]),
  );

  const fbsCommissionRate = parseCommissionPercent(
    getCell(row, [
      "Склад продавца - везу на склад WB, %",
      "Склад продавца - везу на склад WB",
      "FBS",
      "Комиссия FBS",
    ]),
  );

  if (
    !category ||
    !subject ||
    fboCommissionRate == null ||
    fbsCommissionRate == null
  ) {
    return [];
  }

  return [
    {
      id: slugify(`${category}-${subject}`),
      category,
      subject,
      fboCommissionRate,
      fbsCommissionRate,
    },
  ];
});

fs.writeFileSync(
  commissionOut,
  JSON.stringify(commissionTariffs, null, 2),
  "utf8",
);

/**
 * WAREHOUSE TARIFFS
 */

const warehouseWorkbook = xlsx.readFile(warehousePath);

const warehouseSheet =
  warehouseWorkbook.Sheets["Короба"] ??
  warehouseWorkbook.Sheets[warehouseWorkbook.SheetNames[0]];

if (!warehouseSheet) {
  throw new Error("Warehouse workbook does not contain sheets");
}

const warehouseRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(
  warehouseSheet,
  { defval: "" },
);

const warehouseCandidates: Partial<Record<WarehouseKey, WarehouseCandidate>> =
  {};

for (const row of warehouseRows) {
  const label = String(
    getCell(row, ["Склад", "Название", "Склад WB", "Склад/СЦ"]) ?? "",
  ).trim();

  if (!label) continue;

  const key = getWarehouseKey(label);
  if (!key) continue;

  const logistics = parseWarehouseCoefficient(
    getCell(row, [
      "Логистика",
      "Коэффициент логистики",
      "Коэффициент логистики, %",
    ]),
  );

  const storage = parseWarehouseCoefficient(
    getCell(row, [
      "Хранение",
      "Коэффициент хранения",
      "Коэффициент хранения, %",
    ]),
  );

  const fbs = parseWarehouseCoefficient(
    getCell(row, ["FBS", "Коэффициент FBS", "Коэффициент FBS, %"]),
  );

  if (logistics == null || storage == null) {
    continue;
  }

  const candidate: WarehouseCandidate = {
    key,
    label,
    logistics,
    storage,
    fbs,
    isSpecial: isSpecialWarehouseRow(label),
  };

  if (DEBUG_EKB && key === "ekaterinburg") {
    console.log(
      `[EKB candidate] ${candidate.isSpecial ? "special" : "regular"} | ${label} | logistics=${logistics} | storage=${storage} | fbs=${fbs}`,
    );
  }

  if (isBetterWarehouseCandidate(warehouseCandidates[key], candidate)) {
    warehouseCandidates[key] = candidate;
  }
}

const warehouseTariffs: Partial<Record<WarehouseKey, WarehouseTariff>> = {};

for (const key of REQUIRED_WAREHOUSES) {
  const candidate = warehouseCandidates[key];

  if (!candidate) {
    console.warn(`Missing warehouse tariff for: ${key}`);
    continue;
  }

  warehouseTariffs[key] = {
    label: candidate.label,
    logistics: candidate.logistics,
    storage: candidate.storage,
    fbs: candidate.fbs,
  };
}

const warehouseTs = `export const warehouseTariffs = ${JSON.stringify(
  warehouseTariffs,
  null,
  2,
)} as const;\n`;

fs.writeFileSync(warehouseOut, warehouseTs, "utf8");

console.log(`Generated commission tariffs: ${commissionTariffs.length}`);
console.log(
  `Generated warehouse tariffs: ${Object.keys(warehouseTariffs).length}`,
);

for (const key of REQUIRED_WAREHOUSES) {
  const tariff = warehouseTariffs[key];

  if (!tariff) continue;

  console.log(
    `${key}: ${tariff.label} | logistics=${tariff.logistics} | storage=${tariff.storage} | fbs=${tariff.fbs}`,
  );
}
