/* eslint-disable max-lines-per-function */
import {
  assert,
  assertEquals,
  assertThrows,
  fail,
} from "https://deno.land/std/testing/asserts.ts"
import { TextProtoReader } from "https://deno.land/std/textproto/mod.ts"
import { BufReader } from "https://deno.land/std/io/mod.ts"
import { readAll } from "https://deno.land/std/streams/mod.ts"

const cli_flags = [
  "--allow-read",
  "--allow-write",
  "--unstable",
  "--no-check",
  "--allow-run",
  "--allow-env",
  "--allow-ffi",
]

let cli_command

function execute(options, folder = undefined) {
  const cmd = [
    Deno.execPath(),
    "run",
    ...cli_flags,
    folder ? "../../tank.ts" : "../tank.ts",
    ...options,
  ]

  cli_command = Deno.run({
    cmd,
    cwd: folder ? `./e2e/${folder}` : "./e2e",
    stdout: "piped",
  })

  return cli_command.status()
}

async function killing_cli() {
  cli_command.close()
  // Process.close() kills the  process. However this termination
  // happens asynchronously, and since we've just closed the process resource,
  // we can't use `await cli_command.status()` to wait for the process to have
  // exited. As a workaround, wait for its stdout to close instead.
  // TODO: when `Process.kill()` is stable and works on Windows,
  // switch to calling `kill()` followed by `await fileServer.status()`.
  await readAll(cli_command.stdout)
  cli_command.stdout?.close()
}

Deno.test("tank can create a fancy blog", async () => {
  const test_dir = "test_data"
  const test_path = `e2e/${test_dir}/`
  await execute(["blog", "--name", "test_blog"], test_dir)

  try {
    assert(Deno.statSync(`${test_path}test_blog`).isDirectory)
    assert(Deno.statSync(`${test_path}test_blog/images`).isDirectory)
    assert(Deno.statSync(`${test_path}test_blog/index.html`).isFile)
    assert(Deno.statSync(`${test_path}test_blog/styles.css`).isFile)
    assert(Deno.statSync(`${test_path}test_blog/.gitignore`).isFile)
  } finally {
    rm_path(`${test_path}test_blog`)
    await killing_cli()
  }
})

Deno.test("tank can create a fancy blog with -n", async () => {
  const test_dir = "test_data"
  const test_path = `e2e/${test_dir}/`
  await execute(["blog", "-n", "test_blog"], test_dir)

  try {
    assertBaseConfig(`${test_path}test_blog/`)
  } finally {
    rm_path(`${test_path}test_blog`)
    await killing_cli()
  }
})

Deno.test("tank can create a fancy blog with --no-bs", async () => {
  const test_dir = "test_data"
  const test_path = `e2e/${test_dir}/`
  await execute(["blog", "-n", "test_blog", "--no-bs"], test_dir)

  try {
    assertBaseConfig(`${test_path}test_blog/`)
  } finally {
    rm_path(`${test_path}test_blog`)
    await killing_cli()
  }
})

Deno.test("tank can create an unfancy blog with vite configs", async () => {
  const test_dir = "test_data"
  const test_path = `e2e/${test_dir}/`
  await execute(["blog", "-n", "test_blog", "-b"], test_dir)

  try {
    assertBaseConfig(`${test_path}test_blog/`)
    assertViteConfigs(`${test_path}test_blog/`)
  } finally {
    rm_path(`${test_path}test_blog`)
    await killing_cli()
  }
})

Deno.test("tank can add vite configs inside a directory", async () => {
  const test_dir = "test_data"
  const test_path = `e2e/${test_dir}/`
  await execute(["vite"], test_dir)

  try {
    assertViteConfigs(test_path)
  } finally {
    rm_vite_configs({ test_path })
    await killing_cli()
  }
})

Deno.test("do not allow tank to overwrite files.", async () => {
  const test_dir = "test_dont_destroy_files"
  const test_path = `e2e/${test_dir}/`

  try {
    assert(Deno.statSync(`${test_path}vite.config.js`).isFile)
    await execute(["vite"], test_dir)
    assertViteConfigs(test_path)
  } finally {
    rm_vite_configs({
      test_path,
      except: ["vite.config.js"],
    })
    await killing_cli()
  }
})

Deno.test("tank generate html block requires a name for a block.", async () => {
  await execute(["g", "--html"])
  try {
    await assertOutputIncludes("HTML component name required.")
  } finally {
    killing_cli()
  }
})

Deno.test("tank can create a html block", async () => {
  const test_dir = "test_blocks_creation"
  const test_path = `e2e/${test_dir}/`
  await execute(["g", "--html", "sidebar"], test_dir)

  try {
    assert(Deno.statSync(`${test_path}blocks`).isDirectory)
    assert(Deno.statSync(`${test_path}blocks/sidebar.html`).isFile)
    assertFileContains(
      `${test_path}index.html`,
      "{% include \"blocks/sidebar.html\" %}"
    )
  } finally {
    rm_path(`${test_path}blocks`)
    await killing_cli()
  }
})

function assertFileContains(test_path, patch) {
  const text = Deno.readTextFileSync(test_path)
  assert(text.includes(patch), `patch on ${test_path} not present.`)
}

function rm_vite_configs({ test_path, except = [] }) {
  const files = [
    "public",
    "main.js",
    "postcss.config.js",
    "tailwind.config.js",
    "vite.config.js",
    "package.json",
    "package-lock.json",
    "node_modules",
    "__tank__",
  ]

  const filtered_files = files.filter((file) => !except.includes(file))

  for (const file of filtered_files) {
    rm_path(`${test_path}${file}`)
  }
}

function rm_path(file) {
  Deno.removeSync(file, { recursive: true })
}

function assertBaseConfig(test_path) {
  assert(Deno.statSync(test_path).isDirectory, `${test_path} is not present.`)
  assert(
    Deno.statSync(`${test_path}images`).isDirectory,
    "images is not present"
  )
  assert(
    Deno.statSync(`${test_path}index.html`).isFile,
    "index.html is not present"
  )
  assert(Deno.statSync(`${test_path}styles.css`).isFile, "styles.css")
  assert(
    Deno.statSync(`${test_path}.gitignore`).isFile,
    ".gitinore is not present"
  )
}

function assertDep(test_path, dependency) {
  const text = Deno.readTextFileSync(`${test_path}package.json`)
  assert(text.includes(dependency), `${dependency} dependency is not present.`)
}

function assertViteConfigs(test_path) {
  assert(
    Deno.statSync(`${test_path}public`).isDirectory,
    "public not present."
  )
  assert(Deno.statSync(`${test_path}main.js`).isFile, "main.js not present.")
  assert(
    Deno.statSync(`${test_path}postcss.config.js`).isFile,
    "postcss not present."
  )
  assert(
    Deno.statSync(`${test_path}tailwind.config.js`).isFile,
    "tailwind not present."
  )
  assert(
    Deno.statSync(`${test_path}vite.config.js`).isFile,
    "vite not present."
  )
  assert(
    Deno.statSync(`${test_path}package.json`).isFile,
    "package.json not present."
  )

  assert(
    Deno.statSync(`${test_path}__tank__/defaults.json`).isFile,
    "defaults.json not present."
  )

  assert(
    Deno.statSync(`${test_path}__tank__/nunjucks.vite.js`).isFile,
    "nunjucks.vite.js not present."
  )

  assert(
    Deno.statSync(`${test_path}__tank__/vite.js`).isFile,
    "vite.js not present."
  )

  assertDep(test_path, "vite-plugin-nunjucks")
  // assert(Deno.statSync(`${test_path}package-lock.json`).isFile);
  // assert(Deno.statSync(`${test_path}node_modules`).isDirectory);
}

async function assertOutputIncludes(text) {
  assert(cli_command.stdout != null)
  const r = new TextProtoReader(new BufReader(cli_command.stdout))
  const s = await r.readLine()
  assert(s !== null && s.includes(text), `${text} is not present.`)
}