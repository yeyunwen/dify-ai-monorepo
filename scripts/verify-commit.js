// @ts-check
import pico from 'picocolors';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const msgPath = path.resolve('.git/COMMIT_EDITMSG');
const msg = readFileSync(msgPath, 'utf-8').trim();

const commitRE =
  /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/;

if (!commitRE.test(msg)) {
  console.log();
  console.error(
    `  ${pico.white(pico.bgRed(' ERROR '))} ${pico.red(`invalid commit message format.`)}\n\n` +
      pico.red(
        `  Proper commit message format is required for automated changelog generation. Examples:\n\n`,
      ) +
      `    ${pico.green(`feat(compiler): add 'comments' option`)}\n` +
      `    ${pico.green(`fix(v-model): handle events on blur (close #28)`)}\n\n` +
      pico.red(`  See scripts/verify-commit.js for commit message regex.\n`),
  );
  process.exit(1);
}
