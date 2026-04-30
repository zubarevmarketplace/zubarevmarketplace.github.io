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

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
const num = (v: unknown) => {
  if (v == null || v === "") return null;
  const s = String(v).replace("%", "").replace(",", ".").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const normalizePercent = (n: number | null) => {
  if (n == null) return null;
  if (n > 100) return n / 100;
  return n;
};

if (!fs.existsSync(commissionPath))
  throw new Error(`Missing file: ${commissionPath}`);
if (!fs.existsSync(warehousePath))
  throw new Error(`Missing file: ${warehousePath}`);

const commissionWb = xlsx.readFile(commissionPath);
const commissionSheet = commissionWb.Sheets[commissionWb.SheetNames[0]];
const commissionRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(
  commissionSheet,
  { defval: "" },
);

const tariffs = commissionRows.flatMap((r) => {
  const category = String(r["Категория"] ?? "").trim();
  const subject = String(r["Предмет"] ?? "").trim();
  const fbo = normalizePercent(num(r["Склад WB, %"]));
  const fbs = normalizePercent(num(r["Склад продавца - везу на склад WB, %"]));
  if (!category || !subject || fbo == null || fbs == null) return [];
  return [
    {
      id: slugify(`${category}-${subject}`),
      category,
      subject,
      fboCommissionRate: fbo,
      fbsCommissionRate: fbs,
    },
  ];
});

fs.writeFileSync(commissionOut, JSON.stringify(tariffs, null, 2), "utf8");

const warehouseWb = xlsx.readFile(warehousePath);
const sheet =
  warehouseWb.Sheets["Короба"] ?? warehouseWb.Sheets[warehouseWb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
  defval: "",
});

const map: Record<
  string,
  { label: string; logistics: number; storage: number; fbs: number | null }
> = {};
const aliases: Record<string, string> = {
  коледино: "koledino",
  подольск: "podolsk",
  тула: "tula",
  казань: "kazan",
  краснодар: "krasnodar",
  невинномысск: "nevinnomyssk",
  екатеринбург: "ekaterinburg",
};

for (const r of rows) {
  const label = String(r["Склад"] ?? r["Название"] ?? "").trim();
  if (!label) continue;
  const key = aliases[label.toLowerCase()];
  if (!key) continue;
  const logistics = normalizePercent(
    num(r["Логистика"] ?? r["Коэффициент логистики, %"]),
  );
  const storage = normalizePercent(
    num(r["Хранение"] ?? r["Коэффициент хранения, %"]),
  );
  const fbs = normalizePercent(num(r["FBS"] ?? r["Коэффициент FBS, %"]));
  if (logistics == null || storage == null) continue;
  map[key] = { label, logistics, storage, fbs };
}

const ts = `export const warehouseTariffs = ${JSON.stringify(map, null, 2)} as const;\n`;
fs.writeFileSync(warehouseOut, ts, "utf8");

console.log(`Generated commission tariffs: ${tariffs.length}`);
console.log(`Generated warehouse tariffs: ${Object.keys(map).length}`);
