import { Actions, CreateFiles } from "./actions.ts"

type Call = { call: number };

export interface ActionsMock {
  executed: (a: Call) => { args: string[]; calls: string[][] };
  directories: (a: Call) => { args: string[]; calls: string[][] };
  _create_block_file: (a: Call) => { args: string[]; calls: string[][] };
  _create_page_file: (a: Call) => { args: string[]; calls: string[][] };
  _insert_content: (a: Call) => { args: string[]; calls: string[][] };
  files: (a: Call) => { args: CreateFiles; calls: CreateFiles[] };
  get_removals: (a: Call) => { args: string; calls: string[] };
  _create_dir: (a: Call) => { args: string; calls: string[] };
  logged: (a: Call) => { args: string; calls: string[] };
  restore: () => void;
  vite_configs(bool: boolean): void;
}

export const actionsMock: Actions & ActionsMock = (function () {
  let commands: string[][] = []
  let directories: string[][] = []
  let files: CreateFiles[] = []
  let removals: string[] = []
  let block_files: string[][] = []
  let page_files: string[][] = []
  let _is_file = true
  let dir: string[] = []
  let blocks: string[][] = []
  let out: string[] = []

  const restore = () => {
    directories = []
    files = []
    commands = []
    removals = []
    block_files = []
    page_files = []
    dir = []
    blocks = []
    out = []
  }

  // eslint-disable-next-line max-lines-per-function
  const actionCalls: Actions = {
    create_directories: (args) => {
      directories.push(args)
    },
    create_files: (args) => files.push(args),
    exec: async (args) => {
      await commands.push(args)
    },
    remove: (args: string) => removals.push(args),
    create_block_file: (...args: string[]) => block_files.push(args),
    create_page_file: (...args: string[]) => page_files.push(args),
    create_dir: (args: string) => dir.push(args),
    insert_content: (...args: string[]) => blocks.push(args),
    stdOut: (args: string) => out.push(args),
  }

  return {
    files: ({ call }: Call) => ({
      args: files[call],
      calls: files,
    }),
    executed: ({ call }: Call) => ({
      args: commands[call],
      calls: commands,
    }),
    directories: ({ call }: Call) => ({
      args: directories[call],
      calls: directories,
    }),
    _create_block_file: ({ call }: Call) => ({
      args: block_files[call],
      calls: block_files,
    }),
    _create_page_file: ({ call }: Call) => ({
      args: page_files[call],
      calls: page_files,
    }),
    get_removals: ({ call }: Call) => ({
      args: removals[call],
      calls: removals,
    }),
    _create_dir: ({ call }: Call) => ({
      args: dir[call],
      calls: dir,
    }),
    _insert_content: ({ call }: Call) => ({
      args: blocks[call],
      calls: blocks,
    }),
    logged: ({ call }: Call) => ({
      args: out[call],
      calls: out,
    }),
    exist: () => _is_file,
    vite_configs(bool: boolean) {
      _is_file = bool
    },
    restore,
    ...actionCalls,
  }
})()
