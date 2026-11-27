import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync } from 'node:fs';

const limit = 60;
const sourceFile = /\.(?:[cm]?[jt]sx?|vue|css|s[ac]ss|less|html?|sql|sh)$/i;
const base = process.env.CHECK_BASE || 'HEAD';

function gitPaths(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).split('\0').filter(Boolean);
}

const paths = new Set([
  ...gitPaths(['diff', '--name-only', '-z', '--diff-filter=ACMRT', base, '--']),
  ...gitPaths(['ls-files', '--others', '--exclude-standard', '-z']),
]);

let checked = 0;
for (const path of paths) {
  if (!sourceFile.test(path) || !lstatSync(path).isFile()) continue;
  checked++;
  const content = readFileSync(path, 'utf8');
  const lines = (content.match(/\n/g) || []).length + Number(content.length > 0 && !content.endsWith('\n'));
  if (lines > limit) {
    console.error(`${path}: ${lines} lines (limit ${limit})`);
    process.exitCode = 1;
  }
}
console.log(`Checked ${checked} changed source files against ${base}.`);
