import {
  ensureDirSync as mkdir_p,
  ensureFile,
} from "https://deno.land/std@0.121.0/fs/mod.ts";

import { JSDOM } from "https://cdn.esm.sh/jsdom";
import yargs from "https://deno.land/x/yargs/deno.ts";

type FileContents = {
  "index.css": string;
  "index.html": string;
};
type Templates = {
  "no-bullshit": {
    directories: string[];
    files: string[];
    file_contents: FileContents;
  };
};
const templates: Templates = {
  "no-bullshit": {
    directories: [
      "images",
      "public",
      "sections",
    ],
    files: [
      "index.css",
      "index.html",
    ],
    file_contents: {
      "index.css": `
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
    <link rel="stylesheet" href="index.css">
    <title>Document</title>
</head>

<body>
    <article>
        <nav>
            Jump to...
            <ul>
                <li><a href="#section-1">Section 1</a></li>
                <li><a href="#section2">Section 2</a></li>
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
    },
  },
};

type options = "no-bullshit";

interface Arguments {
  bs: string;
  name: string;
}

console.log(Deno.args);

const y = yargs(Deno.args)
  .epilogue("for more information, find our manual at http://example.com")
  .command(
    "<blog>",
    "make a get HTTP request",
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
  .example([
    ["tank blog --name my-blog --no-bs", "Create an unfancy blog project"],
    ["tank add --configs", "Create Postcss, Tailwindcss, Vite configurations for project"],
    ["tank add --lint", "Create eslint, prettier configurations for project"],
    ["tank add --server --tests", "Create Firebase backend with tests for project components"],
    ["tank add --layouts", "Create layouts"],
  ])
  .strictCommands()
  .demandCommand(1)
  .version("0.0.0")
  .parse();

console.log(y);

function create_project(project: options, name: string) {
  const option: options = selected();
  console.log(option, "selected");

  const { directories, files, file_contents }: {
    directories: string[];
    files: string[];
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

  type files = {
    "index.html": string;
    "index.css": string;
  };

  const encoder = new TextEncoder();
  for (const key in file_contents) {
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
