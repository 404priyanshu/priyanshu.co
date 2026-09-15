import eslint from '@eslint/js'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import _import from 'eslint-plugin-import'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import react from 'eslint-plugin-react'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'

const config = [
  // eslint-config-next ships flat config from v16 and owns the react,
  // react-hooks, import and jsx-a11y plugins. Redeclaring any of them below is
  // a "Cannot redefine plugin" error, so their recommended rules are spread as
  // bare rules instead.
  ...nextCoreWebVitals,
  eslint.configs.recommended,
  prettierRecommended,
  {
    files: ['**/*.js?(x)'],
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.node
      },
      ecmaVersion: 6,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
          paths: ['src']
        },
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx']
        }
      }
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ..._import.flatConfigs.recommended.rules,
      'no-console': ['error', { allow: ['error', 'info'] }],
      'react/no-unescaped-entities': 0,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 0,
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      '@next/next/no-img-element': 0,
      'import/no-named-as-default': 0
    }
  },
  {
    files: ['*.mjs'],
    rules: {
      'import/no-anonymous-default-export': 'off'
    }
  },
  { ignores: ['.next/*'] }
]

export default config
