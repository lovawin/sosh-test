module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'airbnb-base',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Indentation and Spacing
    'indent': ['error', 2],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    'object-curly-spacing': ['error', 'always'],
    'comma-spacing': ['error', { before: false, after: true }],

    // Code Style
    'camelcase': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'quotes': ['error', 'single', { allowTemplateLiterals: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],

    // Best Practices
    'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
    'no-param-reassign': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],

    // Error Prevention
    'no-unused-expressions': 'error',
    'no-undefined': 'error',
    'no-use-before-define': ['error', { functions: false }],

    // Node.js specific
    'callback-return': 'error',
    'handle-callback-err': 'error',
    'no-path-concat': 'error',
    'no-process-exit': 'error',

    // ES6 Features
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'always'],
    'arrow-spacing': ['error', { before: true, after: true }],
    'no-duplicate-imports': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],

    // Async/Await
    'no-return-await': 'error',
    'require-await': 'error',

    // Project-specific
    'max-len': ['error', { 
      code: 100,
      ignoreComments: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true
    }],
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off'
  },
  overrides: [
    {
      // Test files
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-unused-expressions': 'off',
        'max-len': 'off'
      }
    }
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js']
      }
    }
  }
};
