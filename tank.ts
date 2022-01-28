import yargs from "https://deno.land/x/yargs/deno.ts"
import {
  brightCyan,
  brightGreen,
  brightRed,
  green,
} from "https://deno.land/std@0.121.0/fmt/colors.ts"

import {
  Arguments,
  FancyFiles,
  FileContents,
  HTTPArguments,
  options,
  templates,
} from "./templates/blog.ts"

import { Actions, actions } from "./actions.ts"
import { YargsInstance } from "https://deno.land/x/yargs@v17.3.1-deno/build/lib/yargs-factory.js"
import slug from "https://esm.sh/slug@5.2.0"
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

type BlogContent = {
  directories: string[];
  files: FancyFiles;
  file_contents: FileContents;
};

// eslint-disable-next-line max-lines-per-function
export function tank(spec: Actions) {
  const {
    create_dir,
    create_block_file,
    create_page_file,
    create_directories,
    create_files,
    exec,
    insert_content,
    stdOut,
  } = spec

  // eslint-disable-next-line max-lines-per-function
  function pages_handler({ single }: { single: string[] }) {
    if (_not_empty(single)) {

      create_macro_block("title")
      // eslint-disable-next-line max-lines-per-function
      single.forEach((page_name) => {
        slug.charmap["-"] = "-"
        slug.charmap["/"] = "/"
        slug.charmap["\\"] = "/"
        page_name = slug(page_name, { remove: /^\/*|\/*$|[/*]{2,}/g })

        create_dir(page_name)
        create_page_file(
          `${page_name}/index.html`,
          `<!DOCTYPE html>
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
        Welcome to {{ title_green("${page_name} Page!") }}
    </main>
    <script type="module" src="./main.js"></script>
</body>

</html>`,
        )

        create_page_file(
          `${page_name}/main.js`,
          `import "./styles.css"

console.log("${page_name}!!!")`,
        )

        create_page_file(
          `${page_name}/styles.css`,
          `@tailwind base;
@tailwind components;
@tailwind utilities;`,
        )
      })
    }
  }
  // eslint-disable-next-line max-lines-per-function
  function generate_handler(
    { html, data, api, macro }: {
      html?: string[];
      data?: string[];
      api?: string[];
      macro?: string[];
    },
  ) {
    slug.charmap["-"] = "_"
    if (_not_empty(html)) {
      html?.forEach((blockname) => create_html_block(slug(blockname, "_")))
    }
    if (_not_empty(data)) {
      data?.forEach((blockname) => create_data_block(slug(blockname, "_")))
    }
    if (_not_empty(api)) {
      api?.forEach((blockname) => create_api_block(slug(blockname, "_")))
    }
    if (_not_empty(macro)) {
      macro?.forEach((blockname) => create_macro_block(slug(blockname, "_")))
    }
  }

  // eslint-disable-next-line max-lines-per-function
  function create_macro_block(name: string) {
    create_dir("blocks")
    create_block_file(
      `blocks/${name}.macro.html`,
      `<!-- https://mozilla.github.io/nunjucks/templating.html#macro -->

{% macro ${name}(text, transform = 'uppercase') %}

<span class="text-3xl text-transparent {{transform}} bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
    {{ text }}
</span>

{% endmacro %}

{% macro ${name}_green(text, transform = 'uppercase') %}

<span class="text-3xl text-transparent {{transform}} bg-clip-text bg-gradient-to-r from-green-500 to-sky-500">
    {{ text }}
</span>

{% endmacro %}`,
    )

    insert_content(
      `{% from "blocks/${name}.macro.html" import ${name}, ${name}_green %}

    <section
        class="flex flex-col-reverse items-center space-y-2 font-bold transition duration-500 bg-gray-900 cursor-move hover:bg-violet-600 space">
        {{ ${name}("reuse me!", "capitalize") }}
        😁
        {{ ${name}_green("Macro blocks") }}
    </section>`,
      "index.html",
    )
  }

  // eslint-disable-next-line max-lines-per-function
  function create_api_block(name: string) {
    create_dir("blocks")
    create_block_file(
      `blocks/${name}.html`,
      `<section class="bg-gray-900 text-zinc-100">
    <span class="text-3xl text-transparent uppercase bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
    ${name} api block
    </span>
    <section class="flex flex-col flex-wrap sm:flex-row">
        <!-- items from *.api.{dev,prod}.json have a "_api_items" suffix -->
        <!-- you can change the suffix in "__tank__/defaults.js" -->
        {% for item in ${name}_api_items %}
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
</section>`,
    )
    create_block_file(
      `blocks/${name}.api.dev.js`,
      `// https://axios-http.com/docs/instance
const axios = require("axios").default;

module.exports = async function () {
  const json = await axios.get(
    "https://animechan.vercel.app/api/quotes/anime?title=zero+kara",
    { timeout: 2500 /*ms*/ }
  );

  if (json) return json.data.slice(0, 4);
  return "No data found.";
};
    `,
    )
    create_block_file(
      `blocks/${name}.api.prod.js`,
      `// https://axios-http.com/docs/instance
const axios = require("axios").default;

module.exports = async function () {
  const json = await axios.get(
    "https://animechan.vercel.app/api/quotes/anime?title=saint+seiya",
    { timeout: 2500 /*ms*/ }
  );

  if (json) return json.data.slice(0, 4);
  return "No data found.";
};`,
    )

    const block = "{% include \"blocks/" + name + ".html" + "\" %}"
    insert_content(block, "index.html")
  }

  async function vite_handler() {
    await add_vite({})
  }

  async function blog_handler({ bs, name }: Arguments) {
    if (name) create_blog("no-bullshit", name)
    if (!bs) return
    await add_vite({ for_project: name })
  }

  function http_handler(argv: HTTPArguments) {
    listen(argv.port)
  }

  function create_html_block(name: string) {
    create_dir("blocks")
    create_block_file(`blocks/${name}.html`, `<h1>${name}</h1>`)
    const block = "{% include \"blocks/" + name + ".html" + "\" %}"
    insert_content(block, "index.html")
  }

  // eslint-disable-next-line max-lines-per-function
  function create_data_block(name: string) {
    create_dir("blocks")
    create_block_file(
      `blocks/${name}.html`,
      `<article class="flex flex-col items-center antialiased bg-rose-500 text-gray-50">
      <h1 class="text-4xl font-extralight">
        ${name} block
      </h1>

      <!-- https://mozilla.github.io/nunjucks/templating.html#dump -->
      <!-- items from *.data.json have a "_items" suffix -->
      <!-- you can change the suffix in "__tank__/defaults.js" -->
      <section>
          <details>
              <summary class="pl-3 font-mono text-xl ">
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
  </article>`,
    )

    create_block_file(
      `blocks/${name}.data.json`,
      JSON.stringify(
        [{
          title: "a nice " + name,
          content: "a cool content for " + name,
        }, {
          title: "second title",
          content: "more content for " + name,
        }],
        undefined,
        2,
      ),
    )
    const block = "{% include \"blocks/" + name + ".html" + "\" %}"
    insert_content(block, "index.html")
  }

  function listen(port: number) {
    // TODO: simple server
    throw new Error("Implement SimpleServer. " + port)
  }

  // eslint-disable-next-line max-lines-per-function
  async function add_vite(
    { for_project: name }: { for_project?: string },
  ): Promise<void> {
    const {
      unfancy_directories,
      unfancy_files: files,
      file_contents: contents,
    } = templates[selected()]

    // todo e2e
    insert_content(
      `@tailwind base;
@tailwind components;
@tailwind utilities;`,
      "styles.css",
    )

    create_directories(unfancy_directories, name)
    create_files({ files, name, contents })
    await exec(_npm_install_for_windows(name))

    name
      ? stdOut(`\nTry cd ${name} && ${brightGreen("npm run dev")}!\n`)
      : stdOut(`\nTry ${brightGreen("npm run dev")}!\n`)
  }

  function create_blog(project: options, name: string) {
    const {
      directories,
      files,
      file_contents: contents,
    }: BlogContent = templates[selected()]

    create_directories(directories, name)
    create_files({ files, name, contents })
    stdOut("\nTry your fancy project: " + brightGreen(`cd ${name}`) + "!\n")
  }

  return {
    pages_handler,
    generate_handler,
    http_handler,
    vite_handler,
    blog_handler,
  }
}

const p_opt = {
  alias: "port",
  default: 3000,
  describe: "Port.",
  type: "number",
}

const HTTP = {
  command: "<http>",
  describe: "Simple HTTP Server.",
  builder: (cli: YargsInstance) => cli.options({ "p": p_opt }),
  handler: tank(actions).http_handler,
  example: ["tank http", "Simple HTTP Server."],
}

const name_opt = {
  alias: "name",
  describe: "Project name.",
  type: "string",
}

const bs_opt = {
  alias: "bs",
  default: false,
  describe: "Adds Vite + Tailwind configurations.",
  type: "boolean",
}

const BLOG = {
  command: "<blog>",
  describe: "Creates a new project.",
  builder: (cli: YargsInstance) => cli.options({ "n": name_opt, "b": bs_opt }),
  handler: tank(actions).blog_handler,
  example: [
    "tank blog --name my-blog --no-bs",
    "Creates an unfancy blog project.",
  ],
}

const VITE = {
  command: "<vite>",
  describe: "Updates your project with Vite + Tailwind stuff.",
  builder: noop,
  handler: tank(actions).vite_handler,
  example: [
    "tank vite",
    "Tailwind + Vite configurations for your project.",
  ],
}

const html_opt = {
  "h": {
    alias: "html",
    describe:
      "Creates an html block component. You need Vite config in order to run it!.",
    type: "array",
  },
  "d": {
    alias: "data",
    describe:
      "Creates a data block component. You need Vite configs in order to run it!",
    type: "array",
  },
  "a": {
    alias: "api",
    describe:
      "Creates an API block component. You need Vite configs in order to run it!",
    type: "array",
  },
  "m": {
    alias: "macro",
    describe:
      "Creates a macro block component. You need Vite configs in order to run it!",
    type: "array",
  },
}

const GENERATOR = {
  command: "<g>",
  describe: `Generates a component. [${
    brightCyan(
      "--html sidebar footer, --data features, --api anime --macro title",
    )
  }]`,
  builder: (cli: YargsInstance) => cli.options(html_opt).check(block_validator),
  handler: tank(actions).generate_handler,
  example: ["tank g --html sidebar footer --data features --api events"],
}

const page_opt = {
  "s": {
    alias: "single",
    describe:
      "Creates a single page. You need Vite config in order to run it!.",
    type: "array",
  },
}

const PAGE = {
  command: "<p>",
  describe: `Generates new pages. [${
    brightCyan(
      "--single contact pricing login",
    )
  }]`,
  builder: (cli: YargsInstance) =>
    cli.options(page_opt).check(function ({ s }: { s: string[] }) {
      // todo: e2e
      if (_not_empty_option(s)) {
        throw new Error(brightRed("Single page name required."))
      }

      return true
    }),
  handler: tank(actions).pages_handler,
  example: ["tank p --single signup"],
}

function _not_empty(block: string[] | undefined) {
  if (!block) return false
  return block.length > 0
}

// eslint-disable-next-line max-lines-per-function
function _npm_install_for_windows(
  name: string | undefined,
): string[] {
  return name
    ? [
      "cmd",
      "/c",
      "cd",
      name,
      "&&",
      "cmd",
      "/c",
      "npm",
      "install",
    ]
    : ["cmd", "/c", "npm", "install"]
}

// eslint-disable-next-line max-lines-per-function
function block_validator(
  { h, d, a, m }: { h: string[]; d: string[]; a: string[]; m: string[] },
): true {
  if (_not_empty_option(h)) {
    throw new Error(brightRed("HTML component name required."))
  }

  // TODO: e2e test
  if (_not_empty_option(d)) {
    throw new Error(brightRed("Data component name required."))
  }

  // TODO: e2e test
  if (_not_empty_option(a)) {
    throw new Error(brightRed("API component name required."))
  }

  // TODO: e2e test
  if (_not_empty_option(m)) {
    throw new Error(brightRed("Macro component name required."))
  }
  return true
}

function _not_empty_option(h: string[]) {
  return Array.isArray(h) && h.length === 0
}

function selected(): options {
  if (Deno.args[0] === "no-bullshit") {
    return "no-bullshit"
  }
  return "no-bullshit"
}

if (import.meta.main) {
  yargs(Deno.args)
    .epilogue(
      "for more information, find our manual at http://example.com",
    )
    .command(HTTP).example(...HTTP.example)
    .command(BLOG).example(...BLOG.example)
    .command(VITE).example(...VITE.example)
    .command(GENERATOR).example(...GENERATOR.example)
    .command(PAGE).example(...PAGE.example)
    .example([
      ["tank server-blocks --no-tests"],
      ["tank add --layouts", "Create layouts"],
    ])
    .strictCommands()
    .demandCommand(1)
    .version("0.7.0.8")
    .parse()
}
