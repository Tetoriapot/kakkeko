import { spawnSync } from 'node:child_process';
import {
  readFileSync,
  writeFileSync,
  appendFileSync,
  existsSync,
} from 'node:fs';
const phase = process.argv[2];
if (!/^\d+$/.test(phase ?? '')) throw new Error('Phase番号が必要です');
const npm =
  process.env.npm_execpath ??
  (existsSync('.tools/node_modules/npm/bin/npm-cli.js')
    ? '.tools/node_modules/npm/bin/npm-cli.js'
    : null);
if (!npm) throw new Error('npm run check:phase -- <番号> で実行してください');
for (const script of phase === '20'
  ? ['build', 'test', 'lint', 'format:check', 'test:e2e']
  : ['build', 'test']) {
  const result = spawnSync(process.execPath, [npm, 'run', script], {
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const tasks = readFileSync('TASKS.md', 'utf8');
const section = new RegExp(`(# ${phase}\\.[\\s\\S]*?)(?=\\n# \\d+\\.|$)`);
writeFileSync(
  'TASKS.md',
  tasks.replace(section, (text) => text.replaceAll('- [ ]', '- [x]')),
);
appendFileSync(
  'IMPLEMENTATION_LOG.md',
  `\n- Phase ${phase}: build / test 成功 (${new Date().toISOString()})\n`,
);
