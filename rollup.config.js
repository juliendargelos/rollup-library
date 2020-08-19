import autoExternal from 'rollup-plugin-auto-external'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import cleaner from 'rollup-plugin-cleaner'
import alias from '@rollup/plugin-alias'
import ts from 'rollup-plugin-ts'
import { terser } from 'rollup-plugin-terser'
import { eslint } from 'rollup-plugin-eslint'

import pkg from './package.json'
import tsconfig from './tsconfig.json'

const input = 'src/index.ts'

const plugins = [
  autoExternal(),
  alias({
    resolve: ['.ts'],
    entries: Object
      .entries(tsconfig.compilerOptions.paths)
      .map(([find, [replacement]]) => ({ find, replacement }))
  })
]

export default [
  {
    input,
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true }
    ],
    plugins: [
      ...plugins,
      eslint(),
      ts(),
      cleaner({ targets: [pkg.main.replace(/\/[^\/]+$/, '')] }),
    ]
  },

  {
    input,
    output: {
      file: pkg.browser,
      format: 'umd',
      sourcemap: true,
      name: pkg.name
        .split(/[^a-z0-9]+/i)
        .map(part => part && part[0].toUpperCase() + part.slice(1))
        .join('')
    },
    plugins: [
      ...plugins,
      ts({ transpileOnly: true }),
      nodeResolve({ extensions: ['.ts', '.js'] }),
      commonjs(),
      terser()
    ]
  }
]
