import { spawnSync } from 'node:child_process';

const checks = [
  ['Build', [process.env.npm_execpath, '--prefix', 'client', 'run', 'build']],
  ['Line count', ['scripts/check-lines.mjs']],
  ['Vue types', [process.env.npm_execpath, '--prefix', 'client', 'run', 'typecheck']],
];

for (const [label, args] of checks) {
  console.log(`\n--- ${label} ---`);
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exitCode = 1;
  console.log(`${label}: ${result.status === 0 ? 'PASS' : 'FAIL'}`);
}
