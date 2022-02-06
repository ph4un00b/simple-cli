/* eslint-disable max-lines-per-function */
import { assertEquals, sinon } from "./dev_deps.ts"
import { assertOutputCallHave } from "./shared_test.ts"
import { create_vite_configs, fns } from "./add.vite.ts"

Deno.test("can create vite configs", async function () {
  const sandbox = sinon.createSandbox()
  const fakeExec = sandbox.stub(fns, "exec")
  const fakePatch = sandbox.stub(fns, "insert_content")
  const fakeStdOut = sandbox.stub(fns, "stdOut")
  const fakeDirectories = sandbox.stub(fns, "create_directories")
  const fakeFiles = sandbox.stub(fns, "create_files")
  create_vite_configs()
  assertEquals(
    fakePatch.getCall(0).args[0],
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;"
  )
  assertEquals(fakePatch.getCall(0).args[1], "styles.css")
  assertEquals(fakeDirectories.getCall(0).args[0], [
    "images",
    "public",
    "__tank__",
  ])
  assertEquals(fakeFiles.getCall(0).args[0].files, [
    "index.html",
    "styles.css",
    ".gitignore",
    "package.json",
    "vite.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "main.js",
    "__tank__/defaults.js",
    "__tank__/nunjucks.plugin.js",
    "__tank__/plugins.js",
    "__tank__/pages.js",
  ])
  Deno.build.os === "windows"
    ? assertEquals(await fakeExec.getCall(0).args[0], [
      "cmd",
      "/c",
      "npm",
      "install",
    ])
    : assertEquals(await fakeExec.getCall(0).args[0], ["npm", "install"])
  assertEquals(fakeStdOut.getCalls().length, 1)
  assertOutputCallHave(fakeStdOut, 0, "npm run dev")
})
