import { slug } from "./deps.ts"

import { Arguments, HTTPArguments } from "./templates/tailwind.ts"

import { create_macro_block } from "./block.macro.ts"
import { create_data_block } from "./block.data.ts"
import { create_html_block } from "./block.html.ts"
import { create_api_block } from "./block.api.ts"
import { create_single_page } from "./page.single.ts"
import { create_multiple_configs } from "./page.multiple.ts"
import { create_new_project } from "./tank.new.ts"
import { create_vite_configs } from "./add.vite.ts"
import { generate_multiple_pages } from "./tank.generate.ts"

export const fns = {
  create_api_block,
  create_data_block,
  create_html_block,
  create_macro_block,
  create_single_page,
  create_multiple_configs,
  create_new_project,
  create_vite_configs,
  generate_multiple_pages,
}

export async function vite_handler() {
  await fns.create_vite_configs()
}

export function http_handler(argv: HTTPArguments) {
  listen(argv.port)
}

export async function new_handler({ bs, name }: Arguments) {
  if (name) fns.create_new_project(name)
  if (!bs) return
  await fns.create_vite_configs()
}

// eslint-disable-next-line max-lines-per-function
// eslint-disable-next-line complexity
export function generate_handler({
  html,
  data,
  api,
  macro,
}: {
  html?: string[];
  data?: string[];
  api?: string[];
  macro?: string[];
}) {
  slug.charmap["-"] = "_"
  if (_not_empty(html)) {
    for (const blockname of html!) {
      const name = slug(blockname, "_")
      fns.create_html_block(name)
    }
  }

  if (_not_empty(data)) {
    for (const blockname of data!) {
      const name = slug(blockname, "_")
      fns.create_data_block(name)
    }
  }

  if (_not_empty(api)) {
    for (const blockname of api!) {
      const name = slug(blockname, "_")
      fns.create_api_block(name)
    }
  }

  if (_not_empty(macro)) {
    for (const blockname of macro!) {
      const name = slug(blockname, "_")
      fns.create_macro_block(name)
    }
  }
}

// eslint-disable-next-line max-lines-per-function
export async function pages_handler({
  single,
  multiple,
  build,
}: {
  single?: string[];
  multiple?: string[];
  build?: boolean;
}) {
  if (build) {
    await generate_multiple_pages()
  }

  if (_not_empty(multiple)) {
    const removeRE = /^\/*|\/*$|[/*]{2,}/g
    slug.charmap["/"] = "-"
    slug.charmap["\\"] = "-"
    for (const page_name of multiple!) {
      const name = slug(page_name, { remove: removeRE })
      fns.create_multiple_configs(name)
    }
  }

  if (_not_empty(single)) {
    const removeRE = /^\/*|\/*$|[/*]{2,}/g
    slug.charmap["-"] = "-"
    slug.charmap["/"] = "/"
    slug.charmap["\\"] = "/"
    for (const page_name of single!) {
      const name = slug(page_name, { remove: removeRE })
      fns.create_single_page(name)
    }
  }
}

function _not_empty(block?: string[]) {
  if (!block) return false
  return block.length > 0
}

function listen(port: number) {
  // TODO: simple server
  throw new Error("Implement SimpleServer. " + port)
}
