/* eslint-disable linebreak-style */
module.exports = {
  'env': {
    'node': true,
    'es2021': true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'plugins': [
    '@typescript-eslint',
  ],
  'rules': {
    'max-lines-per-function': [
      'error',
      {
        'max': 10,
        'skipComments': true,
      },
    ],
    'max-params': [
      'error',
      2,
    ],
    'max-statements-per-line': [
      'error',
      {
        'max': 2,
      },
    ],
    'complexity': [
      'error',
      8,
    ],
    'no-shadow': 'error',
    'no-else-return': 'error',
    'no-console': 1,
    'indent': [
      'error',
      2,
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'quotes': [
      'error',
      'single',
    ],
    'semi': [
      'error',
      'never',
    ],
    'no-trailing-spaces': [
      'error'
    ]
  },
}
