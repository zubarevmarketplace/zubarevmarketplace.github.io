import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const distIndexPath = resolve('dist/index.html');
const canonicalCalculatorUrl = 'https://zubarevlab.ru/calculator';
const routeDirs = [resolve('dist/calculator'), resolve('dist/tools/wb-calculator')];

function replaceWithCount(input: string, search: string, replacement: string, minCount: number, label: string): string {
  const count = input.split(search).length - 1;
  if (count < minCount) {
    throw new Error(`Не найдено достаточно вхождений для ${label}. Ожидалось минимум ${minCount}, найдено ${count}.`);
  }
  return input.split(search).join(replacement);
}

async function main() {
  let html = await readFile(distIndexPath, 'utf8');

  html = replaceWithCount(html, '<title>Zubarev Lab — инструменты и услуги для продавцов Wildberries</title>', '<title>Калькулятор юнит-экономики Wildberries — бесплатный расчёт прибыли WB</title>', 1, 'title');
  html = replaceWithCount(html, `name="description"
      content="Инструменты, аналитика и услуги для продавцов Wildberries: юнит-экономика, логистика, комиссии, прибыль, продвижение и рост продаж."`, `name="description"
      content="Бесплатный калькулятор юнит-экономики Wildberries: рассчитайте прибыль, маржу, ROI, комиссии WB, логистику, хранение, рекламу, налоги и СПП."`, 1, 'meta description');
  html = replaceWithCount(html, 'href="https://zubarevlab.ru/"', `href="${canonicalCalculatorUrl}"`, 1, 'canonical');
  html = replaceWithCount(html, 'content="Zubarev Lab — инструменты и услуги для продавцов Wildberries"', 'content="Калькулятор юнит-экономики Wildberries — бесплатный расчёт прибыли WB"', 2, 'og/twitter title');
  html = replaceWithCount(html, 'content="Инструменты, аналитика и услуги для продавцов Wildberries: юнит-экономика, логистика, комиссии, прибыль, продвижение и рост продаж."', 'content="Бесплатный калькулятор юнит-экономики WB: прибыль, маржа, ROI, комиссии, логистика, хранение, реклама, налоги и СПП."', 2, 'og/twitter description');
  html = replaceWithCount(html, 'content="https://zubarevlab.ru/"', `content="${canonicalCalculatorUrl}"`, 2, 'og/twitter url');
  html = replaceWithCount(html, 'content="https://zubarevlab.ru/og-image.jpg"', 'content="https://zubarevlab.ru/og-wb-calculator.jpg"', 2, 'og/twitter image');

  await Promise.all(
    routeDirs.map(async (dir) => {
      await mkdir(dir, { recursive: true });
      await writeFile(resolve(dir, 'index.html'), html, 'utf8');
    }),
  );
}

main().catch((error) => {
  console.error('[generate-static-route-meta] Ошибка:', error instanceof Error ? error.message : error);
  process.exit(1);
});
