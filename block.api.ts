import { brightMagenta } from "./deps.ts"
import { _replace } from "./shared.ts"
import { presets } from "./templates/tailwind.ts"
import {
  block_exist,
  create_block_file,
  create_dir,
  insert_content,
  stdOut,
} from "./actions.ts"

export const fns = {
  create_dir,
  create_block_file,
  insert_content,
  block_exist,
  stdOut,
}

// eslint-disable-next-line max-lines-per-function
export function create_api_block(name: string, insert = true) {
  const { templates: t } = presets["tailwind"]

  fns.create_dir("blocks")

  if (fns.block_exist(name)) {
    fns.stdOut(brightMagenta("Already Created Block: " + name))
    return
  }

  fns.create_block_file(
    `blocks/${name}.api.html`,
    _replace(t, "api.view", { name }),
  )
  fns.create_block_file(
    `blocks/${name}.model.dev.js`,
    _replace(t, "api.dev.model", { name }),
  )
  fns.create_block_file(
    `blocks/${name}.model.prod.js`,
    _replace(t, "api.prod.model", { name }),
  )

  if (!insert) return
  fns.insert_content(`{% include "blocks/${name}.api.html" %}`, "index.html")
}
