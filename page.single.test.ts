/* eslint-disable max-lines-per-function */
import { assertEquals, sinon } from "./dev_deps.ts"
import { create_single_page, fns } from "./page.single.ts"
import {
  assertDirectoriesCalls,
  assertFilesCalls,
  assertOutputCalls,
  assertOutputCallHave,
  assertBlockCalls
} from "./shared_test.ts"


Deno.test("can create a single page", function () {
  const { sandbox, fakeDir, fakeFile, fakeBlock, fakeStdOut } =
    setup()
  sandbox.stub(fns, "page_exist").returns(false)
  create_single_page("music")
  assertEquals(fakeDir.getCall(0).args, ["music"])
  assertEquals(fakeBlock.getCall(0).args[0], "titles")
  assertEquals(fakeBlock.getCall(0).args[1], false)
  assertEquals(fakeFile.getCalls().length, 3)
  assertEquals(fakeFile.getCall(0).args[0], "music/index.html")
  assertEquals(fakeFile.getCall(0).args[1], html)
  assertEquals(fakeFile.getCall(1).args[0], "music/main.js")
  assertEquals(fakeFile.getCall(1).args[1], js)
  assertEquals(fakeFile.getCall(2).args[0], "music/styles.css")
  assertEquals(fakeFile.getCall(2).args[1], css)
  assertOutputCallHave(fakeStdOut, 0, "Update content property")
  assertOutputCallHave(fakeStdOut, 1, /music\/\*\*\/\*\.\{html,js\}/)
  sandbox.restore()
})

Deno.test("--single do not allow to create the same page.", function () {
  const { sandbox, fakeDir, fakeFile, fakeBlock, fakeStdOut } = setup()
  sandbox.stub(fns, "page_exist").returns(true)
  create_single_page("music")
  assertOutputCalls(fakeStdOut, 1)
  assertOutputCallHave(fakeStdOut, 0, "Already Created Page")
  assertDirectoriesCalls(fakeDir, 0)
  assertBlockCalls(fakeBlock, 0)
  assertFilesCalls(fakeFile, 0)
  sandbox.restore()
})

function setup() {
  const sandbox = sinon.createSandbox()
  const fakeDir = sandbox.stub(fns, "create_dir")
  const fakeFile = sandbox.stub(fns, "create_page_file")
  const fakeBlock = sandbox.stub(fns, "create_macro_block")
  const fakeStdOut = sandbox.stub(fns, "stdOut")
  return { sandbox, fakeDir, fakeFile, fakeBlock, fakeStdOut }
}

const html = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body class="text-5xl bg-gray-900 text-rose-400">
    {% from "blocks/titles.macro.html" import titles_green %}

    <main class="flex flex-col items-center justify-center w-screen h-screen">
        Welcome to {{ titles_green("music Page!") }}
    </main>
    <script type="module" src="./main.js"></script>
</body>

</html>`

const js = `import "./styles.css"

console.log("single music page!!!");`

const css = `@tailwind base;
@tailwind components;
@tailwind utilities;`

