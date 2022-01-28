const TANK = {
  default_file: "__tank__/defaults.js",
  nunjucks_file: "__tank__/nunjucks.plugin.js",
  plugins_file: "__tank__/plugins.js",
  pages_file: "__tank__/pages.js",
}

export type FancyFilesList = {
  "index.html": string;
  "styles.css": string;
  ".gitignore": string;
};

export type UnfancyFilesList = {
  "package.json": string;
  "vite.config.js": string;
  "tailwind.config.js": string;
  "postcss.config.js": string;
  "main.js": string;
};

export type FancyFiles = Array<"index.html" | "styles.css" | ".gitignore">;
export type UnfancyFiles = Array<
  | "main.js"
  | "postcss.config.js"
  | "package.json"
  | "vite.config.js"
  | "tailwind.config.js"
>;

export type options = "no-bullshit";

export interface Arguments {
  bs?: boolean;
  name?: string;
  configs?: boolean;
}

export interface HTTPArguments {
  port: number;
}

export type FileContents = {
  ".gitignore": string;
  "styles.css": string;
  "index.html": string;
  "main.js": string;
  "postcss.config.js": string;
  "tailwind.config.js": string;
  "vite.config.js": string;
  "package.json": string;
  [key: string]: string;
};

type Templates = {
  "no-bullshit": {
    directories: Array<"images">;
    unfancy_directories: Array<"public" | "__tank__">;
    files: Array<"index.html" | "styles.css" | ".gitignore">;
    unfancy_files: Array<
      | "package.json"
      | "vite.config.js"
      | "tailwind.config.js"
      | "postcss.config.js"
      | "main.js"
      | "__tank__/defaults.js"
      | "__tank__/nunjucks.plugin.js"
      | "__tank__/plugins.js"
      | "__tank__/pages.js"
    >;
    file_contents: FileContents;
  };
};
export const templates: Templates = {
  "no-bullshit": {
    directories: ["images"],
    unfancy_directories: ["public", "__tank__"],
    files: ["index.html", "styles.css", ".gitignore"],
    unfancy_files: [
      "package.json",
      "vite.config.js",
      "tailwind.config.js",
      "postcss.config.js",
      "main.js",
      "__tank__/defaults.js",
      "__tank__/nunjucks.plugin.js",
      "__tank__/plugins.js",
      "__tank__/pages.js",
    ],
    file_contents: {
      [TANK.pages_file]: `const { resolve, parse } = require("path");
const glob = require("tiny-glob");
const slug = require("slug");

slug.charmap["-"] = "-";
slug.charmap["/"] = "-";
slug.charmap["\\\\"] = "-";

module.exports = async function () {
  return {
    resolvedPages: await pages(
      "!(node_modules|blocks|public|dist)/**/index.html"
    ),
  };
};

async function pages(pattern) {
  const glob_pages = await _pages(pattern);
  return glob_pages.reduce(_format, _default());
}

function _format(pages, page) {
  return { ...pages, [slug(parse(page).dir)]: resolve(page) };
}

async function _pages(pattern) {
  return await glob(pattern, { filesOnly: true });
}

function _default() {
  return { __main: _main_full_path() };
}

function _main_full_path() {
  return resolve(__dirname, "../index.html");
}`,
      [TANK.default_file]: `module.exports = {
  blocks: {
    dirname: "blocks",
    data_suffix: "items",
    api_suffix: "api_items"
  },
  nunjucks: {
    dirname: "src/html",
  },
};`,
      [TANK.plugins_file]: `const nunjucks = require("./nunjucks.plugin");

module.exports = async function (mode) {
  const { dev, prod } = await nunjucks();
  return mode === "production" ? [prod.NunjucksPlugin] : [dev.NunjucksPlugin];
};`,
      [TANK.nunjucks_file]:
        `const _nunjucks = require("vite-plugin-nunjucks").default;
const _TANK_ = require("./defaults.js");
const _parse = require("path").parse;
const _glob = require("tiny-glob");

module.exports = async function () {
  const data_items = await dataObjects().catch(console.error);
  const dev_items = await apiObjects({ for: "dev" }).catch(console.error);
  const prod_items = await apiObjects({ for: "prod" }).catch(console.error);

  return {
    dev: NunjuckPlugin({ ...data_items, ...dev_items }),
    prod: NunjuckPlugin({ ...data_items, ...prod_items }),
  };
};

function NunjuckPlugin(variables) {
  const NunjucksConfig = {
    templatesDir: _TANK_.nunjucks.dirname,
    variables: { "*": { ...variables } },
  };

  const NunjucksPlugin = [_nunjucks(NunjucksConfig)];
  return { NunjucksPlugin };
}

async function apiObjects({ for: kind }) {
  const data = await _glob(_for_api(kind)).catch(console.error);
  if (data) return await data.reduce(_format_api_items, {});
  return;
}

async function dataObjects() {
  const data = await _glob(_for_data()).catch(console.error);
  if (data) return data.reduce(_format_data_items, {});
  return;
}

async function _format_api_items(memo, path) {
  return { ...memo, [_api_name(path)]: await _api_content(path) };
}

function _format_data_items(memo, path) {
  return { ...memo, [_data_name(path)]: _data_content(path) };
}

async function _api_content(path) {
  const api = require("./" + path);
  return await api();
}

function _data_content(path) {
  return require("./" + path);
}

function _for_api(kind) {
  return \`\${_TANK_.blocks.dirname}/*.api.\${kind}.js\`;
}

function _for_data() {
  return \`\${_TANK_.blocks.dirname}/*.data.json\`;
}

function _data_name(path) {
  const [name, ...rest] = _parse(path).name.split(".");
  return \`\${name}_\${_TANK_.blocks.data_suffix}\`;
}

function _api_name(path) {
  const [name, ...rest] = _parse(path).name.split(".");
  return \`\${name}_\${_TANK_.blocks.api_suffix}\`;
}`,
      "package.json": `{
  "name": "tank-project",
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build --mode staging",
    "prod": "vite build --mode production",
    "preview": "vite preview"
  },
  "devDependencies": {
    "autoprefixer": "10.4.0",
    "axios": "0.25.0",
    "postcss": "8.4",
    "slug": "5.2.0",
    "tailwindcss": "3.0.15",
    "tiny-glob": "0.2.9",
    "vite": "2.7.13",
    "vite-plugin-nunjucks": "0.1.10"
  }
}`,
      "vite.config.js": `import { defineConfig } from "vite";
import plugins from "./__tank__/plugins";
import pages from "./__tank__/pages";

export default defineConfig(async ({ mode }) => {
  const [TankPlugins] = await plugins(mode);
  const { resolvedPages } = await pages();

  /**
   * @type {import('vite').UserConfig}
   */
  const viteConfigs = {
    plugins: [...TankPlugins],
    build: {
      rollupOptions: { input: resolvedPages },
    },
  };

  return viteConfigs;
});`,
      "tailwind.config.js":
        `/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  content: [
    "./index.html",
    "./blocks/*.html",
    "!(node_modules|blocks|public|dist)/**/*.html",
  ],
  darkMode: "class",
  plugins: [],
};`,
      "postcss.config.js": `module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };

        `,
      "main.js": `import "./styles.css";

  // add all your js content...
        `,
      "styles.css": `body {
    font-size: 125%;
    line-height: 1.5;
  }

  nav,
  nav ul {
    display: flex;
    flex-flow: row wrap;
  }

  nav {
    background: #2b2f2c;
    color: #fff;
    padding: 1rem;
    position: sticky;
    top: 0;
  }

  nav ul {
    list-style: none;
    margin: 0;
  }

  nav li {
    margin-right: 25px;
  }

  nav li a {
    color: yellow;
  }

  section {
    padding: 1rem 3rem;
  }

  section:target {
    background: lightyellow;
  }
          `,
      "index.html": `<!DOCTYPE html>
  <html lang="en">

  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <link rel="stylesheet" href="./styles.css">
  </head>

  <body>
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
          <section id="section-1">
              <h2>Section 1</h2>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. In sint sunt fuga ut, itaque labore est quos
                  saepe porro repudiandae dicta, vero nam ex aliquid aut consequatur adipisci modi! Totam? Eos dolores
                  quos, sequi molestias ex assumenda sint incidunt unde magni culpa, maxime natus! Eum amet harum enim
                  laboriosam consequuntur dicta quibusdam voluptatem, minima voluptas, libero esse veniam vel! Mollitia?
              </p>
              <p>Minus consequuntur ipsa doloremque delectus accusamus eveniet ipsum, doloribus illum neque harum
                  incidunt? Fuga, provident! Adipisci esse quisquam tempore officia dicta nobis, est odio consequuntur
                  deleniti doloribus quia, quaerat incidunt!</p>
              <p>Tempore, minima impedit iure officiis minus fuga vitae repudiandae a eos quisquam quo, necessitatibus
                  aspernatur! Inventore, sit ex dolorem tenetur officia quasi rem qui, debitis similique earum provident
                  ipsam omnis. Cupiditate iure officia cumque minima a itaque dicta, temporibus autem necessitatibus!
                  Voluptatem dignissimos cepturi, adipisci neque eaque quisquam odit laudantium asperiores iste, eius
                  atque totam distinctio enim magnam pariatur non!</p>
          </section>

          <section id="section-2">
              <h2>Section 2</h2>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. In sint sunt fuga ut, itaque labore est quos
                  saepe porro repudiandae dicta, vero nam ex aliquid aut consequatur adipisci modi! Totam? Eos dolores
                  quos, sequi molestias ex assumenda sint incidunt unde magni culpa, maxime natus! Eum amet harum enim
                  laboriosam consequuntur dicta quibusdam voluptatem, minima voluptas, libero esse veniam vel! Mollitia?
              </p>
              <p>Minus consequuntur ipsa doloremque delectus accusamus eveniet ipsum, doloribus illum neque harum
                  incidunt? Fuga, provident! Adipisci esse quisquam tempore officia dicta nobis, est odio consequuntur
                  deleniti doloribus quia, quaerat incidunt!</p>
              <p>Tempore, minima impedit iure officiis minus fuga vitae repudiandae a eos quisquam quo, necessitatibus
                  aspernatur! Inventore, sit ex dolorem tenetur officia quasi rem qui, debitis similique earum provident
                  ipsam omnis. Cupiditate iure officia cumque minima a itaque dicta, temporibus autem necessitatibus!
                  Voluptatem dignissimos cepturi, adipisci neque eaque quisquam odit laudantium asperiores iste, eius
                  atque totam distinctio enim magnam pariatur non!</p>
          </section>

          <section id="section-3">
              <h2>Section 3</h2>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. In sint sunt fuga ut, itaque labore est quos
                  saepe porro repudiandae dicta, vero nam ex aliquid aut consequatur adipisci modi! Totam? Eos dolores
                  quos, sequi molestias ex assumenda sint incidunt unde magni culpa, maxime natus! Eum amet harum enim
                  laboriosam consequuntur dicta quibusdam voluptatem, minima voluptas, libero esse veniam vel! Mollitia?
              </p>
              <p>Minus consequuntur ipsa doloremque delectus accusamus eveniet ipsum, doloribus illum neque harum
                  incidunt? Fuga, provident! Adipisci esse quisquam tempore officia dicta nobis, est odio consequuntur
                  deleniti doloribus quia, quaerat incidunt!</p>
              <p>Tempore, minima impedit iure officiis minus fuga vitae repudiandae a eos quisquam quo, necessitatibus
                  aspernatur! Inventore, sit ex dolorem tenetur officia quasi rem qui, debitis similique earum provident
                  ipsam omnis. Cupiditate iure officia cumque minima a itaque dicta, temporibus autem necessitatibus!
                  Voluptatem dignissimos cepturi, adipisci neque eaque quisquam odit laudantium asperiores iste, eius
                  atque totam distinctio enim magnam pariatur non!</p>
          </section>

          <section id="section-4">
              <h2>Section 4</h2>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. In sint sunt fuga ut, itaque labore est quos
                  saepe porro repudiandae dicta, vero nam ex aliquid aut consequatur adipisci modi! Totam? Eos dolores
                  quos, sequi molestias ex assumenda sint incidunt unde magni culpa, maxime natus! Eum amet harum enim
                  laboriosam consequuntur dicta quibusdam voluptatem, minima voluptas, libero esse veniam vel! Mollitia?
              </p>
              <p>Minus consequuntur ipsa doloremque delectus accusamus eveniet ipsum, doloribus illum neque harum
                  incidunt? Fuga, provident! Adipisci esse quisquam tempore officia dicta nobis, est odio consequuntur
                  deleniti doloribus quia, quaerat incidunt!</p>
              <p>Tempore, minima impedit iure officiis minus fuga vitae repudiandae a eos quisquam quo, necessitatibus
                  aspernatur! Inventore, sit ex dolorem tenetur officia quasi rem qui, debitis similique earum provident
                  ipsam omnis. Cupiditate iure officia cumque minima a itaque dicta, temporibus autem necessitatibus!
                  Voluptatem dignissimos cepturi, adipisci neque eaque quisquam odit laudantium asperiores iste, eius
                  atque totam distinctio enim magnam pariatur non!</p>
          </section>

          <section id="section-5">
              <h2>Section 5</h2>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. In sint sunt fuga ut, itaque labore est quos
                  saepe porro repudiandae dicta, vero nam ex aliquid aut consequatur adipisci modi! Totam? Eos dolores
                  quos, sequi molestias ex assumenda sint incidunt unde magni culpa, maxime natus! Eum amet harum enim
                  laboriosam consequuntur dicta quibusdam voluptatem, minima voluptas, libero esse veniam vel! Mollitia?
              </p>
              <p>Minus consequuntur ipsa doloremque delectus accusamus eveniet ipsum, doloribus illum neque harum
                  incidunt? Fuga, provident! Adipisci esse quisquam tempore officia dicta nobis, est odio consequuntur
                  deleniti doloribus quia, quaerat incidunt!</p>
              <p>Tempore, minima impedit iure officiis minus fuga vitae repudiandae a eos quisquam quo, necessitatibus
                  aspernatur! Inventore, sit ex dolorem tenetur officia quasi rem qui, debitis similique earum provident
                  ipsam omnis. Cupiditate iure officia cumque minima a itaque dicta, temporibus autem necessitatibus!
                  Voluptatem dignissimos cepturi, adipisci neque eaque quisquam odit laudantium asperiores iste, eius
                  atque totam distinctio enim magnam pariatur non!</p>
          </section>
      </article>
      <script type="module" src="./main.js"></script>
  </body>
  </html>
          `,
      ".gitignore": `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea
.DS_Store
*~
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
*.exe

# Firebase
serviceAccountKey.json
        `,
    },
  },
}
