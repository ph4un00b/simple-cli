import { bgBlack, brightGreen, brightMagenta } from "./deps.ts"
import { _replace } from "./shared.ts"
import { presets } from "./templates/tailwind.ts"
import { create_dir, create_page_file, page_exist, stdOut } from "./actions.ts"
import { create_macro_block } from "./block.macro.ts"

export const fns = {
  create_macro_block,
  create_dir,
  stdOut,
  create_page_file,
  page_exist
}

// eslint-disable-next-line max-lines-per-function
export function create_single_page(name: string) {
  const { templates: t } = presets["tailwind"]

  if (fns.page_exist(name)) {
    fns.stdOut(`\n${brightMagenta("Already Created Page:")} ${name}.`)
    return
  }

  fns.create_dir(name)
  fns.create_macro_block("titles", false)

  const pages = [
    ["index.html", "single.view"],
    ["main.js", "single.js"],
    ["styles.css", "single.css"],
  ]

  for (const [file, id] of pages) {
    fns.create_page_file(
      `${name}/${file}`,
      _replace(t, id, { name: name }),
    )
  }

  // todo: e2e colors, output
  fns.stdOut(`\n${brightGreen("tailwind.config.js")} - Update content property:`)
  fns.stdOut(
    bgBlack(brightMagenta(`\n\n./${name}/**/*.{html,js}\n\n`)),
  )
}
