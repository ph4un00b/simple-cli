import { Actions, CreateFiles } from "./actions.ts"

type Call = { call: number };

interface ActionsMock {
  executed: (a: Call) => { arg: string[]; args: string[][] };
  directories: (a: Call) => { arg: string[]; args: string[][] };
  file: (a: Call) => { arg: string[]; args: string[][] };
  appended: (a: Call) => { arg: string[]; args: string[][] };
  files: (a: Call) => { arg: CreateFiles; args: CreateFiles[] };
  get_removals: (a: Call) => { arg: string; args: string[] };
  dir: (a: Call) => { arg: string; args: string[] };
  logged: (a: Call) => { arg: string; args: string[] };
  restore: () => void;
  vite_configs(bool: boolean): void;
}

export const actionsMock: ActionsMock = (function () {
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
    files: ({ call }: Call) => ({ arg: files[call], args: files }),
    executed: ({ call }: Call) => ({ arg: commands[call], args: commands }),
    directories: ({ call }: Call) => ({
      arg: directories[call],
      args: directories,
    }),
    file: ({ call }: Call) => ({ arg: file[call], args: file }),
    get_removals: ({ call }: Call) => ({ arg: removals[call], args: removals }),
    dir: ({ call }: Call) => ({ arg: dir[call], args: dir }),
    appended: ({ call }: Call) => ({ arg: blocks[call], args: blocks }),
    logged: ({ call }: Call) => ({ arg: out[call], args: out }),
    exist: () => _is_file,
    vite_configs(bool: boolean) {
      _is_file = bool
    },
    restore,
    ...actionCalls,
  }
})()
