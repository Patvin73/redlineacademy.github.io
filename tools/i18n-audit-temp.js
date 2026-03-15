const fs = require('fs');
const path = require('path');

const ROOT = 'D:\\OneDrive\\Dokumen\\GitHub\\redlineacademy.github.io';
const pagesDir = path.join(ROOT, 'pages');
const files = [path.join(ROOT, 'index.html')]
  .concat(fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')).map(f => path.join(pagesDir, f)));

const letterRe = /[A-Za-zÀ-ÖØ-öø-ÿA-ž?-??-??-??-??-??-?]/;

function auditFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const tagRe = /<[^>]+>/g;
  let match;
  let idx = 0;
  let line = 1;
  let col = 1;
  const issues = [];
  const stack = [];

  function advance(str) {
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '\n') { line++; col = 1; }
      else { col++; }
    }
  }

  function inSkip() {
    return stack.some(s => s.skip);
  }

  function inI18n() {
    return stack.some(s => s.hasI18n);
  }

  while ((match = tagRe.exec(html)) !== null) {
    const text = html.slice(idx, match.index);
    if (text.trim() && letterRe.test(text) && !inSkip() && !inI18n()) {
      const snippet = text.replace(/\s+/g, ' ').trim();
      issues.push({ line, col, kind: 'text', snippet });
    }
    advance(text);

    const tag = match[0];
    const isClose = /^<\//.test(tag);
    const isComment = /^<!--/.test(tag);
    if (isComment) {
      advance(tag);
      idx = match.index + tag.length;
      continue;
    }
    if (isClose) {
      const tagName = tag.replace(/^<\//, '').replace(/>$/, '').trim().toLowerCase();
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tagName) { stack.splice(i, 1); break; }
      }
      advance(tag);
      idx = match.index + tag.length;
      continue;
    }

    const tagNameMatch = tag.match(/^<\s*([\w-]+)/);
    const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
    const hasI18n = /\bdata-i18n\b\s*=/.test(tag) || /\bdata-i18n\b/.test(tag);
    const placeholderMatch = tag.match(/\bplaceholder\s*=\s*(["'])(.*?)\1/);
    if ((tagName === 'input' || tagName === 'textarea') && placeholderMatch) {
      const placeholder = placeholderMatch[2];
      if (letterRe.test(placeholder) && !hasI18n) {
        issues.push({ line, col, kind: 'placeholder on <' + tagName + '>', snippet: placeholder.trim() });
      }
    }
    const skip = (tagName === 'script' || tagName === 'style');
    const selfClose = /\/>$/.test(tag) || ['input','img','br','meta','link'].includes(tagName);
    if (!selfClose) {
      stack.push({ tag: tagName, hasI18n: hasI18n || inI18n(), skip: skip });
    }
    advance(tag);
    idx = match.index + tag.length;
  }
  const tail = html.slice(idx);
  if (tail.trim() && letterRe.test(tail) && !inSkip() && !inI18n()) {
    const snippet = tail.replace(/\s+/g, ' ').trim();
    issues.push({ line, col, kind: 'text', snippet });
  }

  return issues;
}

const results = [];
for (const filePath of files) {
  const issues = auditFile(filePath);
  if (issues.length) {
    results.push({ filePath, issues });
  }
}

for (const result of results) {
  console.log(result.filePath);
  for (const issue of result.issues) {
    console.log('  L' + issue.line + ':' + issue.col + ' [' + issue.kind + '] ' + issue.snippet);
  }
  console.log('');
}
