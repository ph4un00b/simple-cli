/* eslint-disable max-lines-per-function */
import { create_macro_block, fns } from "./block.macro.ts"
import { assertEquals, sinon } from "./dev_deps.ts"
import {
  assertDirectoriesCalls,
  assertFilesCalls,
  assertInsertCalls,
  assertOutputCallHave,
  assertOutputCalls,
} from "./shared_test.ts"

Deno.test("can create a macro block.", function () {
  const { sandbox, fakeDir, fakeFile, fakeInsert } = setup()
  sandbox.stub(fns, "block_exist").returns(false)
  create_macro_block("title")
  assertEquals(fakeDir.getCall(0).args, ["blocks"])
  assertEquals(fakeFile.getCall(0).args[0], "blocks/title.macro.html")
  assertEquals(fakeFile.getCall(0).args[1], html)
  assertEquals(fakeInsert.getCall(0).args[1], "index.html")
  assertEquals(
    fakeInsert.getCall(0).args[0],
    "{% from \"blocks/title.macro.html\" import title, title_green %}\n\n<div> {{ title(\"reuse me!\", \"capitalize\") }} </div>\n<div> {{ title_green(\"Macro blocks\") }} 😁</div>\n",
  )
  sandbox.restore()
})

Deno.test("--macro do not patch index.html.", function () {
  const { sandbox, fakeDir, fakeFile, fakeInsert } = setup()
  sandbox.stub(fns, "block_exist").returns(false)
  create_macro_block("title", false)
  assertDirectoriesCalls(fakeDir, 1)
  assertFilesCalls(fakeFile, 1)
  assertInsertCalls(fakeInsert, 0)
  sandbox.restore()
})

Deno.test("--macro do not allow to create the same block.", function () {
  const { sandbox, fakeDir, fakeFile, fakeInsert, fakeStdOut } = setup()
  sinon.stub(fns, "block_exist").returns(true)
  create_macro_block("title")
  assertDirectoriesCalls(fakeDir, 1)
  assertOutputCalls(fakeStdOut, 1)
  assertOutputCallHave(fakeStdOut, 0, "Already Created Block: title")
  assertInsertCalls(fakeInsert, 0)
  assertFilesCalls(fakeFile, 0)
  sandbox.restore()
})

function setup() {
  const sandbox = sinon.createSandbox()
  const fakeDir = sandbox.stub(fns, "create_dir")
  const fakeFile = sandbox.stub(fns, "create_block_file")
  const fakeInsert = sandbox.stub(fns, "insert_content")
  const fakeStdOut = sandbox.stub(fns, "stdOut")
  return { sandbox, fakeDir, fakeFile, fakeInsert, fakeStdOut }
}

const html = `<!-- https://mozilla.github.io/nunjucks/templating.html#macro -->

<!-- Macros will be your reusable components with parameters. -->

{% macro title(text, transform = 'uppercase') %}

<span class="text-3xl text-transparent {{transform}} bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
    {{ text }}
</span>

{% endmacro %}

{% macro title_green(text, transform = 'uppercase') %}

<span class="text-3xl text-transparent {{transform}} bg-clip-text bg-gradient-to-r from-green-500 to-sky-500">
    {{ text }}
</span>

{% endmacro %}
`
