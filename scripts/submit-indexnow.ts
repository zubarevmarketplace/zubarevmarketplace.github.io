import { readFile } from 'node:fs/promises';
import path from 'node:path';

const HOST = 'zubarevlab.ru';
const BASE_URL = `https://${HOST}`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const URL_LIST = [
  `${BASE_URL}/`,
  `${BASE_URL}/tools/wb-calculator`,
];

async function main() {
  const key = process.env.INDEXNOW_KEY?.trim();

  if (!key) {
    throw new Error('Missing INDEXNOW_KEY');
  }

  const keyFilePath = path.resolve('public', `${key}.txt`);
  const keyFileContent = (await readFile(keyFilePath, 'utf-8')).trim();

  if (keyFileContent !== key) {
    throw new Error(`Invalid key file content in ${keyFilePath}. Expected the file to contain INDEXNOW_KEY.`);
  }

  const payload = {
    host: HOST,
    key,
    keyLocation: `${BASE_URL}/${key}.txt`,
    urlList: URL_LIST,
  };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`IndexNow request failed with ${response.status}: ${errorBody || response.statusText}`);
  }

  console.log(`IndexNow submission completed: ${URL_LIST.length} URL(s) sent.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
