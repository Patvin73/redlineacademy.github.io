const fs = require('fs');
const path = require('path');

function resolveInputPath(inputPath) {
  if (!inputPath) {
    throw new Error('Missing --input argument. Example: --input data/seo-keywords.sample.json');
  }
  const resolved = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Input file not found: ${resolved}`);
  }
  return resolved;
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((cell) => cell.trim());
    const item = {};
    headers.forEach((header, index) => {
      item[header] = cells[index] || '';
    });
    return item;
  });
}

function loadKeywordRows(inputFilePath) {
  const ext = path.extname(inputFilePath).toLowerCase();
  const raw = fs.readFileSync(inputFilePath, 'utf8');

  let records = [];
  if (ext === '.json') {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      records = parsed;
    } else if (Array.isArray(parsed.keywords)) {
      records = parsed.keywords;
    } else {
      throw new Error('Invalid JSON format. Use array or { "keywords": [] }');
    }
  } else if (ext === '.csv') {
    records = parseCsv(raw);
  } else {
    throw new Error(`Unsupported input extension: ${ext}. Use .json or .csv`);
  }

  return records.map((record, index) => normalizeRecord(record, index));
}

function normalizeRecord(record, index) {
  const keyword = (record.keyword || '').trim();
  const searchIntent = (record.search_intent || record.searchIntent || '').trim();
  const location = (record.location || 'Indonesia').trim();

  if (!keyword) {
    throw new Error(`Missing "keyword" at row ${index + 1}`);
  }
  if (!searchIntent) {
    throw new Error(`Missing "search intent" at row ${index + 1} for keyword "${keyword}"`);
  }

  return {
    keyword,
    searchIntent,
    location: location || 'Indonesia',
  };
}

module.exports = {
  loadKeywordRows,
  resolveInputPath,
};
