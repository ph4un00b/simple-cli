/* eslint-disable max-lines-per-function */
import {
  assert,
  assertEquals,
  fail,
} from "https://deno.land/std/testing/asserts.ts"

import { tank } from "./tank.ts"
import { actionsMock as mock} from "./utils_test.ts"

Deno.test("tank can create a fancy blog", async () => {
  await tank(mock).blog_handler({ name: "test" })

  assertEquals(mock.files({ call: 0 }).name, "test")
  assertEquals(mock.directories({ call: 0 }), ["images"])
  assertEquals(mock.files({ call: 0 }).files, [
    "index.html",
    "styles.css",
    ".gitignore",
  ])

  mock.restore()
})

Deno.test("tank can create an unfancy blog on Windows", async () => {
  await tank(mock).blog_handler({
    name: "test",
    bs: true,
  })

  assertEquals(mock.files({ call: 0 }).name, "test")
  assertEquals(mock.directories({ call: 0 }), ["images"])
  assertEquals(mock.files({ call: 0 }).files, [
    "index.html",
    "styles.css",
    ".gitignore",
  ])

  assertEquals(mock.directories({ call: 1 }), ["public", "__tank__"])
  assertEquals(mock.files({ call: 1 }).files, [
    "package.json",
    "vite.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "main.js",
    "__tank__/defaults.json",
    "__tank__/nunjucks.vite.js",
    "__tank__/vite.js",
  ])

  assertEquals(mock.files({ call: 1 }).name, "test")
  assertEquals(mock.executed({ call: 0 }), [
    "cmd",
    "/c",
    "cd",
    "test",
    "&&",
    "cmd",
    "/c",
    "npm",
    "install",
  ])
  assertOutput("Try cd test && \x1b[32mnpm run dev\x1b[39m!")

  mock.restore()
})

Deno.test(
  "tank can add vite configs inside a directory on Windows",
  async () => {
    await tank(mock).vite_handler()

    assertViteConfigs()

    mock.restore()
  },
)

Deno.test("tank can create a html block", () => {
  tank(mock).generate_handler({ html: ["sidebar"] })

  const [file, content] = mock.file({ call: 0 })
  assertEquals(mock.dir({ call: 0 }), "blocks")
  assertEquals(file, "blocks/sidebar.html")
  assertEquals(content, "<h1>sidebar</h1>")

  const [name, index] = mock.block({ call: 0 })
  assertEquals(name, "sidebar")
  assertEquals(index, "index.html")

  mock.restore()
})

Deno.test("tank can create multiple html block at once", () => {
  tank(mock).generate_handler({
    html: ["header", "sidebar", "footer"],
  })

  assertHTMLBlock({ call: 0, name: "header" })
  assertHTMLBlock({ call: 1, name: "sidebar" })
  assertHTMLBlock({ call: 2, name: "footer" })

  mock.restore()
})

function assertOutput(text: string) {
  assertEquals(mock.logged({ call: 0 }), text)
}

function assertHTMLBlock({ call, name }: { call: number; name: string }) {
  const [file, content] = mock.file({ call })
  assertEquals(mock.dir({ call }), "blocks")
  assertEquals(file, `blocks/${name}.html`)
  assertEquals(content, `<h1>${name}</h1>`)

  const [name_block, index] = mock.block({
    call,
  })
  assertEquals(name_block, name)
  assertEquals(index, "index.html")
}

function assertViteConfigs() {
  assertEquals(mock.files({ call: 0 }).name, undefined)
  assertEquals(mock.directories({ call: 0 }), ["public", "__tank__"])
  assertEquals(mock.files({ call: 0 }).files, [
    "package.json",
    "vite.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "main.js",
    "__tank__/defaults.json",
    "__tank__/nunjucks.vite.js",
    "__tank__/vite.js",
  ])

  assertEquals(mock.executed({ call: 0 }), ["cmd", "/c", "npm", "install"])
  assertOutput("Try \x1b[32mnpm run dev\x1b[39m!")
}
