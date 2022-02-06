/* eslint-disable max-lines-per-function */
import { assertEquals, sinon } from "./dev_deps.ts"
import { assertOutputCallHave } from "./shared_test.ts"
import { create_new_project, fns } from "./tank.new.ts"

Deno.test("can create a new project", function () {
  const sandbox = sinon.createSandbox()
  const fakeDir = sandbox.stub(fns, "create_dir")
  const fakeFiles = sandbox.stub(fns, "create_files")
  const fakeStdOut = sandbox.stub(fns, "stdOut")
  const fakeDirectories = sandbox.stub(fns, "create_directories")

  create_new_project("unfancy-app")
  assertEquals(fakeDir.getCalls().length, 1)
  assertEquals(fakeDir.getCall(0).args, ["unfancy-app"])
  assertEquals(fakeDirectories.getCalls().length, 1)
  assertEquals(fakeDirectories.getCall(0).args[0], ["images"])
  assertEquals(fakeFiles.getCalls().length, 1)
  assertEquals(fakeFiles.getCall(0).args[0].files, ["index.html", "main.js", "styles.css", ".gitignore"])
  assertOutputCallHave(fakeStdOut, 0, "New Project")
})
