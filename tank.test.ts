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

  try {
    assertEquals(mock.files({ call: 0 }).args.name, "test")
    assertEquals(mock.directories({ call: 0 }).args, ["images"])
    assertEquals(mock.files({ call: 0 }).args.files, [
      "index.html",
      "styles.css",
      ".gitignore",
    ])
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create an unfancy blog on Windows", async () => {
  await tank(mock).blog_handler({
    name: "test",
    bs: true,
  })

  try {
    assertEquals(mock.files({ call: 0 }).args.name, "test")
    assertEquals(mock.directories({ call: 0 }).args, ["images"])
    assertEquals(mock.files({ call: 0 }).args.files, [
      "index.html",
      "styles.css",
      ".gitignore",
    ])

    assertViteConfigs({ folder: "test", call: 1 })

    assertAppend({
      file: "styles.css",
      call: 0,
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
    })

    assertEquals(mock.executed({ call: 0 }).args, [
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
    assertOutput("\nTry your fancy project: \x1b[92mcd test\x1b[39m!\n")
  } finally {
    mock.restore()
  }
})

Deno.test(
  "tank can add vite configs inside a directory on Windows",
  async () => {
    await tank(mock).vite_handler()

    try {
      assertViteConfigs({ call: 0 })

      assertAppend({
        file: "styles.css",
        call: 0,
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
      })

      assertEquals(mock.executed({ call: 0 }).args, [
        "cmd",
        "/c",
        "npm",
        "install",
      ])
      assertOutput("\nTry \x1b[92mnpm run dev\x1b[39m!\n")
    } finally {
      mock.restore()
    }
  }
)

Deno.test("tank can create a html block", () => {
  tank(mock).generate_handler({ html: ["sidebar"] })

  try {
    assertEquals(mock._create_dir({ call: 0 }).args, "blocks")

    assertBlockFile({
      call: 0,
      file: "blocks/sidebar.html",
      content: "<h1>sidebar</h1>",
    })

    assertAppend({ call: 0, content: "{% include \"blocks/sidebar.html\" %}" })
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create multiple html block at once", () => {
  tank(mock).generate_handler({
    html: ["header", "sidebar", "footer"],
  })

  try {
    assertHTMLBlock({ call: 0, name: "header" })
    assertHTMLBlock({ call: 1, name: "sidebar" })
    assertHTMLBlock({ call: 2, name: "footer" })
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create a data block", () => {
  tank(mock).generate_handler({ data: ["list"] })

  try {
    assertDataBlock({ call: 0, name: "list" })
    assertBlockFile({
      call: 1,
      file: "blocks/list.data.json",
      content:
        "[\n  {\n    \"title\": \"a nice list\",\n    \"content\": \"a cool content for list\"\n  },\n  {\n    \"title\": \"second title\",\n    \"content\": \"more content for list\"\n  }\n]",
    })
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create multiple data blocks at once", () => {
  tank(mock).generate_handler({ data: ["list1", "sections"] })

  try {
    assertEquals(mock._create_dir({ call: 0 }).args, "blocks")
    assertDataBlock({ call: 0, name: "list1" })
    assertAppend({ call: 0, content: "{% include \"blocks/list1.html\" %}" })

    assertEquals(mock._create_dir({ call: 1 }).args, "blocks")
    assertDataBlock({ call: 2, name: "sections" })
    assertAppend({ call: 1, content: "{% include \"blocks/sections.html\" %}" })
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create an api block", () => {
  tank(mock).generate_handler({ api: ["events"] })
  const call = 0
  const name = "events"
  try {
    assertEquals(mock._create_dir({ call }).args, "blocks")

    assertApiBlock({ call, name })

    assertAppend({ call, content: "{% include \"blocks/events.html\" %}" })
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create a macro block", () => {
  tank(mock).generate_handler({ macro: ["title"] })
  const call = 0
  const name = "title"
  try {
    assertEquals(mock._create_dir({ call }).args, "blocks")

    assertBlockFile({
      call,
      file: "blocks/title.macro.html",
      content: `<!-- https://mozilla.github.io/nunjucks/templating.html#macro -->

{% macro title(text, transform = 'uppercase') %}

<span class="text-3xl text-transparent {{transform}} bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
    {{ text }}
</span>

{% endmacro %}

{% macro title_green(text, transform = 'uppercase') %}

<span class="text-3xl text-transparent {{transform}} bg-clip-text bg-gradient-to-r from-green-500 to-sky-500">
    {{ text }}
</span>

{% endmacro %}`,
    })

    assertAppend({
      call,
      content: `{% from "blocks/${name}.macro.html" import ${name}, ${name}_green %}

    <section
        class="flex flex-col-reverse items-center space-y-2 font-bold transition duration-500 bg-gray-900 cursor-move hover:bg-violet-600 space">
        {{ ${name}("reuse me!", "capitalize") }}
        😁
        {{ ${name}_green("Macro blocks") }}
    </section>`,
    })
  } finally {
    mock.restore()
  }
})

Deno.test("tank generator can slug fancy block names", () => {
  try {
    tank(mock).generate_handler({ macro: ["fancy-title"] })
    assertEquals(
      mock._create_block_file({ call: 0 }).args[0],
      "blocks/fancy_title.macro.html"
    )
    mock.restore()

    tank(mock).generate_handler({ api: ["fancy]title"] })
    assertEquals(
      mock._create_block_file({ call: 0 }).args[0],
      "blocks/fancytitle.html"
    )
    mock.restore()

    tank(mock).generate_handler({ data: ["fancy///title"] })
    assertEquals(
      mock._create_block_file({ call: 0 }).args[0],
      "blocks/fancytitle.html"
    )
    mock.restore()

    tank(mock).generate_handler({ html: ["FANCY=title%"] })
    assertEquals(
      mock._create_block_file({ call: 0 }).args[0],
      "blocks/fancytitle.html"
    )
    mock.restore()
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create a single page", () => {
  tank(mock).pages_handler({ single: ["pricing"] })
  try {
    assertEquals(mock._create_dir({ call: 0 }).args, "blocks")

    assertEquals(mock._create_block_file({ call: 0 }).calls.length, 1)

    assertEquals(mock._create_dir({ call: 1 }).args, "pricing")

    assertPageFile({
      call: 0,
      file: "pricing/index.html",
      content: `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body class="text-5xl bg-gray-900 text-rose-400">
    {% from "blocks/title.macro.html" import title_green %}

    <main class="flex flex-col items-center justify-center w-screen h-screen">
        Welcome to {{ title_green("pricing Page!") }}
    </main>
    <script type="module" src="./main.js"></script>
</body>

</html>`,
    })

    assertPageFile({
      call: 1,
      file: "pricing/main.js",
      content: `import "./styles.css"

console.log("pricing!!!")`,
    })

    assertPageFile({
      call: 2,
      file: "pricing/styles.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
    })
  } finally {
    mock.restore()
  }
})

Deno.test("tank can slug a page names", () => {
  try {
    tank(mock).pages_handler({ single: ["landing-page"] })
    assertEquals(
      mock._create_page_file({ call: 0 }).args[0],
      "landing-page/index.html"
    )
    mock.restore()

    tank(mock).pages_handler({ single: ["/-$-pricing-$-/"] })
    assertEquals(
      mock._create_page_file({ call: 0 }).args[0],
      "pricing/index.html"
    )
    mock.restore()

    tank(mock).pages_handler({ single: ["//eve///nts//"] })
    assertEquals(
      mock._create_page_file({ call: 0 }).args[0],
      "events/index.html"
    )
    mock.restore()

    tank(mock).pages_handler({ single: ["\\ev\\\\\\ents\\"] })
    assertEquals(
      mock._create_page_file({ call: 0 }).args[0],
      "events/index.html"
    )
  } finally {
    mock.restore()
  }
})

Deno.test("tank can handle a page names with sub-directories", () => {
  try {
    tank(mock).pages_handler({ single: ["landing-page/my/subfolder/page"] })
    assertEquals(
      mock._create_page_file({ call: 0 }).args[0],
      "landing-page/my/subfolder/page/index.html"
    )
  } finally {
    mock.restore()
  }
})

Deno.test("tank can handle a page names with Windows slashes \\", () => {
  try {
    tank(mock).pages_handler({ single: ["landing-page\\my\\subfolder\\page"] })
    assertEquals(
      mock._create_page_file({ call: 0 }).args[0],
      "landing-page/my/subfolder/page/index.html"
    )
  } finally {
    mock.restore()
  }
})

function assertPageFile({
  file,
  call,
  content,
}: {
  file: string;
  call: number;
  content: string;
}) {
  assertEquals(mock._create_page_file({ call }).args[0], file)
  assertEquals(mock._create_page_file({ call }).args[1], content)
}

function assertBlockFile({
  file,
  call,
  content,
}: {
  file: string;
  call: number;
  content: string;
}) {
  assertEquals(mock._create_block_file({ call }).args[0], file)
  assertEquals(mock._create_block_file({ call }).args[1], content)
}

function assertAppend({
  call,
  content,
  file = "index.html",
}: {
  call: number;
  content: string;
  file?: string;
}) {
  const [name, index] = mock._insert_content({ call }).args
  assertEquals(name, content)
  assertEquals(index, file)
}

function assertApiBlock({ call, name }: { call: number; name: string }) {
  const [file, content] = mock._create_block_file({ call }).args
  assertEquals(file, `blocks/${name}.html`, `${name}.html not created.`)
  assert(content.split("\n").includes(`    ${name} api block`), content)

  const [file2, content2] = mock._create_block_file({ call: call + 1 }).args
  assertEquals(
    file2,
    `blocks/${name}.api.dev.js`,
    `${name}.api.dev.js not created.`
  )
  assert(
    content2
      .split("\n")
      .includes(
        "    \"https://animechan.vercel.app/api/quotes/anime?title=zero+kara\","
      ),
    content2
  )

  const [file3, content3] = mock._create_block_file({ call: call + 2 }).args
  assert(
    content3
      .split("\n")
      .includes(
        "    \"https://animechan.vercel.app/api/quotes/anime?title=saint+seiya\","
      ),
    content3
  )
  assertEquals(
    file3,
    `blocks/${name}.api.prod.js`,
    `${name}.api.prod.js not created.`
  )
}

function assertDataBlock({ call, name }: { call: number; name: string }) {
  const [file, content] = mock._create_block_file({ call }).args
  assertEquals(file, `blocks/${name}.html`, `${name}.html not created.`)
  assert(content.split("\n").includes(`        ${name} block`), content)

  const [file2, content2] = mock._create_block_file({ call: call + 1 }).args
  assertEquals(
    file2,
    `blocks/${name}.data.json`,
    `${name}.data.json not created.`
  )
  assertEquals(
    content2,
    "[\n  {\n    \"title\": \"a nice " +
      name +
      "\",\n    \"content\": \"a cool content for " +
      name +
      "\"\n  },\n  {\n    \"title\": \"second title\",\n    \"content\": \"more content for " +
      name +
      "\"\n  }\n]"
  )
}

function assertOutput(text: string) {
  assertEquals(mock.logged({ call: 0 }).args, text)
}

function assertHTMLBlock({ call, name }: { call: number; name: string }) {
  const [file, content] = mock._create_block_file({ call }).args
  assertEquals(mock._create_dir({ call }).args, "blocks")
  assertEquals(file, `blocks/${name}.html`)
  assert(content.split("\n").includes(`<h1>${name}</h1>`))

  assertAppend({ call, content: "{% include \"blocks/" + name + ".html\" %}" })
}

function assertViteConfigs({
  folder,
  call,
}: {
  call: number;
  folder?: string;
}) {
  assertEquals(mock.files({ call }).args.name, folder)
  assertEquals(mock.directories({ call }).args, ["public", "__tank__"])
  assertEquals(mock.files({ call }).args.files, [
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
}
