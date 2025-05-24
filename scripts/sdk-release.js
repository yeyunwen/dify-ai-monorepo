// @ts-check
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { parseArgs } from 'node:util';

import enquirer from 'enquirer';
import pico from 'picocolors';
import semver from 'semver';

import { exec } from './utils.js';

const { prompt } = enquirer;
const currentVersion = createRequire(import.meta.url)(
  '../dify-sdk/package.json',
).version;
const preId = semver.prerelease(currentVersion)?.[0];

/** @type {ReadonlyArray<import('semver').ReleaseType>} */
const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId
    ? /** @type {const} */ (['prepatch', 'preminor', 'premajor', 'prerelease'])
    : []),
];

const inc = (/** @type {import('semver').ReleaseType} */ i) =>
  semver.inc(currentVersion, i, typeof preId === 'string' ? preId : undefined);

const step = (/** @type {string} */ msg) => console.log(pico.cyan(msg));
const run = async (
  /** @type {string} */ bin,
  /** @type {ReadonlyArray<string>} */ args,
  /** @type {import('node:child_process').SpawnOptions} */ opts = {},
) => exec(bin, args, { stdio: 'inherit', ...opts });

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    publish: {
      type: 'boolean',
      default: false,
    },
    publishOnly: {
      type: 'boolean',
      default: false,
    },
    registry: {
      type: 'string',
    },
  },
});

const runTest = async () => {
  await run('pnpm', ['run', 'test']);
};

const updateVersion = async (/** @type {string} */ version) => {
  const pkgPath = path.resolve('../dify-sdk/package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
};

const buildPackages = async () => {
  await run('pnpm', ['run', 'build']);
};

const publishPackage = async () => {
  try {
    await run('pnpm', [
      'publish',
      '--access',
      'public',
      '--no-git-checks', // 禁用 Git 检查，已经手动检查了 dify-sdk 目录
      ...(args.registry ? ['--registry', args.registry] : []),
    ]);
    step('\nPackages published');
  } catch (/** @type {any} */ e) {
    if (e.message?.match(/previously published/)) {
      console.log(pico.red(`Skipping already published: dify-node-sdk`));
    } else {
      throw e;
    }
  }
};
const main = async () => {
  let targetVersion = positionals[0];
  if (!targetVersion) {
    /** @type {{ release: string }} */
    const { release } = await prompt({
      type: 'select',
      name: 'release',
      message: 'Enter the version to release',
      choices: versionIncrements.map((v) => ({
        name: `${v} (${inc(v)})`,
        value: inc(v),
      })),
    });
    targetVersion = release.match(/\((.*)\)/)?.[1] ?? '';
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`);
  }

  /** @type {{ yes: boolean }} */
  const { yes: confirmRelease } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`,
  });

  if (!confirmRelease) {
    return;
  }

  step('Running tests');
  await runTest();

  step('Updating version');
  await updateVersion(targetVersion);
  step('Version updated');

  // generate changelog
  step('\nGenerating changelog...');
  await run(`pnpm`, ['run', 'changelog']);

  /** @type {{ yes: boolean }} */
  const { yes: changelogOk } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Changelog generated. Does it look good? you can edit it manually before entry yes`,
  });

  if (!changelogOk) {
    return;
  }

  step('\nUpdating lockfile...');
  await run(`pnpm`, ['install', '--prefer-offline']);

  const { stdout } = await run('git', ['diff', '--', '../dify-sdk'], {
    stdio: 'pipe',
  });
  if (stdout) {
    step('\nCommitting changes...');
    await run('git', ['add', '--', '../dify-sdk/package.json']);
    await run('git', ['add', '--', '../dify-sdk/CHANGELOG.md']);
    await run('git', ['commit', '-m', `release: v${targetVersion}`]);
  } else {
    console.log('No changes to commit in dify-sdk directory.');
  }

  // 发布前检查 dify-sdk 目录是否有未提交的更改
  const { stdout: gitStatus } = await run(
    'git',
    ['status', '--porcelain', '../dify-sdk'],
    {
      stdio: 'pipe',
    },
  );

  if (gitStatus) {
    console.log(pico.yellow('Warning: dify-sdk 目录有未提交的更改。'));
    /** @type {{ yes: boolean }} */
    const { yes: continuePublish } = await prompt({
      type: 'confirm',
      name: 'yes',
      message: '是否仍要继续发布？',
    });

    if (!continuePublish) {
      return;
    }
  }

  // publish packages
  if (args.publish) {
    step('\nBuilding packages...');
    await buildPackages();

    step('\nPublishing packages...');
    await publishPackage();
  }

  // push to GitHub
  step('\nPushing to GitHub...');
  await run('git', ['tag', `v${targetVersion}`]);
  /** @type {{ yes: boolean }} */
  const { yes: push } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Push tag to GitHub?`,
  });

  if (push) {
    await run('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
    await run('git', ['push']);
    console.log(pico.green('Release completed!'));
  }
};

async function publishOnly() {
  const targetVersion = positionals[0];
  if (targetVersion) {
    updateVersion(targetVersion);
  }
  await buildPackages();
  await publishPackage();
}

const fnToRun = args.publishOnly ? publishOnly : main;

fnToRun().catch((err) => {
  console.error(err);
  process.exit(1);
});
