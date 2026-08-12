import { readFile } from 'node:fs/promises';

const files = {
  index: await readFile(new URL('../index.html', import.meta.url), 'utf8'),
  admin: await readFile(new URL('../admin.html', import.meta.url), 'utf8'),
  main: await readFile(new URL('../src/main.ts', import.meta.url), 'utf8'),
  adminScript: await readFile(new URL('../src/admin.ts', import.meta.url), 'utf8'),
};

const ids = new Set([...files.index, ...files.admin].join('').matchAll(/\bid=["']([^"']+)["']/g));
const knownIds = new Set([...ids].map(match => match[1]));
// Some IDs are intentionally created by fetchSpotify() and other renderers.
for (const source of [files.main, files.adminScript]) {
  for (const match of source.matchAll(/id=["']([^"']+)["']/g)) knownIds.add(match[1]);
}
const missing = [];

for (const [label, source] of [['src/main.ts', files.main], ['src/admin.ts', files.adminScript]]) {
  for (const match of source.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)) {
    if (!knownIds.has(match[1])) missing.push(`${label}: #${match[1]}`);
  }
}

const inlineHandlers = [...files.index, ...files.admin].join(' ').matchAll(/(?:onclick|oninput|onkeydown)=["']([^"']+)["']/g);
const globals = new Set([...files.main.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g), ...files.adminScript.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1]));
for (const match of inlineHandlers) {
  const calls = match[1].matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g);
  for (const call of calls) {
    const name = call[1];
    if (!['if', 'open', 'alert'].includes(name) && !globals.has(name) && !['changeQuote'].includes(name)) {
      missing.push(`inline handler: ${name}()`);
    }
  }
}

if (missing.length) {
  console.error('DOM reference check failed:');
  for (const item of [...new Set(missing)]) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`DOM reference check passed (${knownIds.size} IDs inspected).`);
