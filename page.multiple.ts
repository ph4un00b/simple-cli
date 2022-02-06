import { bgBlack, brightGreen, brightMagenta } from "./deps.ts"
import { presets } from "./templates/tailwind.ts"
import { create_dir, create_page_file, page_exist, stdOut } from "./actions.ts"
import { create_macro_block } from "./block.macro.ts"
import { _replace, ReplaceOptions, TemplatesMap } from "./shared.ts"

export const fns = {
  create_macro_block,
  create_dir,
  stdOut,
  create_page_file,
  page_exist,
}

// eslint-disable-next-line max-lines-per-function
export function create_multiple_configs(name: string) {
  const { templates: t } = presets["tailwind"]

  if (fns.page_exist(name)) {
    fns.stdOut(`\n${brightMagenta("Already Created Page:")} ${name}.`)
    return
  }

  fns.create_dir("blocks/layouts")
  fns.create_dir("makers")
  fns.create_macro_block("pages_title", false)

  create_multiple_files(name, t)

  // todo: e2e colors, output
  fns.stdOut(
    `\n${brightGreen("tailwind.config.js")} - Update content property:`,
  )
  fns.stdOut(bgBlack(brightMagenta("\n\n./" + name + "/**/*.{html,js}\n\n")))
  fns.stdOut(brightGreen("Adjust as needed."))
}

function create_multiple_files(name: string, t: { [key: string]: string }) {
  fns.create_page_file(_layouts_file(name), t["layout.pages"])
  fns.create_page_file(_layouts_file("paginator"), t["layout.index"])
  create_indices_files(name, t)
  create_pages_files(name, t)
}

function create_pages_files(name: string, t: { [key: string]: string }) {
  for (const type of ["api", "css", "js"]) {
    fns.create_page_file(_pages_file(name, type), _replace_page(t, type, { name }))
  }
}

function create_indices_files(name: string, t: { [key: string]: string }) {
  for (const type of ["api", "css", "js"]) {
    fns.create_page_file(
      _indice_file(name, type),
      _replace_indice(t, type, { name }),
    )
  }
}

function _replace_indice(
  TEMPLATES: TemplatesMap,
  type: string,
  replace_opts?: ReplaceOptions,
): string {
  return _replace(TEMPLATES, `indice.${type}`, replace_opts)
}

function _replace_page(
  TEMPLATES: TemplatesMap,
  type: string,
  replace_opts?: ReplaceOptions,
): string {
  return _replace(TEMPLATES, `pages.${type}`, replace_opts)
}

function _indice_file(name: string, type: string): string {
  return `makers/${name}/indice/${type}.indice.js`
}

function _pages_file(name: string, type: string): string {
  return `makers/${name}/pages/${type}.pages.js`
}

function _layouts_file(name: string): string {
  return `blocks/layouts/${name}.pages.html`
}
