// --allow-read --allow-write --unstable --no-check --allow-run
import {
  ensureDirSync as mkdir_p,
} from 'https://deno.land/std@0.121.0/fs/mod.ts'

// import { JSDOM } from "https://cdn.esm.sh/jsdom";
import yargs from 'https://deno.land/x/yargs/deno.ts'
import {
  bgBlue,
  bgBrightBlack,
  bold,
  green,
  red,
} from 'https://deno.land/std@0.121.0/fmt/colors.ts'

import {
  Arguments,
  FancyFiles,
  FancyFilesList,
  FileContents,
  HTTPArguments,
  options,
  templates,
  UnfancyFiles,
  UnfancyFilesList,
} from './templates/blog.ts'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

const p_opt = {
  alias: 'port',
  default: 3000,
  describe: 'Port.',
  type: 'number',
}

const HTTP = {
  command: '<http>',
  describe: 'Simple HTTP Server.',
  builder: (cli: any) => cli.options({ 'p': p_opt }),
  handler: http_handler,
  example: ['tank http', 'Simple HTTP Server.'],
}

const name_opt = {
  alias: 'name',
  demandOption: true,
  describe: 'Project name.',
  type: 'string',
}

const bs_opt = {
  alias: 'bs',
  default: false,
  describe: 'Adds postcss, tailwind, vite and npm configurations.',
  type: 'boolean',
}

const BLOG = {
  command: '<blog>',
  describe: 'Create blog project.',
  builder: (cli: any) => cli.options({ 'n': name_opt, 'b': bs_opt }),
  handler: blog_handler,
  example: [
    'tank blog --name my-blog --no-bs',
    'Create an unfancy blog project.',
  ],
}

const VITE = {
  command: '<vite>',
  describe: 'Update project with unfancy stuff.',
  builder: noop,
  handler: vite_handler,
  example: ['tank vite', 'Tailwind + Vite configurations for project.'],
}

function vite_handler({ configs }: { configs: boolean }) {
  console.log('configs', configs)
  add_vite({})
}

async function blog_handler({ bs, name }: Arguments) {
  console.log('n: ', name)
  console.log('bs: ', bs)
  create_blog('no-bullshit', name)
  if (!bs) return
  await add_vite({ for_project: name })
}

function http_handler(argv: HTTPArguments) {
  console.log('port: ', argv.port)
  listen(argv.port)
}

function listen(port: number) {
  exec([
    'echo',
    `${bold(red('TODO'))}: ${bgBrightBlack('listen on port:')} ${
      bgBlue(port.toString())
    }`,
  ])
}

type ViteContents = {
  file_contents: FileContents;
  unfancy_files: UnfancyFiles;
};

async function add_vite({ for_project: name }: { for_project?: string }) {
  const { unfancy_files: files, file_contents: contents } =
    templates[selected()]
  create_files({ files, name, contents })
  await exec([_install_vite_config(name)])
  Deno.removeSync(_install_vite_config(name))
  await exec(_echo_vite_message(name))
}

function _echo_vite_message(name?: string): string[] {
  return name
    ? ['cmd', '/c', 'echo', `Try cd ${name} && ${green('npm run dev')}!`]
    : ['cmd', '/c', 'echo', `Try ${green('npm run dev')}!`]
}

function _install_vite_config(project_name?: string) {
  // on Window { cmd: ["npm", "install"] } throws a NotFound!
  // then I use a BAT file
  if (project_name) {
    _write_file(`call cd ${project_name} && npm install`, 'install.bat')
  } else _write_file('call npm install', 'install.bat')
  return './install.bat'
}

async function exec(cmd: string[]) {
  const process = Deno.run({ cmd })
  const status = await process.status()
  if (status.success == false) {
    Deno.exit(status.code)
  } else {
    process.close()
  }
}

type BlogContent = {
  directories: string[];
  files: FancyFiles;
  file_contents: FileContents;
};

function create_blog(project: options, name: string) {
  const { directories, files, file_contents: contents }: BlogContent =
    templates[selected()]
  create_directories(directories, name)
  create_files({ files, name, contents })
}

type CreateFiles = {
  files: FancyFiles | UnfancyFiles;
  name?: string;
  contents: FileContents;
};

function create_files(spec: CreateFiles) {
  const { files, name, contents } = spec
  for (const key of files) {
    _write_file(_contents(key, contents), _full_path(key, name))
  }
}

function _contents(key: string, contents: FileContents): string {
  return contents[key as unknown as keyof (FancyFilesList | UnfancyFilesList)]
}

function _full_path(key: string, name?: string) {
  return name ? `${name}/${key}` : key
}

function _write_file(file_data: string, full_path: string) {
  Deno.writeFileSync(full_path, _text_encode(file_data), { create: true })
  console.log(full_path, 'Created file.')
}

function _text_encode(s: string) {
  return new TextEncoder().encode(s)
}

function create_directories(directories: string[], name: string) {
  for (const dir of directories) {
    const full_name = `${name}/${dir}`
    mkdir_p(full_name)
    console.log(full_name, 'Created folder.')
  }
}

function selected(): options {
  if (Deno.args[0] === 'no-bullshit') return 'no-bullshit'
  return 'no-bullshit'
}

if (import.meta.main) {
  yargs(Deno.args)
    .epilogue('for more information, find our manual at http://example.com')
    .command(HTTP)
    .example(...HTTP.example)
    .command(BLOG)
    .example(...BLOG.example)
    .command(VITE)
    .example(...VITE.example)
    .example([
      ['tank server-blocks --no-tests'],
      ['tank add --layouts', 'Create layouts'],
    ])
    .strictCommands()
    .demandCommand(1)
    .version('0.2.2.0')
    .parse()
}
