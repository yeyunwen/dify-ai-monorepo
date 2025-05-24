/**
 * copy from conventional-changelog-angular
 */

import createPreset from 'conventional-changelog-angular';

const COMMIT_HASH_LENGTH = 7;
const DIFY_SDK_SCOPE = 'dify-sdk';

export default createPreset().then((preset) => {
  return {
    ...preset,
    writer: {
      ...preset.writer,
      transform: (commit, context) => {
        if (commit.scope !== DIFY_SDK_SCOPE) {
          return;
        }

        let discard = true;
        const notes = commit.notes.map((note) => {
          discard = false;

          return {
            ...note,
            title: 'BREAKING CHANGES',
          };
        });
        let { type } = commit;

        if (commit.type === 'feat') {
          type = '✨ Features | 新功能';
        } else if (commit.type === 'fix') {
          type = '🐛 Bug Fixes | Bug 修复';
        } else if (commit.type === 'perf') {
          type = '⚡ Performance Improvements | 性能优化';
        } else if (commit.type === 'revert' || commit.revert) {
          type = '⏪ Reverts | 回退';
        } else if (discard) {
          return undefined;
        } else if (commit.type === 'docs') {
          type = '📝 Documentation | 文档';
        } else if (commit.type === 'style') {
          type = '🎨 Styles | 样式';
        } else if (commit.type === 'refactor') {
          type = '🔄 Code Refactoring | 代码重构';
        } else if (commit.type === 'test') {
          type = '🧪 Tests | 测试';
        } else if (commit.type === 'build') {
          type = '🏗️ Build System | 构建系统';
        } else if (commit.type === 'ci') {
          type = '🔄 Continuous Integration | 持续集成';
        }

        const scope = '';
        const shortHash =
          typeof commit.hash === 'string'
            ? commit.hash.substring(0, COMMIT_HASH_LENGTH)
            : commit.shortHash;
        const issues = [];
        let { subject } = commit;

        if (typeof subject === 'string') {
          let url = context.repository
            ? `${context.host}/${context.owner}/${context.repository}`
            : context.repoUrl;

          if (url) {
            url = `${url}/issues/`;
            // Issue URLs.
            subject = subject.replace(/#([0-9]+)/g, (_, issue) => {
              issues.push(issue);
              return `[#${issue}](${url}${issue})`;
            });
          }

          if (context.host) {
            // User URLs.
            subject = subject.replace(
              /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
              (_, username) => {
                if (username.includes('/')) {
                  return `@${username}`;
                }

                return `[@${username}](${context.host}/${username})`;
              },
            );
          }
        }

        // remove references that already appear in the subject
        const references = commit.references.filter(
          (reference) => !issues.includes(reference.issue),
        );

        return {
          notes,
          type,
          scope,
          shortHash,
          subject,
          references,
        };
      },
    },
  };
});
