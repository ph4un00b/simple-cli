import {
  ensureDirSync as mkdir_p,
  ensureFile,
} from "https://deno.land/std@0.121.0/fs/mod.ts";

import { JSDOM } from "https://cdn.esm.sh/jsdom";
import yargs from "https://deno.land/x/yargs/deno.ts";
import {
  bgBlue,
  bgBrightBlack,
  blue,
  bold,
  green,
  red,
} from "https://deno.land/std@0.121.0/fmt/colors.ts";

type FileContents = {
  ".gitignore": string;
  "styles.css": string;
  "index.html": string;
  "main.js": string;
  "postcss.config.js": string;
  "tailwind.config.js": string;
  "vite.config.js": string;
  "package.json": string;
};
type Templates = {
  "no-bullshit": {
    directories: string[];
    files: Array<"index.html" | "styles.css" | ".gitignore">;
    unfancy_files: Array<
      | "main.js"
      | "postcss.config.js"
      | "package.json"
      | "vite.config.js"
      | "tailwind.config.js"
    >;
    file_contents: FileContents;
  };
};
type files = {
  "index.html": string;
  "styles.css": string;
  ".gitignore": string;
};
type unfancy_files = {
  "package.json": string;
  "vite.config.js": string;
  "tailwind.config.js": string;
  "postcss.config.js": string;
  "main.js": string;
};
const templates: Templates = {
  "no-bullshit": {
    directories: [
      "images",
      "public",
      "sections",
    ],
    files: ["index.html", "styles.css", ".gitignore"],
    unfancy_files: [
      "package.json",
      "vite.config.js",
      "tailwind.config.js",
      "postcss.config.js",
      "main.js",
    ],
    file_contents: {
      "package.json": `
{
  "name": "tank-project",
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.0",
    "postcss": "^8.3.11",
    "tailwindcss": "^3.0.15",
    "vite": "^2.7.12"
  }
}
      `,
      "vite.config.js": `
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: null,
      },
    },
  },
});

      `,
      "tailwind.config.js": `
module.exports = {
  content: ["./index.html", "./**/*.js"],
  darkMode: "class",
  plugins: [],
};

      `,
      "postcss.config.js": `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

      `,
      "main.js": `
import "./styles.css";

// add all your js content...
      `,
      "styles.css": `
body {
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
      "index.html": `
<!DOCTYPE html>
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
</body>
</html>
        `,
      ".gitignore": `
# Logs
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
};

type options = "no-bullshit";

interface Arguments {
  bs: string;
  name: string;
  configs: boolean;
}

interface HTTPArguments {
  port: number;
}

console.log(Deno.args);

const y = yargs(Deno.args)
  .epilogue("for more information, find our manual at http://example.com")
  .command(
    "<http>",
    "Simple HTTP Server.",
    function (yargs: any) {
      return yargs.options({
        "p": {
          alias: "port",
          default: 3000,
          describe: "Port.",
          type: "number",
        },
      });
    },
    function (argv: HTTPArguments) {
      console.log("port: ", argv.port);
      listen(argv.port);
    },
  )
  .command(
    "<blog>",
    "Create blog project.",
    function (yargs: any) {
      return yargs.options({
        "n": {
          alias: "name",
          demandOption: true,
          // default: true,
          describe: "Project name.",
          type: "string",
        },
        "b": {
          alias: "bs",
          demandOption: true,
          // default: true,
          describe: "Adds postcss, tailwind, vite and npm configurations.",
          type: "boolean",
        },
      });
    },
    function (argv: Arguments) {
      console.log("create: ", argv.name);
      create_project("no-bullshit", argv.name);
    },
  )
  .command(
    "<add>",
    "Update project with unfancy stuff.",
    function (yargs: any) {
      return yargs.options({
        "c": {
          alias: "configs",
          demandOption: true,
          describe: "Project name.",
          type: "array",
          choices: ['vite', 'lint']
        },
      });
    },
    function ({ configs }: { configs: boolean }) {
      console.log("configs", configs);
      update_project();
    },
  )
  .example([
    ["tank http", "Simple HTTP Server."],
    ["tank http -p 8000", ""],
    ["tank blog --name my-blog --no-bs", "Create an unfancy blog project"],
    [
      "tank add --configs vite lint",
      "Create Postcss, Tailwindcss, Vite configurations for project",
    ],
    [
      "tank add --server --tests",
      "Create Firebase backend with tests for project components",
    ],
    ["tank add --layouts", "Create layouts"],
  ])
  .strictCommands()
  .demandCommand(1)
  .version("0.0.0")
  .parse();

console.log(y);

function listen(port: number) {
  const p = Deno.run({
    cmd: [
      "echo",
      `${bold(red("TODO"))}: ${bgBrightBlack("listen on port:")} ${
        bgBlue(port.toString())
      }`,
    ],
  });
  console.log(p);
}

function update_project() {
  const option: options = selected();
  console.log(option, "selected");

  const { unfancy_files, file_contents }: {
    file_contents: FileContents;
    unfancy_files: Array<
      | "main.js"
      | "postcss.config.js"
      | "package.json"
      | "vite.config.js"
      | "tailwind.config.js"
    >;
  } = templates[option];

  const encoder = new TextEncoder();
  for (const key of unfancy_files) {
    const full_name = key;
    const file = file_contents[key as unknown as keyof unfancy_files];
    const data = encoder.encode(file);
    Deno.writeFileSync(full_name, data, { create: true });
    console.log(full_name, "Created file.");
  }
}

function create_project(project: options, name: string) {
  const option: options = selected();
  console.log(option, "selected");

  const { directories, files, file_contents }: {
    directories: string[];
    files: Array<"index.html" | "styles.css" | ".gitignore">;
    file_contents: FileContents;
  } = templates[option];

  for (const dir of directories) {
    const full_name = `${name}/${dir}`;
    mkdir_p(full_name);
    console.log(full_name, "Created folder.");
  }

  // for (const file of files) {
  //   ensureFile(file);
  // }

  const encoder = new TextEncoder();
  for (const key of files) {
    const full_name = `${name}/${key}`;
    const file = file_contents[key as unknown as keyof files];
    const data = encoder.encode(file);
    Deno.writeFileSync(full_name, data, { create: true });
    console.log(full_name, "Created file.");
  }
}

function selected(): options {
  if (Deno.args[0] === "no-bullshit") return "no-bullshit";
  return "no-bullshit";
}
