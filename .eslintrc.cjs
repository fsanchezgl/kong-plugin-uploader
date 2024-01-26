module.exports = {
  root: true,
  plugins: ['@typescript-eslint'],
  extends: [
    'airbnb-base',
    'plugin:import/typescript',
    'plugin:import/recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    es6: true,
    node: true,
  },
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      },
    ],
    'import/no-extraneous-dependencies': 'warn',
    'no-unused-vars': 'off',
    'prefer-object-spread': 'off',
    'dot-notation': 'warn',
    'no-unused-expressions': 'off',
    'no-underscore-dangle': 'off',
    'import/prefer-default-export': 'off',
    'no-shadow': 'off',
    'class-methods-use-this': 'off',
    'no-restricted-syntax': 'off',
    'max-classes-per-file': 'off',
    'no-await-in-loop': 'warn',
    'default-param-last': 'warn',
    'no-restricted-exports': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
      },
    },
    {
      files: ['**/*.spec.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.spec.ts'],
    },
    'import/resolver': {
      node: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
      },
      typescript: {
        project: '**/tsconfig.json',
      },
    },
  },
};
