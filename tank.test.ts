/* eslint-disable max-lines-per-function */
import { assert, assertEquals } from "./dev_deps.ts"

import { tank } from "./tank.ts"
import { actionsMock as mock } from "./utils_dev.ts"
Deno.test("tank can create a fancy blog", async () => {
  await tank(mock).new_handler({ name: "test" })

  try {
    assertEquals(mock._create_files().calls[0].name, "test")
    assertEquals(mock._create_directories().calls[0], ["images"])
    assertEquals(mock._create_files().calls[0].files, [
      "index.html",
      "styles.css",
      ".gitignore",
    ])
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create an unfancy blog", async () => {
  await tank(mock).new_handler({
    name: "test",
    bs: true,
  })

  try {
    assertEquals(mock._create_files().calls[0].name, "test")
    assertEquals(mock._create_directories().calls[0], ["images"])
    assertEquals(mock._create_files().calls[0].files, [
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

    if (Deno.build.os === "windows") {
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
    } else {
      assertEquals(mock.executed({ call: 0 }).args, [
        "cd",
        "test",
        "&&",
        "npm",
        "install",
      ])
    }

    assertOutput("\nTry your fancy project: \x1b[92mcd test\x1b[39m!\n")
  } finally {
    mock.restore()
  }
})

Deno.test("tank can add vite configs inside a directory", async () => {
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

    if (Deno.build.os === "windows") {
      assertEquals(mock.executed({ call: 0 }).args, [
        "cmd",
        "/c",
        "npm",
        "install",
      ])
    } else {
      assertEquals(mock.executed({ call: 0 }).args, ["npm", "install"])
    }

    assertOutput("\nTry \x1b[92mnpm run dev\x1b[39m!\n")
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create a html block", () => {
  tank(mock).generate_handler({ html: ["sidebar"] })

  try {
    assertEquals(mock._create_dir().calls[0], "blocks")

    assertBlockFile({
      call: 0,
      file: "blocks/sidebar.html",
      content: `<!-- You can leverage the Nunjucks templating stuff -->
<!-- https://mozilla.github.io/nunjucks/templating.html#tags -->
<!-- Or keep it simple with just plain old HTML. -->

<!-- Your fancy HTML markup code here. -->
<h1 class="text-3xl text-center uppercase">sidebar block</h1>

<!-- Then include your component 'sidebar' anywhere in any page with: -->
<!-- "{" % include "blocks/sidebar.html" % "}" -->

<!-- One cool thing about Vite is once you enter $ npm run dev -->
<!-- You can work and your changes will be reflected in the browser on the fly. -->

<!-- type $ npm run build, to yield your webapp in the best optimal way. -->
<!-- type $ npm run preview, to lurk the output, the output will be available in dist/ -->
`,
    })

    assertAppend({
      call: 0,
      content: "{% include \"blocks/sidebar.html\" %}",
    })
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
      file: "blocks/list.model.json",
      content:
        "[\n  {\n    \"title\": \"a nice list\",\n    \"content\": \"a cool content for list\"\n  },\n  {\n    \"title\": \"second title\",\n    \"content\": \"more content for list\"\n  }\n]",
    })
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create multiple data blocks at once", () => {
  tank(mock).generate_handler({
    data: ["list1", "sections"],
  })

  try {
    assertEquals(mock._create_dir().calls[0], "blocks")
    assertDataBlock({ call: 0, name: "list1" })
    assertAppend({
      call: 0,
      content: "{% include \"blocks/list1.html\" %}",
    })

    assertEquals(mock._create_dir().calls[1], "blocks")
    assertDataBlock({ call: 2, name: "sections" })
    assertAppend({
      call: 1,
      content: "{% include \"blocks/sections.html\" %}",
    })
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create an api block", () => {
  tank(mock).generate_handler({ api: ["events"] })
  const call = 0
  const name = "events"
  try {
    assertEquals(mock._create_dir().calls[call], "blocks")

    assertApiBlock({ call, name })

    assertAppend({
      call,
      content: "{% include \"blocks/events.html\" %}",
    })
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create a macro block", () => {
  tank(mock).generate_handler({ macro: ["title"] })
  const call = 0
  const name = "title"
  try {
    assertEquals(mock._create_dir().calls[call], "blocks")

    assertBlockFile({
      call,
      file: "blocks/title.macro.html",
      content:
        `<!-- https://mozilla.github.io/nunjucks/templating.html#macro -->

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
`,
    })

    assertAppend({
      call,
      content:
        `{% from "blocks/${name}.macro.html" import ${name}, ${name}_green %}

<div> {{ ${name}("reuse me!", "capitalize") }} </div>
<div> {{ ${name}_green("Macro blocks") }} 😁</div>
`,
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
      "blocks/fancy_title.macro.html",
    )
    mock.restore()

    tank(mock).generate_handler({ api: ["fancy]title"] })
    assertEquals(
      mock._create_block_file({ call: 0 }).args[0],
      "blocks/fancytitle.html",
    )
    mock.restore()

    tank(mock).generate_handler({
      data: ["fancy///title"],
    })
    assertEquals(
      mock._create_block_file({ call: 0 }).args[0],
      "blocks/fancytitle.html",
    )
    mock.restore()

    tank(mock).generate_handler({ html: ["FANCY=title%"] })
    assertEquals(
      mock._create_block_file({ call: 0 }).args[0],
      "blocks/fancytitle.html",
    )
    mock.restore()
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create a single page", () => {
  tank(mock).pages_handler({ single: ["pricing"] })
  try {
    assertEquals(mock._create_dir().calls[0], "blocks")

    assertEquals(
      mock._create_block_file({ call: 0 }).args[0],
      "blocks/titles.macro.html",
    )
    assertEquals(mock._insert_content({ call: 0 }).calls.length, 0)
    assertEquals(mock._create_dir().calls[1], "pricing")

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
    {% from "blocks/titles.macro.html" import titles_green %}

    <main class="flex flex-col items-center justify-center w-screen h-screen">
        Welcome to {{ titles_green("pricing Page!") }}
    </main>
    <script type="module" src="./main.js"></script>
</body>

</html>`,
    })

    assertPageFile({
      call: 1,
      file: "pricing/main.js",
      content: `import "./styles.css"

console.log("single pricing page!!!");`,
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
      "landing-page/index.html",
    )
    mock.restore()

    tank(mock).pages_handler({
      single: ["/-$-pricing-$-/"],
    })
    assertEquals(
      mock._create_page_file({ call: 0 }).args[0],
      "pricing/index.html",
    )
    mock.restore()

    tank(mock).pages_handler({ single: ["//eve///nts//"] })
    assertEquals(
      mock._create_page_file({ call: 0 }).args[0],
      "events/index.html",
    )
    mock.restore()

    tank(mock).pages_handler({
      single: ["\\ev\\\\\\ents\\"],
    })
    assertEquals(
      mock._create_page_file({ call: 0 }).args[0],
      "events/index.html",
    )
  } finally {
    mock.restore()
  }
})

Deno.test("tank can handle a page names with sub-directories", () => {
  try {
    tank(mock).pages_handler({
      single: ["landing-page/my/subfolder/page"],
    })
    assertEquals(
      mock._create_page_file({ call: 0 }).args[0],
      "landing-page/my/subfolder/page/index.html",
    )
  } finally {
    mock.restore()
  }
})

Deno.test("tank can handle a page names with Windows slashes \\.", () => {
  try {
    tank(mock).pages_handler({
      single: ["landing-page\\my\\subfolder\\page"],
    })
    assertEquals(
      mock._create_page_file({ call: 0 }).args[0],
      "landing-page/my/subfolder/page/index.html",
    )
  } finally {
    mock.restore()
  }
})

Deno.test("tank can create a multiple page creator files.", () => {
  try {
    tank(mock).pages_handler({ multiple: ["money"] })
    const name = "money"
    const pages_creator = `// the layout to be used for all the pages.
export const layout = "layouts/${name}.pages.html";
// export const renderOrder = 0; //  default is "0"

const baseURL = "https://api.coinlore.net";
const endpoint = \`\${baseURL}/api/tickers/\`;

export default async function* () {
  const response = await fetch(\`\${endpoint}?start=30&limit=10\`);
  const { data } = await response.json();

  for (const json of data) {
    // be careful of name collisions with your macro names
    // in your ${name}.pages.html layout!
    const model = {
      title: json.name,
      usd: json.price_usd,
      btc: json.price_btc,
      change_day: json.percent_change_24h,
      change_week: json.percent_change_7d,
      market: json.market_cap_usd,
    };

    yield {
      ...model,
      // Make sure the URL last character is slash "/"
      // in order to properly create an index.html file.
      // run: tank p --build
      // You can create all the pages even in a '/my/sub/directory/'
      url: \`/${name}/\${json.symbol}/\`,
      tags: ["api-${name}"],
    };
  }
}
`

    const money_layout = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
</head>

<body>
    {% from "pages_title.macro.html" import pages_title %}

    <h1>{{ pages_title(title) }}: {{ usd }} US / {{ btc }} BTC</h1>

    <section>
        <div>market: {{ market }}</div>
        <div>last 24 hrs: {{ change_day }}</div>
        <div>last week hrs: {{ change_week }}</div>
    </section>

    <script type="module" src="./../main.js"></script>
</body>

</html>
`

    const paginator_file =
      `export const layout = "layouts/paginator.pages.html";
// Changed this to "1"
// in order to create all paginated pages
// then will be able to fetch the pages by tag.
export const renderOrder = 1;

// exported data will be available in your layout
export const title = "money pages";
export const global_text = "Have nice day :)!";

export default function* ({ search, paginate }) {
  // https://lumeland.github.io/core/pagination/
  const items = search.pages("api-money");

  // modify your paginator URL as you desire :).
  const opts = { url: (n) => \`/money/page/\${n}/\`, size: 8 };

  for (const page of paginate(items, opts)) {
    // Added property "menu"
    // in order to show the first page
    // within our template "paginator.pages.html".
    if (page.pagination.page === 1) {
      page.menu = { visible: true, title: "money pages" };
    }

    yield page;
  }
}
`
    const paginator_layout = `<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <meta name="description" content="">
    <link rel="alternate" href="/feed.xml" type="application/atom+xml" title="">
    <link rel="alternate" href="/feed.json" type="application/json" title="">
</head>

<body>

    <nav>
        <a href="/">
            <strong>Home</strong>
        </a>

        <ul>
            {% for entry in search.pages("menu.visible=true") %}
            <li>
                <a href="{{ entry.data.url }}">
                    {{ entry.data.menu.title or entry.data.title }}
                </a>
            </li>
            {% endfor %}
        </ul>
    </nav>

    <main>
        <h1>{{ title }}: "{{ global_text }}"</h1>

        <!-- https://lumeland.github.io/core/pagination/#paginate-helper -->

        {% set pages = results %}

        <nav>
            <ul>
                {% if pagination.previous %}
                <li>
                    <a href="{{ pagination.previous }}" rel="prev">← Previous</a>
                </li>
                {% endif %}
                <li>
                    Page {{ pagination.page }}
                </li>
                {% if pagination.next %}
                <li>
                    <a href="{{ pagination.next }}" rel="next">Next →</a>
                </li>
                {% endif %}
            </ul>
        </nav>

        <ul>
            {% for page in pages %}
            <li>
                <a href="{{ page.data.url }}">
                    {% if page.data.title %}
                    <strong>{{ page.data.title }}</strong>
                    {% else %}
                    <code>{{ page.url }}</code>
                    {% endif %}
                </a>

                <time datetime="{{ page.data.date }}">
                    {{ page.data.date }}
                </time>
            </li>
            {% endfor %}
        </ul>

    </main>

    <script type="module" src="./../main.js"></script>
</body>

</html>`

    const css_indice_file = `// this will create a css file for the index pages.
export const url = "/money/page/styles.css";

// css content.
export default () =>
  \`@tailwind base;
@tailwind components;
@tailwind utilities;\`;`

    const css_pages_file = `// make sure you match the same url path
// as for your pages, if not 'npm run build' will not run!
export const url = "/money/styles.css";

export default () =>
  \`@tailwind base;
@tailwind components;
@tailwind utilities;\`;`

    const js_pages_file = `export const url = "/money/main.js";

export default () =>
  \`import "./styles.css";

// add all your js content...
console.log("money page!");\`;
`

    const js_indice_file = `export const url = "/money/page/main.js";

export default () =>
  \`import "./styles.css";

// add all your js content...
console.log("money indice!");\`;
`

    assertEquals(mock._create_dir().calls, ["blocks/layouts", "makers", "blocks"])

    assertEquals(
      mock._create_block_file({ call: 0 }).args[0],
      "blocks/pages_title.macro.html",
    )
    assertEquals(mock._insert_content({ call: 0 }).args, undefined)
    assertPageFile({
      file: "blocks/layouts/money.pages.html",
      call: 0,
      content: money_layout,
    })
    assertPageFile({
      file: "blocks/layouts/paginator.pages.html",
      call: 1,
      content: paginator_layout,
    })
    assertPageFile({
      file: "makers/money/indice/api.indice.js",
      call: 2,
      content: paginator_file,
    })
    assertPageFile({
      file: "makers/money/indice/css.indice.js",
      call: 3,
      content: css_indice_file,
    })
    assertPageFile({
      file: "makers/money/indice/js.indice.js",
      call: 4,
      content: js_indice_file,
    })
    assertPageFile({
      file: "makers/money/pages/api.pages.js",
      call: 5,
      content: pages_creator,
    })
    assertPageFile({
      file: "makers/money/pages/css.pages.js",
      call: 6,
      content: css_pages_file,
    })
    assertPageFile({
      file: "makers/money/pages/js.pages.js",
      call: 7,
      content: js_pages_file,
    })
  } finally {
    mock.restore()
  }
})

Deno.test("tank can slug a --multiple names", () => {
  try {
    tank(mock).pages_handler({
      multiple: ["landing-page"],
    })

    assertMultiplePageFileNames("landing-page")
    mock.restore()

    tank(mock).pages_handler({
      multiple: ["/-$-pricing-$-/"],
    })
    assertMultiplePageFileNames("pricing")
    mock.restore()

    tank(mock).pages_handler({
      multiple: ["//eve///nts//"],
    })
    assertMultiplePageFileNames("eve-nts")
    mock.restore()

    tank(mock).pages_handler({
      multiple: ["\\ev\\\\\\ents\\"],
    })
    assertMultiplePageFileNames("ev-ents")
  } finally {
    mock.restore()
  }
})

Deno.test("tank can handle a --multiple names with sub-directories", () => {
  try {
    tank(mock).pages_handler({
      multiple: ["landing-page/my/subfolder/page"],
    })
    assertMultiplePageFileNames("landing-page-my-subfolder-page")
  } finally {
    mock.restore()
  }
})

Deno.test("tank can handle a --multiple names with Windows slashes \\.", () => {
  try {
    tank(mock).pages_handler({
      multiple: ["landing-page\\my\\subfolder\\page"],
    })
    assertMultiplePageFileNames("landing-page-my-subfolder-page")
  } finally {
    mock.restore()
  }
})

Deno.test("tank do not create repeated blocks.", () => {
  try {
    mock._block_exist({ returns: true })
    tank(mock).generate_handler({ html: ["header", "jamon"] })
    assertEquals(mock._create_dir().calls[0], "blocks")
    assertEquals(mock._create_block_file().calls.length, 0)
    assertEquals(
      mock._stdOut({ call: 0 }).args,
      "\x1b[95mAlready Created Block: header\x1b[39m",
    )

    mock.restore()
    mock._block_exist({ returns: true })
    tank(mock).generate_handler({ data: ["header", "jamon"] })
    assertEquals(mock._create_dir().calls[0], "blocks")
    assertEquals(mock._create_block_file().calls.length, 0)
    assertEquals(
      mock._stdOut({ call: 0 }).args,
      "\x1b[95mAlready Created Block: header\x1b[39m",
    )

    mock.restore()
    mock._block_exist({ returns: true })
    tank(mock).generate_handler({ api: ["header", "jamon"] })
    assertEquals(mock._create_dir().calls[0], "blocks")
    assertEquals(mock._create_block_file().calls.length, 0)
    assertEquals(
      mock._stdOut({ call: 0 }).args,
      "\x1b[95mAlready Created Block: header\x1b[39m",
    )

    mock.restore()
    mock._block_exist({ returns: true })
    tank(mock).generate_handler({ macro: ["header", "jamon"] })
    assertEquals(mock._create_block_file().calls.length, 0)
    assertEquals(
      mock._stdOut({ call: 0 }).args,
      "\x1b[95mAlready Created Block: header\x1b[39m",
    )
    assertEquals(mock._create_dir().calls[0], "blocks")
  } finally {
    mock.restore()
  }
})

Deno.test({
  name:
    "tank can build --multiple pages and move files in current directory on Windows.",
  ignore: true,
  fn: async () => {
    try {
      await tank(mock).pages_handler({ build: true })
      // assertEquals(mock.executed({ call: 0 }).args, [
      //   "cmd",
      //   "/c",
      //   "mv",
      //   "_site/**",
      //   ".",
      // ])
    } finally {
      mock.restore()
    }
  },
})

// todo: test when node.js is no installed bc npm will be absente.

function assertMultiplePageFileNames(name: string) {
  assertEquals(
    mock._create_page_file({ call: 0 }).args[0],
    `blocks/layouts/${name}.pages.html`,
  )
  assertEquals(
    mock._create_page_file({ call: 1 }).args[0],
    "blocks/layouts/paginator.pages.html",
  )
  assertEquals(
    mock._create_page_file({ call: 2 }).args[0],
    `makers/${name}/indice/api.indice.js`,
  )
  assertEquals(
    mock._create_page_file({ call: 3 }).args[0],
    `makers/${name}/indice/css.indice.js`,
  )
  assertEquals(
    mock._create_page_file({ call: 4 }).args[0],
    `makers/${name}/indice/js.indice.js`,
  )
  assertEquals(
    mock._create_page_file({ call: 5 }).args[0],
    `makers/${name}/pages/api.pages.js`,
  )
  assertEquals(
    mock._create_page_file({ call: 6 }).args[0],
    `makers/${name}/pages/css.pages.js`,
  )
  assertEquals(
    mock._create_page_file({ call: 7 }).args[0],
    `makers/${name}/pages/js.pages.js`,
  )
}

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
  const dev_content = `// https://axios-http.com/docs/instance
const axios = require("axios").default;
const baseURL = "https://animechan.vercel.app";
const endpoint = \`\${baseURL}/api/quotes/anime\`;
const timeout = { timeout: 2500 /*ms*/ };

module.exports = async function () {
  let json;

  try {
    json = await axios.get(\`\${endpoint}?title=zero+kara\`, timeout);
  } catch ({ message }) {
    console.error(\`[Model/${name}]: \${message}\`);
    process.exit(1);
  }

  // Pass the JSON Array in
  // Or customize the Model data
  // the way you want for your component view,
  // Happy Modeling!
  if (json) {
    const arrayOfData = json.data.slice(0, 4);
    return arrayOfData;
  }

  console.error(\`[Model/${name}]: No data found.\`);
  process.exit(1);
};
`

  const prod_content = `// https://axios-http.com/docs/instance
const axios = require("axios").default;
const baseURL = "https://animechan.vercel.app";
const endpoint = \`\${baseURL}/api/quotes/anime\`;
const timeout = { timeout: 2500 /*ms*/ };

module.exports = async function () {
  let json;

  try {
    json = await axios.get(\`\${endpoint}?title=saint+seiya\`, timeout);
  } catch ({ message }) {
    console.error(\`[Model/${name}]: \${message}\`);
    process.exit(1);
  }

  // Pass the JSON Array in
  // Or customize the Model data
  // the way you want for your component view,
  // Happy Modeling!
  if (json) {
    const arrayOfData = json.data.slice(0, 4);
    return arrayOfData;
  }

  console.error(\`[Model/${name}]: No data found.\`);
  process.exit(1);
};
`

  const view_content = `<section class="bg-gray-900 text-zinc-100">
    <span class="text-3xl text-transparent uppercase bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
        ${name} api block
    </span>
    <section class="flex flex-col flex-wrap sm:flex-row">

        <!-- Items from *.model.{dev,prod}.js have a "_items" suffix. -->
        <!-- you can change the suffix in "__tank__/defaults.js" -->

        <!-- For this special component, you will need to stop the local Vite server. -->
        <!-- and re-run it!, $ npm run dev -->

        <!-- This component, created two model files, one for development process. -->
        <!-- one for your production model. yo can see the production output by running:  -->
        <!-- $ npm run prod, then $ npm run preview -->

        {% for item in ${name}_items %}
        <article class="flex flex-col items-center justify-center w-full sm:w-1/4">
            <header>
                <picture class="flex justify-center p-3">

                    <!-- https://mozilla.github.io/nunjucks/templating.html#if-expression -->
                    <img class="w-40 h-40 p-0.5 rounded-3xl bg-clip-border bg-gradient-to-r from-pink-500 to-violet-500"
                        src="//www.{{ 'placecage' if loop.index % 2 else 'fillmurray' }}.com/g/{{ loop.index }}00/{{ loop.index }}00"
                        alt="random_image">

                </picture>
                <h3 class="pb-2 text-base text-center">
                    {{ item.character }}
                </h3>
            </header>

            <blockquote class="w-3/4 text-sm">
                {{ item.quote | truncate(70) }}
            </blockquote>
        </article>
        {% endfor %}
    </section>
</section>`

  const [file, content] = mock._create_block_file({ call }).args
  assertEquals(file, `blocks/${name}.html`, `${name}.html not created.`)
  assertEquals(content, view_content)

  const [file2, content2] = mock._create_block_file({ call: call + 1 }).args
  assertEquals(
    file2,
    `blocks/${name}.model.dev.js`,
    `${name}.model.dev.js not created.`,
  )
  assertEquals(content2, dev_content)

  const [file3, content3] = mock._create_block_file({ call: call + 2 }).args
  assertEquals(
    file3,
    `blocks/${name}.model.prod.js`,
    `${name}.model.prod.js not created.`,
  )
  assertEquals(content3, prod_content)
}

function assertDataBlock({ call, name }: { call: number; name: string }) {
  const [file, content] = mock._create_block_file({ call }).args
  assertEquals(file, `blocks/${name}.html`, `${name}.html not created.`)
  assertEquals(
    content,
    `<article class="flex flex-col items-center antialiased bg-rose-500 text-gray-50">
    <h1 class="text-4xl font-extralight">
        ${name} block
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
                {{ ${name}_items | dump | truncate(20) }}
            </summary>

            <pre class="pt-6">{{ ${name}_items | dump(2) }}</pre>
        </details>

        <ol>
            {% for item in ${name}_items %}
            <li class="list-decimal">{{ item.title }}</li>
            {% endfor %}
        </ol>
    </section>
</article>
`,
  )

  const [file2, content2] = mock._create_block_file({ call: call + 1 }).args
  assertEquals(
    file2,
    `blocks/${name}.model.json`,
    `${name}.model.json not created.`,
  )
  assertEquals(
    content2,
    "[\n  {\n    \"title\": \"a nice " +
      name +
      "\",\n    \"content\": \"a cool content for " +
      name +
      "\"\n  },\n  {\n    \"title\": \"second title\",\n    \"content\": \"more content for " +
      name +
      "\"\n  }\n]",
  )
}

function assertOutput(text: string) {
  assertEquals(mock._stdOut({ call: 0 }).args, text)
}

function assertHTMLBlock({ call, name }: { call: number; name: string }) {
  const [file, content] = mock._create_block_file({ call }).args
  assertEquals(mock._create_dir().calls[call], "blocks")
  assertEquals(file, `blocks/${name}.html`)
  assert(
    content
      .split("\n")
      .includes(
        `<h1 class="text-3xl text-center uppercase">${name} block</h1>`,
      ),
  )

  assertAppend({
    call,
    content: "{% include \"blocks/" + name + ".html\" %}",
  })
}

function assertViteConfigs({
  folder,
  call,
}: {
  call: number;
  folder?: string;
}) {
  assertEquals(mock._create_files().calls[call].name, folder)
  assertEquals(mock._create_directories().calls[call], ["public", "__tank__"])
  assertEquals(mock._create_files().calls[call].files, [
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
