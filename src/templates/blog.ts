export type FancyFilesList = {
  'index.html': string;
  'styles.css': string;
  '.gitignore': string;
};

export type UnfancyFilesList = {
  'package.json': string;
  'vite.config.js': string;
  'tailwind.config.js': string;
  'postcss.config.js': string;
  'main.js': string;
};

export type FancyFiles = Array<'index.html' | 'styles.css' | '.gitignore'>;
export type UnfancyFiles = Array<
  | 'main.js'
  | 'postcss.config.js'
  | 'package.json'
  | 'vite.config.js'
  | 'tailwind.config.js'
>;

export type options = 'no-bullshit';

export interface Arguments {
  bs: boolean;
  name: string;
  configs: boolean;
}

export interface HTTPArguments {
  port: number;
}

export type FileContents = {
  '.gitignore': string;
  'styles.css': string;
  'index.html': string;
  'main.js': string;
  'postcss.config.js': string;
  'tailwind.config.js': string;
  'vite.config.js': string;
  'package.json': string;
};

type Templates = {
  'no-bullshit': {
    directories: string[];
    unfancy_directories: string[];
    files: Array<'index.html' | 'styles.css' | '.gitignore'>;
    unfancy_files: Array<
      | 'main.js'
      | 'postcss.config.js'
      | 'package.json'
      | 'vite.config.js'
      | 'tailwind.config.js'
    >;
    file_contents: FileContents;
  };
};
export const templates: Templates = {
  'no-bullshit': {
    directories: ['images'],
    unfancy_directories: ['public'],
    files: ['index.html', 'styles.css', '.gitignore'],
    unfancy_files: [
      'package.json',
      'vite.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      'main.js',
    ],
    file_contents: {
      'package.json': `{
  "name": "tank-project",
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "autoprefixer": "10.4.0",
    "postcss": "8.4",
    "tailwindcss": "3.0.15",
    "vite": "2.7.13"
  }
}
        `,
      'vite.config.js': `import { defineConfig } from "vite";

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
      'tailwind.config.js': `module.exports = {
    content: ["./index.html", "./**/*.js"],
    darkMode: "class",
    plugins: [],
  };

        `,
      'postcss.config.js': `module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };

        `,
      'main.js': `import "./styles.css";

  // add all your js content...
        `,
      'styles.css': `body {
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
      'index.html': `<!DOCTYPE html>
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
      '.gitignore': `# Logs
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
