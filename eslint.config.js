// @ts-check
import eslint from '@eslint/js';
import eslintPrettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('typescript-eslint').InfiniteDepthConfigWithExtends} */
const commonConfig = {
  extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
  plugins: {
    'simple-import-sort': simpleImportSort,
    prettier: eslintPrettier,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'simple-import-sort/imports': 'error',
    'prettier/prettier': 'error',
  },
};

/** @type {import('typescript-eslint').InfiniteDepthConfigWithExtends} */
const scriptsConfig = {
  files: ['scripts/*.js'],
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
};

/** @type {import('typescript-eslint').InfiniteDepthConfigWithExtends} */
const serverConfig = {
  files: ['server/**/*.ts'],
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.jest,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
  },
};

/** @type {import('typescript-eslint').InfiniteDepthConfigWithExtends} */
const difyConfig = {
  files: ['dify-sdk/**/*.ts'],
  rules: {
    '@typescript-eslint/no-empty-object-type': 'off',
  },
};

export default tseslint.config(
  commonConfig,
  scriptsConfig,
  serverConfig,
  difyConfig,
  {
    ignores: ['**/dist/**'],
  },
);
