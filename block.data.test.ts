/* eslint-disable max-lines-per-function */
import { create_data_block, fns } from "./block.data.ts"
import { assertEquals, sinon } from "./dev_deps.ts"
import {
  assertDirectoriesCalls,
  assertFilesCalls,
  assertInsertCalls,
  assertOutputCallHave,
  assertOutputCalls,
} from "./shared_test.ts"

Deno.test("can create a html block.", function () {
  const { sandbox, fakeDir, fakeFile, fakeInsert } = setup()
  sandbox.stub(fns, "block_exist").returns(false)
  create_data_block("title")
  assertEquals(fakeDir.getCall(0).args, ["blocks"])
  assertEquals(fakeFile.getCall(0).args[0], "blocks/title.data.html")
  assertEquals(fakeFile.getCall(0).args[1], html)
  assertEquals(fakeFile.getCall(1).args[0], "blocks/title.model.json")
  assertEquals(fakeFile.getCall(1).args[1], model)
  assertEquals(fakeInsert.getCall(0).args[1], "index.html")
  assertEquals(
    fakeInsert.getCall(0).args[0],
    "{% include \"blocks/title.data.html\" %}",
  )
  sandbox.restore()
})

Deno.test("--html do not patch index.html.", function () {
  const { sandbox, fakeDir, fakeFile, fakeInsert } = setup()
  sandbox.stub(fns, "block_exist").returns(false)
  create_data_block("title", false)
  assertDirectoriesCalls(fakeDir, 1)
  assertFilesCalls(fakeFile, 2)
  assertInsertCalls(fakeInsert, 0)
  sandbox.restore()
})

Deno.test("--html do not allow to create the same block.", function () {
  const { sandbox, fakeDir, fakeFile, fakeInsert, fakeStdOut } = setup()
  sinon.stub(fns, "block_exist").returns(true)
  create_data_block("title")
  assertDirectoriesCalls(fakeDir, 1)
  assertOutputCalls(fakeStdOut, 1)
  assertOutputCallHave(fakeStdOut, 0, "Already Created Block: title")
  assertFilesCalls(fakeFile, 0)
  assertInsertCalls(fakeInsert, 0)
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

const html =
  `<article class="flex flex-col items-center antialiased bg-rose-500 text-gray-50">
    <h1 class="text-4xl font-extralight">
        title block
    </h1>

    <!-- https://mozilla.github.io/nunjucks/templating.html#dump -->
    <!-- Items from *.model.json have a "_items" suffix. -->
    <!-- you can change the suffix in "__tank__/defaults.js" -->

    <!-- For this special component, you will need to stop the local Vite server. -->
    <!-- and re-run it!, $ npm run dev -->

    <section>
        <details>
            <summary class="pl-3 font-mono text-xl ">
                <!-- Special filters provided by Nunjucks. -->
                {{ title_items | dump | truncate(20) }}
            </summary>

            <pre class="pt-6">{{ title_items | dump(2) }}</pre>
        </details>

        <ol>
            {% for item in title_items %}
            <li class="list-decimal">{{ item.title }}</li>
            {% endfor %}
        </ol>
    </section>
</article>
`

const model = `[
  {
    "title": "a nice title",
    "content": "a cool content for title"
  },
  {
    "title": "second title",
    "content": "more content for title"
  }
]`
