import { brightGreen } from "./deps.ts"
import { presets } from "./templates/tailwind.ts"
import {
  create_dir,
  create_directories,
  create_files,
  stdOut,
} from "./actions.ts"

export const fns = {
  create_directories,
  create_files,
  stdOut,
  create_dir,
}

export function create_new_project(name: string) {
  fns.create_dir(name)
  fns.create_directories(presets["vanilla"].directories, name)
  fns.create_files(presets["vanilla"], name)
  fns.stdOut("\nNew Project: " + brightGreen(`cd ${name}`) + "!\n")
}
