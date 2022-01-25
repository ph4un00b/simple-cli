import yargs from "https://deno.land/x/yargs/deno.ts"
import { green } from "https://deno.land/std@0.121.0/fmt/colors.ts"

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
    create_file,
    create_directories,
    create_files,
    exec,
    append_block,
    stdOut,
  } = spec

  // eslint-disable-next-line max-lines-per-function
  function generate_handler(
    { html, data, api }: { html?: string[]; data?: string[]; api?: string[] },
  ) {
    if (html && html.length > 0) {
      html.forEach((block) => create_html_block(block))
    }
    if (data && data.length > 0) {
      data.forEach((block) => create_data_block(block))
    }
    if (api && api.length > 0) {
      api.forEach((block) => create_api_block(block))
    }
  }

  // eslint-disable-next-line max-lines-per-function
  function create_api_block(name:string) {
    create_dir("blocks")
    create_file(`blocks/${name}.html`, `<section class="bg-gray-900 text-zinc-100">
    <span class="text-3xl text-transparent uppercase bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
    ${name} api block
    </span>
    <section class="flex flex-col flex-wrap sm:flex-row">
        <!-- items from *.api.{dev,prod}.json have a "_api_items" suffix -->
        <!-- you can change the suffix in "__tank__/defaults.js" -->
        {% for item in eventos_api_items %}
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
</section>`)
    create_file(`blocks/${name}.api.dev.js`, `// https://axios-http.com/docs/instance
const axios = require("axios").default;

module.exports = async function () {
  const json = await axios.get(
    "https://animechan.vercel.app/api/quotes/anime?title=zero+kara",
    { timeout: 2500 /*ms*/ }
  );

  if (json) return json.data.slice(0, 4);
  return "No data found.";
};
    `)
    create_file(`blocks/${name}.api.prod.js`, `// https://axios-http.com/docs/instance
const axios = require("axios").default;

module.exports = async function () {
  const json = await axios.get(
    "https://animechan.vercel.app/api/quotes/anime?title=saint+seiya",
    { timeout: 2500 /*ms*/ }
  );

  if (json) return json.data.slice(0, 4);
  return "No data found.";
};
    `)
    append_block(name, "index.html")
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
    create_file(`blocks/${name}.html`, `<h1>${name}</h1>`)
    append_block(name, "index.html")
  }

  // eslint-disable-next-line max-lines-per-function
  function create_data_block(name: string) {
    create_dir("blocks")
    create_file(
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

    create_file(
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
    append_block(name, "index.html")
  }

  //// pick from oak
  // function stripEol(value: Uint8Array): Uint8Array {
  //   if (value[value.byteLength - 1] == LF) {
  //     let drop = 1
  //     if (value.byteLength > 1 && value[value.byteLength - 2] === CR) {
  //       drop = 2
  //     }
  //     return value.subarray(0, value.byteLength - drop)
  //   }
  //   return value
  // }

  function listen(port: number) {
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

    create_directories(unfancy_directories, name)
    create_files({ files, name, contents })
    await exec(_npm_install_for_windows(name))
    name
      ? stdOut(`Try cd ${name} && ${green("npm run dev")}!`)
      : stdOut(`Try ${green("npm run dev")}!`)
  }

  function create_blog(project: options, name: string) {
    const {
      directories,
      files,
      file_contents: contents,
    }: BlogContent = templates[selected()]

    create_directories(directories, name)
    create_files({ files, name, contents })
  }

  return {
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
  // demandOption: true,
  describe: "Project name.",
  type: "string",
}

const bs_opt = {
  alias: "bs",
  default: false,
  describe: "Adds postcss, tailwind, vite and npm configurations.",
  type: "boolean",
}

const BLOG = {
  command: "<blog>",
  describe: "Create blog project.",
  builder: (cli: YargsInstance) => cli.options({ "n": name_opt, "b": bs_opt }),
  handler: tank(actions).blog_handler,
  example: [
    "tank blog --name my-blog --no-bs",
    "Create an unfancy blog project.",
  ],
}

const VITE = {
  command: "<vite>",
  describe: "Update project with unfancy stuff.",
  builder: noop,
  handler: tank(actions).vite_handler,
  example: [
    "tank vite",
    "Tailwind + Vite configurations for project.",
  ],
}

const html_opt = {
  "h": {
    alias: "html",
    describe:
      "Create html block component. You need Vite config in order to run it!.",
    type: "array",
  },
  "d": {
    alias: "data",
    describe:
      "Create data block component. You need Vite configs in order to run it!",
    type: "array",
  },
  "a": {
    alias: "api",
    describe:
      "Create API block component. You need Vite configs in order to run it!",
    type: "array",
  },
}

const GENERATOR = {
  command: "<g>",
  describe: "Generate component. [--html, --data, --api]",
  builder: (cli: YargsInstance) =>
    cli.options(html_opt).check(validate_html_blocks),
  handler: tank(actions).generate_handler,
  example: ["tank g --html sidebar footer --data features --api events"],
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
function validate_html_blocks(
  { h, d, a }: { h: string[]; d: string[]; a: string[] },
): true {
  if (Array.isArray(h) && h.length === 0) {
    actions.stdOut("HTML component name required.")
  }

  // TODO: e2e test
  if (Array.isArray(d) && d.length === 0) {
    actions.stdOut("Data component name required.")
  }

  // TODO: e2e test
  if (Array.isArray(a) && a.length === 0) {
    actions.stdOut("API component name required.")
  }
  return true
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
    .example([
      ["tank server-blocks --no-tests"],
      ["tank add --layouts", "Create layouts"],
    ])
    .strictCommands()
    .demandCommand(1)
    .version("0.5.0.2")
    .parse()
}
