import { Actions, CreateFiles } from "./actions.ts"

type Call = { call: number };

interface ActionsMock{
  executed: ({ call }: Call) => string[];
  directories: ({ call }: Call) => string[];
  files: ({ call }: Call) => CreateFiles;
  get_removals: ({ call }: Call) => string;
  file: ({ call }: Call) => Array<string>;
  dir: ({ call }: Call) => string;
  block: ({ call }: Call) => string[];
  logged: ({ call }: Call) => string;
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
    create_directories: (args) => { directories.push(args) },
    create_files: (args) => files.push(args),
    exec: async (args) => { await commands.push(args) },
    remove: (args: string) => removals.push(args),
    create_file: (...args: string[]) => file.push(args),
    create_dir: (args: string) => dir.push(args),
    append_block: (...args: string[]) => blocks.push(args),
    stdOut: (args: string) => out.push(args),
  }

  return {
    files: ({ call }: Call) => files[call],
    executed : ({ call }: Call) => commands[call],
    directories : ({ call }: Call) => directories[call],
    file : ({ call }: Call) => file[call],
    get_removals : ({ call }: Call) => removals[call],
    dir : ({ call }: Call) => dir[call],
    block : ({ call }: Call) => blocks[call],
    logged : ({ call }: Call) => out[call],
    exist: () => _is_file,
    vite_configs(bool: boolean) { _is_file = bool },
    restore,
    ...actionCalls
  }
})()

