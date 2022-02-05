import {
  bgBlack,
  brightGreen,
  brightMagenta,
  brightRed,
  parse,
  YargsInstance,
} from "./deps.ts"

import {
  Arguments,
  FancyFiles,
  FileContents,
  HTTPArguments,
  options,
  templates,
} from "./templates/tailwind.ts"
import { Actions, actions } from "./actions.ts"

import slug from "https://esm.sh/slug@5.2.0"
import yargs from "https://deno.land/x/yargs/deno.ts"
import lume from "https://deno.land/x/lume@v1.4.3/mod.ts"
import slugify_urls from "https://deno.land/x/lume@v1.4.3/plugins/slugify_urls.ts"

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

type ProjectContent = {
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
    block_exist,
  } = spec

  // eslint-disable-next-line max-lines-per-function
  async function pages_handler({
    single,
    multiple,
    build,
  }: {
    single?: string[];
    multiple?: string[];
    build?: boolean;
  }) {
    if (build) {
      await build_multiple_pages()
    }

    if (_not_empty(multiple)) {
      // eslint-disable-next-line max-lines-per-function
      multiple?.forEach((name) => {
        slug.charmap["/"] = "-"
        slug.charmap["\\"] = "-"
        name = slug(name, {
          remove: /^\/*|\/*$|[/*]{2,}/g,
        })

        const { templates: t } = templates["tailwind"]

        create_dir("blocks/layouts")
        create_dir("makers")

        create_macro_block("pages_title", false)
        create_page_file(_layouts_file(name), t["layout.pages"])
        create_page_file(_layouts_file("paginator"), t["layout.index"])

        for (const type of ["api", "css", "js"]) {
          create_page_file(
            _indice_file(name, type),
            _replace_indice(t, type, { name }),
          )
        }

        for (const type of ["api", "css", "js"]) {
          create_page_file(
            _pages_file(name, type),
            _replace_page(t, type, { name }),
          )
        }

        // todo: e2e colors, output
        stdOut(`\nAdd new content for: ${brightGreen("tailwind.config.js")}.`)
        stdOut(bgBlack(brightMagenta("\n\n./" + name + "/**/*.{html,js}\n\n")))
        stdOut(brightGreen("Adjust as needed."))
      })
    }

    if (_not_empty(single)) {
      create_macro_block("titles", false)
      // eslint-disable-next-line max-lines-per-function
      single?.forEach((page_name) => {
        slug.charmap["-"] = "-"
        slug.charmap["/"] = "/"
        slug.charmap["\\"] = "/"
        page_name = slug(page_name, {
          remove: /^\/*|\/*$|[/*]{2,}/g,
        })

        const { templates: t } = templates["tailwind"]

        create_dir(page_name)

        const pages = [
          ["index.html", "single.view"],
          ["main.js", "single.js"],
          ["styles.css", "single.css"],
        ]

        for (const [file, id] of pages) {
          create_page_file(
            `${page_name}/${file}`,
            _replace(t, id, { name: page_name }),
          )
        }

        // todo: e2e colors, output
        stdOut(`\nAdd new content for: ${brightGreen("tailwind.config.js")}.`)
        stdOut(
          bgBlack(brightMagenta("\n\n./" + page_name + "/**/*.{html,js}\n\n")),
        )
      })
    }
  }
  // eslint-disable-next-line max-lines-per-function
  function generate_handler({
    html,
    data,
    api,
    macro,
  }: {
    html?: string[];
    data?: string[];
    api?: string[];
    macro?: string[];
  }) {
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
  function create_macro_block(name: string, insert = true) {
    const { templates: t } = templates["tailwind"]
    create_dir("blocks")

    if (block_exist(name)) {
      stdOut(brightMagenta("Already Created Block: " + name))
      return
    }

    create_block_file(
      `blocks/${name}.macro.html`,
      _replace(t, "macro.view", { name }),
    )

    if (!insert) return
    insert_content(_replace(t, "patch.macro", { name }), "index.html")
  }

  // eslint-disable-next-line max-lines-per-function
  function create_api_block(name: string) {
    const { templates: t } = templates["tailwind"]
    create_dir("blocks")

    if (block_exist(name)) {
      stdOut(brightMagenta("Already Created Block: " + name))
      return
    }

    create_block_file(`blocks/${name}.html`, _replace(t, "api.view", { name }))
    create_block_file(
      `blocks/${name}.model.dev.js`,
      _replace(t, "api.dev.model", { name }),
    )
    create_block_file(
      `blocks/${name}.model.prod.js`,
      _replace(t, "api.prod.model", { name }),
    )

    insert_content(`{% include "blocks/${name}.html" %}`, "index.html")
  }

  async function vite_handler() {
    await add_vite({})
  }

  async function new_handler({ bs, name }: Arguments) {
    if (name) new_project("no-bullshit", name)
    if (!bs) return
    await add_vite({ for_project: name })
  }

  // eslint-disable-next-line max-lines-per-function
  async function build_multiple_pages() {
    // todo, tests with sinon
    const site = lume(
      { quiet: false },
      {
        yaml: {
          extensions: [".pages.yaml", ".pages.yml"],
        },
        markdown: {
          // todo[1]: error, research why content is not parsed?
          extensions: [".pages.md"],
        },
        json: {
          // not working, due to docs
          extensions: {
            data: [".pages.json"],
            pages: [".pages.json"],
          },
        },
        // todo: pr docs enhancement
        modules: {
          extensions: {
            pages: [".indice.js", ".pages.js", ".pages.ts", ".pages.md"],
            data: [".pages.js", ".pages.ts"],
            components: [".pages.js", ".pages.ts"],
          },
        },
        nunjucks: {
          extensions: [".pages.html"],
          includes: "blocks",
          options: {
            throwOnUndefined: true,
          },
        },
      },
    )

    let start: number
    const folders_to_remove = new Set<string>()

    site.addEventListener("beforeBuild", () => {
      start = Date.now()
    })

    site.use(slugify_urls())

    // eslint-disable-next-line max-lines-per-function
    site.addEventListener("afterBuild", ({ pages }) => {
      if (!pages) return
      if (pages.length === 0) return

      for (
        const {
          dest: { path },
        } of pages
      ) {
        folders_to_remove.add(_parent_directory(path))
      }

      site.run("deleting-folders")

      const millis = Date.now() - start
      stdOut(brightGreen(`took: ${Math.floor(millis)} ms.`))
    })

    // eslint-disable-next-line max-lines-per-function
    site.script("deleting-folders", async () => {
      for (const folder of folders_to_remove) {
        try {
          Deno.removeSync(folder, { recursive: true })
        } catch (error) {
          // console.log(error);
        }
      }

      try {
        if (Deno.build.os === "windows") {
          await exec(["cmd", "/c", "mv", "_site/**", "."])
        } else {
          await exec(["cp", "-R", "_site/", "."])
        }
        Deno.removeSync("_site", { recursive: true })
      } catch (error) {
        // console.log(error);
      }
    })

    function _parent_directory(path: string) {
      return parse(path).dir.split("/")[1]
    }

    await site
      .ignore("blocks")
      .ignore("src")
      .ignore("public")
      .ignore("dist")
      .build()
  }

  function http_handler(argv: HTTPArguments) {
    listen(argv.port)
  }

  // eslint-disable-next-line max-lines-per-function
  function create_html_block(name: string) {
    const { templates: t } = templates["tailwind"]

    create_dir("blocks")

    if (block_exist(name)) {
      stdOut(brightMagenta("Already Created Block: " + name))
      return
    }

    create_block_file(
      `blocks/${name}.html`,
      _replace(t, "html.view", { name }),
    )
    insert_content(`{% include "blocks/${name}.html" %}`, "index.html")
  }

  // eslint-disable-next-line max-lines-per-function
  function create_data_block(name: string) {
    const { templates: t } = templates["tailwind"]

    create_dir("blocks")

    if (block_exist(name)) {
      stdOut(brightMagenta("Already Created Block: " + name))
      return
    }

    create_block_file(
      `blocks/${name}.html`,
      _replace(t, "data.view", { name }),
    )

    create_block_file(
      `blocks/${name}.model.json`,
      _replace(t, "data.model", { name }),
    )

    insert_content(`{% include "blocks/${name}.html" %}`, "index.html")
  }

  function listen(port: number) {
    // TODO: simple server
    throw new Error("Implement SimpleServer. " + port)
  }

  // eslint-disable-next-line max-lines-per-function
  async function add_vite({
    for_project: name,
  }: {
    for_project?: string;
  }): Promise<void> {
    const {
      unfancy_directories,
      unfancy_files: files,
      file_contents: contents,
      templates: t,
    } = templates["tailwind"]

    // todo e2e
    insert_content(t["patch.vite.css"], "styles.css")

    create_directories(unfancy_directories, name)
    create_files({ files, name, contents })
    await exec(_npm_install_for_windows(name))

    name
      ? stdOut(`\nTry cd ${name} && ${brightGreen("npm run dev")}!\n`)
      : stdOut(`\nTry ${brightGreen("npm run dev")}!\n`)
  }

  // eslint-disable-next-line max-lines-per-function
  function new_project(project: options, name: string) {
    const {
      directories,
      files,
      file_contents: contents,
    }: ProjectContent = templates["tailwind"]

    create_directories(directories, name)
    create_files({ files, name, contents })
    stdOut("\nTry your fancy project: " + brightGreen(`cd ${name}`) + "!\n")
  }

  return {
    pages_handler,
    generate_handler,
    http_handler,
    vite_handler,
    new_handler,
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
  builder: (cli: YargsInstance) => cli.options({ p: p_opt }),
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

const NEW = {
  command: "<new>",
  describe: "Creates a new project.",
  builder: (cli: YargsInstance) => cli.options({ n: name_opt, b: bs_opt }),
  handler: tank(actions).new_handler,
  example: ["tank new -n my-site", "Creates an unfancy new project."],
}

const VITE = {
  command: "<vite>",
  describe: "Updates your project with Vite + Tailwind stuff.",
  builder: noop,
  handler: tank(actions).vite_handler,
  example: ["tank vite", "Tailwind + Vite configurations for your project."],
}

const html_opt = {
  h: {
    alias: "html",
    describe:
      "Creates an html block component. You need Vite config in order to run it!.",
    type: "array",
  },
  d: {
    alias: "data",
    describe:
      "Creates a data block component. You need Vite configs in order to run it!",
    type: "array",
  },
  a: {
    alias: "api",
    describe:
      "Creates an API block component. You need Vite configs in order to run it!",
    type: "array",
  },
  m: {
    alias: "macro",
    describe:
      "Creates a macro block component. You need Vite configs in order to run it!",
    type: "array",
  },
}

const COMPONENTS = {
  command: "<c>",
  describe: "Generates a component. [ --html, --data, --api, --macro ]",
  builder: (cli: YargsInstance) => cli.options(html_opt).check(block_validator),
  handler: tank(actions).generate_handler,
  example: [
    brightGreen("tank c --html") +
    " sidebar footer " +
    brightGreen("--data") +
    " features " +
    brightGreen("--api") +
    " events",
  ],
}

const page_opt = {
  s: {
    alias: "single",
    describe:
      "Creates a single page. You need Vite config in order to run it!.",
    type: "array",
  },
  m: {
    alias: "multiple",
    describe:
      "Creates multple page creator files. You need Vite config in order to run it!.",
    type: "array",
  },
  b: {
    alias: "build",
    describe: "Build pages for the --multiple creator files in your project.",
    type: "boolean",
  },
}

const PAGE = {
  command: "<p>",
  describe: "Generates new pages. [--single --multiple --build]",
  // eslint-disable-next-line max-lines-per-function
  builder: (cli: YargsInstance) =>
    cli.options(page_opt).check(
      // eslint-disable-next-line max-lines-per-function
      function ({ s, m }: { s: string[]; m: string[] }) {
        // todo: e2e
        if (_not_empty_option(s)) {
          throw new Error(brightRed("Single page path name required."))
        }

        // todo: e2e
        if (_not_empty_option(m)) {
          throw new Error(brightRed("Multiple page path name required."))
        }

        return true
      },
    ),
  handler: tank(actions).pages_handler,
  example: [
    brightGreen("tank p --single") +
    " signup contact" +
    brightGreen("--multiple") +
    " anime",
  ],
}

type TemplatesMap = { [key: string]: string };
type ReplaceOptions = { [key: string]: string };

function _replace_indice(
  TEMPLATES: TemplatesMap,
  type: string,
  replace_opts?: ReplaceOptions,
): string {
  return _replace(TEMPLATES, `indice.${type}`, replace_opts)
}

function _replace_page(
  TEMPLATES: TemplatesMap,
  type: string,
  replace_opts?: ReplaceOptions,
): string {
  return _replace(TEMPLATES, `pages.${type}`, replace_opts)
}

function _indice_file(name: string, type: string): string {
  return `makers/${name}/indice/${type}.indice.js`
}

function _pages_file(name: string, type: string): string {
  return `makers/${name}/pages/${type}.pages.js`
}

function _layouts_file(name: string): string {
  return `blocks/layouts/${name}.pages.html`
}

// eslint-disable-next-line max-lines-per-function
function _replace(
  TEMPLATES: { [key: string]: string },
  file: string,
  replace?: ReplaceOptions,
): string {
  if (replace) {
    const nameRE = /___name___/g
    return TEMPLATES[file].replace(nameRE, replace["name"])
  }
  return TEMPLATES[file]
}

function _not_empty(block?: string[]) {
  if (!block) return false
  return block.length > 0
}

// eslint-disable-next-line max-lines-per-function
function _npm_install_for_windows(name?: string): string[] {
  if (Deno.build.os === "windows") {
    return name
      ? ["cmd", "/c", "cd", name, "&&", "cmd", "/c", "npm", "install"]
      : ["cmd", "/c", "npm", "install"]
  }

  return name ? ["cd", name, "&&", "npm", "install"] : ["npm", "install"]
}

// eslint-disable-next-line max-lines-per-function
function block_validator({
  h,
  d,
  a,
  m,
}: {
  h: string[];
  d: string[];
  a: string[];
  m: string[];
}): true {
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

if (import.meta.main) {
  yargs(Deno.args)
    .command(HTTP)
    .example(...HTTP.example)
    .command(NEW)
    .example(...NEW.example)
    .command(VITE)
    .example(...VITE.example)
    .command(COMPONENTS)
    .example(...COMPONENTS.example)
    .command(PAGE)
    .example(...PAGE.example)
    .example(brightGreen("tank p --build"), "Create/Rebuild multiple pages.")
    // .epilogue("for more information, find our manual at http://example.com")
    .strictCommands()
    .demandCommand(1)
    .version("0.8.0.40")
    .parse()
}
