module.exports = {
  "env": {
    "node": true,
    "es2021": true,
  },
  "globals": {
    "Deno": "readonly",
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "ignorePatterns": ["templates/**/*"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
  },
  "plugins": [
    "@typescript-eslint",
  ],
  "rules": {
    "linebreak-style": ["error", "unix"],
    "no-return-await": "error",
    "require-await": "error",
    "no-async-promise-executor": "error",
    "max-lines-per-function": [
      "warn",
      {
        "max": 11,
        "skipComments": true,
        "skipBlankLines": true,
      },
    ],
    "max-params": [
      "error",
      3,
    ],
    "max-statements-per-line": [
      "error",
      {
        "max": 2,
      },
    ],
    "complexity": [
      "error",
      8,
    ],
    "no-shadow": "error",
    "no-else-return": "error",
    "no-console": 2,
    "indent": [
      "error",
      2,
    ],
    "quotes": [
      "error",
      "double",
    ],
    "semi": [
      "error",
      "never",
    ],
    "no-trailing-spaces": [
      "error",
    ],
  },
}
