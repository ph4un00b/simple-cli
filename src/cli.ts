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

const HTTP = {
  command: '<http>',
  describe: 'Simple HTTP Server.',
  builder: http_options,
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
  builder: blog_options,
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
  .version('0.0.0')
  .parse()

function vite_handler({ configs }: { configs: boolean }) {
  console.log('configs', configs)
  add_vite()
}

async function blog_handler({ bs, name }: Arguments) {
  console.log('n: ', name)
  console.log('bs: ', bs)
  create_blog('no-bullshit', name)
  if (!bs) return
  await add_vite()
}

function blog_options(cli: any) {
  return cli.options({ 'n': name_opt, 'b': bs_opt })
}

function http_handler(argv: HTTPArguments) {
  console.log('port: ', argv.port)
  listen(argv.port)
}

function http_options(cli: any) {
  return cli.options({
    'p': {
      alias: 'port',
      default: 3000,
      describe: 'Port.',
      type: 'number',
    },
  })
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

async function add_vite() {
  const option: options = selected()
  const { unfancy_files: files, file_contents: contents }: ViteContents =
    templates[option]
  create_files({ files, name: undefined, contents })
  // on Window { cmd: ["npm", "install"] } throws a NotFound!
  // then I use a BAT file
  await exec(['./install.bat'])
  Deno.removeSync('./install.bat')
  await exec(['cmd', '/c', 'echo', 'Try ' + green('npm run dev') + '!'])
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
  const option: options = selected()
  console.log(option, 'selected')

  const { directories, files, file_contents: contents }: BlogContent =
    templates[option]

  create_directories(directories, name)
  create_files({ files, name, contents })
}

type CreateFiles = {
  files: FancyFiles | UnfancyFiles;
  name: string | undefined;
  contents: FileContents;
};
function create_files(spec: CreateFiles) {
  const { files, name, contents } = spec
  for (const key of files) {
    const full_name = name ? `${name}/${key}` : key
    _write_file(
      contents[key as unknown as keyof (FancyFilesList | UnfancyFilesList)],
      full_name,
    )
  }
}

function _write_file(file_data: string, full_name: string) {
  Deno.writeFileSync(full_name, _text_encode(file_data), { create: true })
  console.log(full_name, 'Created file.')
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
