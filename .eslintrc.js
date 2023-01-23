// eslint-disable-next-line functional/immutable-data
module.exports = {
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        },
      },
    },
    root: true,
    parser: '@typescript-eslint/parser',
    env: {
      node: true,
      commonjs: true,
      es6: true,
      mocha: true,
    },
    plugins: [
      '@typescript-eslint',
      'functional',
      'import',
      'modules-newline',
    ],
    extends: [
      'airbnb-typescript/base',
      'plugin:functional/recommended',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
    ],
    parserOptions: {
      project: './tsconfig.json',
      sourceType: 'module',
      ecmaVersion: '2017',
      // extraFileExtensions: ['.cjs'],
    },
    rules: {
      //Require let or const instead of var
       "no-var":["error"],
      //Require const declarations for variables that are never reassigned after declared
      "prefer-const": true,
      // disallow modifying variables that are declared using const
       "no-const-assign": 2,
       //Disallow new operators outside of assignments or comparisons
       "eslint no-new": "error" ,
       "object-literal-key-quotes": [true, "always"],
       //This rule disallows Array constructors.
       "no-array-constructor": "error",
       //Use object destructuring when accessing and using multiple properties of an object
       "prefer-destructuring": ["error", {
          "array": true,
          "object": true
        }, {
          "enforceForRenamedProperties": false
        }],
        //Use single quotes ''
        quotes: [
            'warn',
            'single',
          ],

  }
}