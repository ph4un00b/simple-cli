/* eslint-disable max-lines-per-function */
import {
  assert,
  assertEquals,
  fail,
} from "https://deno.land/std/testing/asserts.ts"

import { tank } from "./tank.ts"
import { actionsMock as mock } from "./utils_dev.ts"

Deno.test("tank can create a fancy blog", async () => {
  await tank(mock).blog_handler({ name: "test" })

  assertEquals(mock.files({ call: 0 }).arg.name, "test")
  assertEquals(mock.directories({ call: 0 }).arg, ["images"])
  assertEquals(mock.files({ call: 0 }).arg.files, [
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

  assertEquals(mock.files({ call: 0 }).arg.name, "test")
  assertEquals(mock.directories({ call: 0 }).arg, ["images"])
  assertEquals(mock.files({ call: 0 }).arg.files, [
    "index.html",
    "styles.css",
    ".gitignore",
  ])

  assertEquals(mock.directories({ call: 1 }).arg, ["public", "__tank__"])
  assertEquals(mock.files({ call: 1 }).arg.files, [
    "package.json",
    "vite.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "main.js",
    "__tank__/defaults.json",
    "__tank__/nunjucks.vite.js",
    "__tank__/vite.js",
  ])

  assertEquals(mock.files({ call: 1 }).arg.name, "test")
  assertEquals(mock.executed({ call: 0 }).arg, [
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

  assertEquals(mock.dir({ call: 0 }).arg, "blocks")

  const [file, content] = mock.file({ call: 0 }).arg
  assertEquals(file, "blocks/sidebar.html")
  assertEquals(content, "<h1>sidebar</h1>")

  const [name, index] = mock.appended({ call: 0 }).arg
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

Deno.test("tank can create a data block", () => {
  tank(mock).generate_handler({ data: ["list"] })

  assertHTMLBlock({ call: 0, name: "list" })

  const [file, content] = mock.file({ call: 1 }).arg
  assertEquals(file, "blocks/list.json")
  assertEquals(
    content,
    "[{\"title\":\"a nice title\",\"content\":\"a cool content\"},{\"title\":\"second title\",\"content\":\"more content\"}]",
  )

  mock.restore()
})

Deno.test("tank can create multiple data blocks at once", () => {
  tank(mock).generate_handler({ data: ["list1", "sections"] })

  assertEquals(mock.dir({ call: 0 }).arg, "blocks")
  assertDataBlock({call:0, name:"list1"})
  const [name_block, index] = mock.appended({ call: 0, }).arg
  assertEquals(name_block, "list1")
  assertEquals(index, "index.html")

  assertEquals(mock.dir({ call: 1 }).arg, "blocks")
  assertDataBlock({call:2, name:"sections"})
  const [name_block2, index2] = mock.appended({ call: 1, }).arg
  assertEquals(name_block2, "sections")
  assertEquals(index2, "index.html")

  mock.restore()
})

function assertDataBlock({call, name}:{call: number, name: string}) {

  const [file, content] = mock.file({ call }).arg
  assertEquals(file, `blocks/${name}.html`, `${name}.html not created.`)
  assertEquals(content, `<h1>${name}</h1>`, `${name}.html diff content.`)

  const [file2, content2] = mock.file({ call: call + 1 }).arg
  assertEquals(file2, `blocks/${name}.json`, `${name}.json not created.`)
  assertEquals(
    content2,
    "[{\"title\":\"a nice title\",\"content\":\"a cool content\"},{\"title\":\"second title\",\"content\":\"more content\"}]",
    `${name}.json diff content.`
  )
}

function assertOutput(text: string) {
  assertEquals(mock.logged({ call: 0 }).arg, text)
}

function assertHTMLBlock({ call, name }: { call: number; name: string }) {
  const [file, content] = mock.file({ call }).arg
  assertEquals(mock.dir({ call }).arg, "blocks")
  assertEquals(file, `blocks/${name}.html`)
  assertEquals(content, `<h1>${name}</h1>`)

  const [name_block, index] = mock.appended({
    call,
  }).arg
  assertEquals(name_block, name)
  assertEquals(index, "index.html")
}

function assertViteConfigs() {
  assertEquals(mock.files({ call: 0 }).arg.name, undefined)
  assertEquals(mock.directories({ call: 0 }).arg, ["public", "__tank__"])
  assertEquals(mock.files({ call: 0 }).arg.files, [
    "package.json",
    "vite.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "main.js",
    "__tank__/defaults.json",
    "__tank__/nunjucks.vite.js",
    "__tank__/vite.js",
  ])

  assertEquals(mock.executed({ call: 0 }).arg, ["cmd", "/c", "npm", "install"])
  assertOutput("Try \x1b[32mnpm run dev\x1b[39m!")
}
