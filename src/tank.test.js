/* eslint-disable max-lines-per-function */
import {
  assert,
  assertEquals,
  fail,
} from 'https://deno.land/std/testing/asserts.ts'

import { tank } from './cli.ts'

const mock = (function () {
  let commands = []
  let directories = []
  let files = []
  let removals = []
  const create_directories = (args) => {
    directories.push(args)
  }
  const create_files = (args) => {
    files.push(args)
  }
  const exec = (args) => {
    commands.push(args)
  }
  const remove = (args) => {
    removals.push(args)
  }
  const create_windows_bat = () => 'noop'

  const get_commands = (spec) => commands[spec.call]
  const get_directories = (spec) => directories[spec.call]
  const get_files = (spec) => files[spec.call]
  const get_removals = (spec) => removals[spec.call]
  const restore = () => {
    commands = []
    directories = []
    files = []
    removals = []
  }

  return {
    get_commands,
    get_directories,
    get_files,
    get_removals,
    restore,
    create_windows_bat,
    create_directories,
    create_files,
    exec,
    remove,
  }
})()

Deno.test('tank can create a fancy blog', async () => {
  await tank(mock).blog_handler({ name: 'test' })

  try {
    assertEquals(mock.get_files({ call: 0 }).name, 'test')
    assertEquals(mock.get_directories({ call: 0 }), ['images'])
    assertEquals(mock.get_files({ call: 0 }).files, [
      'index.html',
      'styles.css',
      '.gitignore',
    ])
  } finally {
    mock.restore()
  }
})

Deno.test('tank can create an unfancy blog on Windows', async () => {
  await tank(mock).blog_handler({ name: 'test', bs: true })

  try {
    assertEquals(mock.get_files({ call: 0 }).name, 'test')
    assertEquals(mock.get_directories({ call: 0 }), ['images'])
    assertEquals(mock.get_files({ call: 0 }).files, [
      'index.html',
      'styles.css',
      '.gitignore',
    ])

    assertEquals(mock.get_directories({ call: 1 }), ['public'])
    assertEquals(mock.get_files({ call: 1 }).files, [
      'package.json',
      'vite.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      'main.js',
    ])

    assertEquals(mock.get_files({ call: 1 }).name, 'test')
    assertEquals(mock.get_commands({ call: 0 }), ['./install.bat'])
    assertEquals(mock.get_removals({ call: 0 }), './install.bat')
    assertEquals(mock.get_commands({ call: 1 }), [
      'cmd',
      '/c',
      'echo',
      'Try cd test && \x1b[32mnpm run dev\x1b[39m!',
    ])
  } finally {
    mock.restore()
  }
})

Deno.test('tank can add vite config inside a directory on Windows', async () => {
  await tank(mock).vite_handler()

  try {
    assertEquals(mock.get_files({ call: 0 }).name, undefined)
    assertEquals(mock.get_directories({ call: 0 }), ['public'])
    assertEquals(mock.get_files({ call: 0 }).files, [
      'package.json',
      'vite.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      'main.js',
    ])

    assertEquals(mock.get_commands({ call: 0 }), ['./install.bat'])
    assertEquals(mock.get_removals({ call: 0 }), './install.bat')
    assertEquals(mock.get_commands({ call: 1 }), [
      'cmd',
      '/c',
      'echo',
      'Try \x1b[32mnpm run dev\x1b[39m!',
    ])
  } finally {
    mock.restore()
  }
})
