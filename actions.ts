import { ensureDirSync as mkdir_p } from "https://deno.land/std@0.121.0/fs/mod.ts"
import * as path from "https://deno.land/std@0.121.0/path/mod.ts"
import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts"

import {
  FancyFilesList,
  FileContents,
  UnfancyFilesList,
} from "./templates/tailwind.ts"

import { WalkEntry, walkSync } from "https://deno.land/std@0.121.0/fs/mod.ts"
import {
  bgBlack,
  brightGreen,
  brightMagenta,
  brightRed,
} from "https://deno.land/std@0.121.0/fmt/colors.ts"

export type Actions = {
  create_directories: (directories: string[], name?: string) => void;
  create_files: (spec: CreateFiles) => void;
  exec: (cmd: string[]) => Promise<void>;
  remove: (file: string) => void;
  create_block_file: (full_path: string, content: string) => void;
  create_page_file: (filename: string, content: string) => void;
  create_dir: (name: string) => void;
  insert_content: (content: string, filename: string) => void;
  stdOut: (text: string) => void;
};

export const actions: Actions = (function () {
  function create_dir(name: string) {
    mkdir_p(name)
  }

  // eslint-disable-next-line max-lines-per-function
  function create_directories(directories: string[], name?: string) {
    for (const dir of directories) {
      mkdir_p(_full_path(dir, name))
      stdOut(_full_path(dir, name) + brightGreen(" Created folder.") + "\n")
    }
  }

  function create_files(spec: CreateFiles) {
    const { files, name, contents } = spec

    for (const key of _filtered_files(files)) {
      _write_file(_contents(key, contents), _full_path(key as string, name))
    }
  }

  // eslint-disable-next-line max-lines-per-function
  function create_block_file(full_path: string, content: string) {
    // TODO: e2e test dont overwrite
    for (const entry of walkSync("blocks", { maxDepth: 1 })) {
      if (path.basename(full_path) === path.basename(entry.path)) {
        return stdOut(
          "\n" + full_path + " " + brightMagenta("Already Created file."),
        )
      }
    }
    _write_file(content, full_path)
    stdOut("\n" + full_path + " " + brightGreen("Created file."))
  }

  // eslint-disable-next-line max-lines-per-function
  function create_page_file(full_path: string, content: string) {
    let folder = path.parse(full_path).dir
    if (folder === "" || folder === undefined) folder = "."

    // TODO: e2e test dont overwrite
    for (const entry of walkSync(folder, { maxDepth: 1 })) {
      if (path.basename(full_path) === path.basename(entry.path)) {
        return stdOut(
          "\n" + full_path + " " + brightMagenta("Already Created file."),
        )
      }
    }

    _write_file(content, full_path)
    stdOut("\n" + full_path + " Created file.")
  }

  async function exec(cmd: string[]) {
    const process = Deno.run({ cmd })
    const status = await process.status()
    if (status.success == false) {
      Deno.exit(status.code)
    } else {
      process.close()
    }
  }

  function remove(file: string) {
    Deno.removeSync(file)
  }

  // eslint-disable-next-line max-lines-per-function
  function insert_content(content: string, filename: string) {
    try {
      _insert(filename, content)
    } catch (e) {
      stdOut(brightRed(`\n\n${filename} not found.\n`))
    }

    // todo: e2e colors, output
    stdOut(`\nNew code for: ${brightGreen(filename)}.`)
    stdOut(bgBlack(brightMagenta("\n\n" + content + "\n\n")))
  }

  function stdOut(text: string) {
    Deno.stdout.writeSync(new TextEncoder().encode(text))
  }

  return {
    create_directories,
    create_files,
    exec,
    remove,
    create_block_file,
    create_page_file,
    create_dir,
    insert_content,
    stdOut,
  }
})()

// todo: e2e for extra line
function _insert(filename: string, content: string) {
  path.parse(filename).ext == ".html"
    ? _insert_html("index.html", content + "\n")
    : _insert_into_styles("styles.css", content + "\n")
}

function _filtered_files(files: FilesList[]) {
  const created_files: FilesList[] = []

  for (const entry of walkSync(".", { maxDepth: 1 })) {
    _filter_files({ entry, files, created_files })
  }

  return files.filter((file) => !created_files.includes(file))
}

type FilesList = FancyFilesList | UnfancyFilesList | string;

type Filter = {
  entry: WalkEntry;
  files: FilesList[];
  created_files: FilesList[];
};

function _filter_files({ entry, files, created_files }: Filter) {
  const current_file = entry.path as keyof FilesList

  if (files.includes(current_file)) {
    created_files.push(current_file)
  }
}

function _insert_html(filename: string, block: string) {
  const { dom, body } = _get_html_elements(filename)
  if (!dom || !body) return

  _insert_into_index({ body, dom, block })
}

type InsertBlock = {
  body: Element;
  dom: HTMLDocument;
  block: string;
};

function _get_html_elements(filename: string) {
  const dom = new DOMParser().parseFromString(
    Deno.readTextFileSync(filename),
    "text/html",
  )
  const body = dom?.querySelector("body")
  return { dom, body }
}

// eslint-disable-next-line max-lines-per-function
function _insert_into_index(spec: InsertBlock) {
  try {
    if (!spec.dom.documentElement) return
    _mutate_body_element(spec)
    _overwrite_index("<!DOCTYPE html>\n" + spec.dom.documentElement.outerHTML)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error)
  }
}

// todo: e2e unescape
function _overwrite_index(html: string) {
  _write_file(_unescape(html), "index.html")
}

function _mutate_body_element(spec: InsertBlock) {
  spec.body.insertBefore(
    spec.dom.createTextNode("\n    " + spec.block),
    spec.body.childNodes[0],
  )
}

// eslint-disable-next-line max-lines-per-function
function _unescape(string: string) {
  // https://github.com/lodash/lodash/blob/master/unescape.js
  const htmlUnescapes: { [key: string]: string } = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&#39;": "'",
  }

  const reEscapedHtml = /&(?:amp|lt|gt|quot|#(0+)?39);/g
  const reHasEscapedHtml = RegExp(reEscapedHtml.source)

  return string && reHasEscapedHtml.test(string)
    ? string.replace(
      reEscapedHtml,
      (entity: string) => htmlUnescapes[entity] || "'",
    )
    : string || ""
}

export type CreateFiles = {
  files: FilesList[];
  name?: string;
  contents: FileContents;
};

function _contents(key: FilesList, contents: FileContents): string {
  return contents[key as string]
}

function _full_path(key: string, name?: string): string {
  return name ? `${name}/${key}` : key
}

function _write_file(file_data: string, full_path: string) {
  Deno.writeTextFileSync(full_path, file_data, {
    create: true,
  })
}

// todo: e2e
// eslint-disable-next-line max-lines-per-function
function _insert_to_file(file_data: string, full_path: string) {
  const file_content = Deno.readTextFileSync(full_path)
  Deno.writeTextFileSync(full_path, file_data + "\n" + file_content, {
    create: true,
  })
}

// todo: e2e do not insert if setup exist
function _insert_into_styles(filename: string, data: string) {
  for (const entry of walkSync(".", { maxDepth: 1 })) {
    if (["tailwind.config.js"].includes(entry.path)) return
  }
  _insert_to_file(data, filename)
}
