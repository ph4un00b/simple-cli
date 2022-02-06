import { brightGreen } from "./deps.ts"
import { presets } from "./templates/tailwind.ts"
import {
  create_directories,
  create_files,
  exec,
  insert_content,
  stdOut,
} from "./actions.ts"

export const fns = {
  create_directories,
  create_files,
  stdOut,
  exec,
  insert_content,
}

export async function create_vite_configs(): Promise<void> {
  const {
    templates: t,
  } = presets["tailwind"]

  // todo e2e
  fns.insert_content(t["patch.vite.css"], "styles.css")
  fns.create_directories(presets["tailwind"].directories)
  fns.create_files(presets["tailwind"])
  await fns.exec(_npm_install())
  fns.stdOut(`\nTry ${brightGreen("npm run dev!")}\n`)
}

function _npm_install(): string[] {
  return Deno.build.os === "windows"
    ? ["cmd", "/c", "npm", "install"]
    : ["npm", "install"]
}
