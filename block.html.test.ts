/* eslint-disable max-lines-per-function */
import { create_html_block, fns } from "./block.html.ts"
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
  create_html_block("title")
  assertEquals(fakeDir.getCall(0).args, ["blocks"])
  assertEquals(fakeFile.getCall(0).args[0], "blocks/title.html")
  assertEquals(fakeFile.getCall(0).args[1], html)
  assertEquals(fakeInsert.getCall(0).args[1], "index.html")
  assertEquals(
    fakeInsert.getCall(0).args[0],
    "{% include \"blocks/title.html\" %}",
  )
  sandbox.restore()
})

Deno.test("--html do not patch index.html.", function () {
  const { sandbox, fakeDir, fakeFile, fakeInsert } = setup()
  sandbox.stub(fns, "block_exist").returns(false)
  create_html_block("title", false)
  assertDirectoriesCalls(fakeDir, 1)
  assertFilesCalls(fakeFile, 1)
  assertInsertCalls(fakeInsert, 0)
  sandbox.restore()
})

Deno.test("--html do not allow to create the same block.", function () {
  const { sandbox, fakeDir, fakeFile, fakeInsert, fakeStdOut } = setup()
  sinon.stub(fns, "block_exist").returns(true)
  create_html_block("title")
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

const html = `<!-- You can leverage the Nunjucks templating stuff -->
<!-- https://mozilla.github.io/nunjucks/templating.html#tags -->
<!-- Or keep it simple with just plain old HTML. -->

<!-- Your fancy HTML markup code here. -->
<h1 class="text-3xl text-center uppercase">title block</h1>

<!-- Then include your component 'title' anywhere in any page with: -->
<!-- "{" % include "blocks/title.html" % "}" -->

<!-- One cool thing about Vite is once you enter $ npm run dev -->
<!-- You can work and your changes will be reflected in the browser on the fly. -->

<!-- type $ npm run build, to yield your webapp in the best optimal way. -->
<!-- type $ npm run preview, to lurk the output, the output will be available in dist/ -->
`
