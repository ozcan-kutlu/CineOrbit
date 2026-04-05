const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const enPath = path.join(localesDir, 'en.json');
const trPath = path.join(localesDir, 'tr.json');

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const flattenKeys = (obj, prefix = '') => Object.entries(obj).reduce((acc, [key, value]) => {
  const fullKey = prefix ? `${prefix}.${key}` : key;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return acc.concat(flattenKeys(value, fullKey));
  }
  return acc.concat(fullKey);
}, []);

const getDiff = (source, target) => source.filter((key) => !target.includes(key));

try {
  const en = readJson(enPath);
  const tr = readJson(trPath);

  const enKeys = flattenKeys(en).sort();
  const trKeys = flattenKeys(tr).sort();

  const missingInTr = getDiff(enKeys, trKeys);
  const missingInEn = getDiff(trKeys, enKeys);

  if (!missingInTr.length && !missingInEn.length) {
    console.log('[i18n] OK: en.json and tr.json have matching key sets.');
    process.exit(0);
  }

  console.error('[i18n] Key mismatch detected.');
  if (missingInTr.length) {
    console.error(`\nMissing in tr.json (${missingInTr.length}):`);
    missingInTr.forEach((key) => console.error(`- ${key}`));
  }
  if (missingInEn.length) {
    console.error(`\nMissing in en.json (${missingInEn.length}):`);
    missingInEn.forEach((key) => console.error(`- ${key}`));
  }
  process.exit(1);
} catch (error) {
  console.error('[i18n] Failed to validate locale files.');
  console.error(error.message);
  process.exit(1);
}
