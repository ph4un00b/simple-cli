import { Actions, CreateFiles } from "./actions.ts"

type Call = { call: number };

export interface ActionsMock {
  executed: (a: Call) => { args: string[]; calls: string[][] };
  directories: (a: Call) => { args: string[]; calls: string[][] };
  _create_file: (a: Call) => { args: string[]; calls: string[][] };
  _append_block: (a: Call) => { args: string[]; calls: string[][] };
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
  let file: string[][] = []
  let _is_file = true
  let dir: string[] = []
  let blocks: string[][] = []
  let out: string[] = []

  const restore = () => {
    directories = []
    files = []
    commands = []
    removals = []
    file = []
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
    create_file: (...args: string[]) => file.push(args),
    create_dir: (args: string) => dir.push(args),
    append_block: (...args: string[]) => blocks.push(args),
    stdOut: (args: string) => out.push(args),
  }

  return {
    files: ({ call }: Call) => ({ args: files[call], calls: files }),
    executed: ({ call }: Call) => ({ args: commands[call], calls: commands }),
    directories: ({ call }: Call) => ({
      args: directories[call],
      calls: directories,
    }),
    _create_file: ({ call }: Call) => ({ args: file[call], calls: file }),
    get_removals: ({ call }: Call) => ({ args: removals[call], calls: removals }),
    _create_dir: ({ call }: Call) => ({ args: dir[call], calls: dir }),
    _append_block: ({ call }: Call) => ({ args: blocks[call], calls: blocks }),
    logged: ({ call }: Call) => ({ args: out[call], calls: out }),
    exist: () => _is_file,
    vite_configs(bool: boolean) {
      _is_file = bool
    },
    restore,
    ...actionCalls,
  }
})()
