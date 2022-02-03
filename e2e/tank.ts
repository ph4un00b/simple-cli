/* eslint-disable max-lines-per-function */
import { assert } from "https://deno.land/std@0.121.0/testing/asserts.ts"
import { readAll } from "https://deno.land/std@0.121.0/streams/mod.ts"

const cli_flags = [
  "--allow-read",
  "--allow-write",
  "--unstable",
  "--no-check",
  "--allow-run",
  "--allow-env",
  "--allow-ffi",
]

let cli_command: Deno.Process<{
  cmd: string[];
  cwd: string;
  stdout: "piped";
}>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function execute(options: any, folder?: string) {
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
  await execute(["new", "--name", "test_blog"], test_dir)

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
  await execute(["new", "-n", "test_blog"], test_dir)

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
  await execute(["new", "-n", "test_blog", "--no-bs"], test_dir)

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
  await execute(["new", "-n", "test_blog", "-b"], test_dir)

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
    assertFileContains(`${test_path}vite.config.js`, "my vite config")
  } finally {
    rm_vite_configs({
      test_path,
      except: ["vite.config.js"],
    })
    await killing_cli()
  }
})

Deno.test("tank generate --html block requires a name.", async () => {
  const command = ["c", "--html"]
  const include = "\x1b[91mHTML component name required.\x1b[39m"
  await assertStdErrContains(command, include)
})

Deno.test("tank --html appends create a block", async () => {
  const test_dir = "test_blocks_creation"
  const test_path = `e2e/${test_dir}/`
  await execute(["c", "--html", "sidebar"], test_dir)

  try {
    assert(Deno.statSync(`${test_path}blocks`).isDirectory)
    assert(Deno.statSync(`${test_path}blocks/sidebar.html`).isFile)
    assertFileContains(
      `${test_path}index.html`,
      "{% include \"blocks/sidebar.html\" %}"
    )
  } finally {
    rm_path(`${test_path}blocks`)
    Deno.writeTextFileSync(`${test_path}index.html`, `<!DOCTYPE html>
<html lang="en">
<head>
</head>
<body>
    {% include "blocks/jamon.html" %}
    <article>
        <nav>
            Jump to...
            <ul>
                <li><a href="#section-1">Section 1</a></li>
                <li><a href="#section-2">Section 2</a></li>
                <li><a href="#section-3">Section 3</a></li>
                <li><a href="#section-4">Section 4</a></li>
                <li><a href="#section-5">Section 5</a></li>
            </ul>
        </nav>
    </article>
</body></html>`)
    await killing_cli()
  }
})

async function assertStdErrContains(command: string[], include: string) {
  const cmd = [Deno.execPath(), "run", ...cli_flags, "../tank.ts", ...command]
  const p = Deno.run({ cmd, stdout: "piped", stderr: "piped", cwd: "./e2e" })
  const status = await p.status()
  const stderr = new TextDecoder().decode(await readAll(p.stderr))
  p.close()
  p.stderr.close()
  p.stdout.close()
  assert(!status.success)
  assert(stderr.split("\n").includes(include))
}

function assertFileContains(test_path: string, patch: string) {
  const text = Deno.readTextFileSync(test_path)
  assert(text.includes(patch), `patch on ${test_path} not present.`)
}

function rm_vite_configs({
  test_path,
  except = [],
}: {
  test_path: string;
  except?: string[];
}) {
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

  const filtered_files = files.filter((file: string) => !except.includes(file))

  for (const file of filtered_files) {
    rm_path(`${test_path}${file}`)
  }
}

function rm_path(file: string) {
  Deno.removeSync(file, { recursive: true })
}

function assertBaseConfig(test_path: string) {
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

function assertDep(test_path: string, dependency: string) {
  const text = Deno.readTextFileSync(`${test_path}package.json`)
  assert(text.includes(dependency), `${dependency} dependency is not present.`)
}

function assertViteConfigs(test_path: string) {
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
    Deno.statSync(`${test_path}__tank__/defaults.js`).isFile,
    "defaults.js not present."
  )

  assert(
    Deno.statSync(`${test_path}__tank__/nunjucks.plugin.js`).isFile,
    "nunjucks.plugin.js not present."
  )

  assert(
    Deno.statSync(`${test_path}__tank__/plugins.js`).isFile,
    "plugins.js not present."
  )

  assert(
    Deno.statSync(`${test_path}__tank__/pages.js`).isFile,
    "pages.js not present."
  )

  assertDep(test_path, "vite-plugin-nunjucks")
  // assert(Deno.statSync(`${test_path}package-lock.json`).isFile);
  // assert(Deno.statSync(`${test_path}node_modules`).isDirectory);
}
