import { ensureDirSync as mkdir_p } from "https://deno.land/std@0.121.0/fs/mod.ts"
import * as path from "https://deno.land/std/path/mod.ts"
import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom/deno-dom-native.ts"

import {
  FancyFilesList,
  FileContents,
  UnfancyFilesList,
} from "./templates/blog.ts"

import { WalkEntry, walkSync } from "https://deno.land/std@0.122.0/fs/mod.ts"

export type Actions = {
  create_directories: (
    directories: string[],
    name?: string,
  ) => void;
  create_files: (spec: CreateFiles) => void;
  exec: (cmd: string[]) => Promise<void>;
  remove: (file: string) => void;
  create_file: (full_path: string, content: string) => void;
  create_dir: (name: string) => void;
  append_block: (name: string, main_html: string) => void;
  stdOut: (text: string) => void;
};

export const actions: Actions = (function () {
  function create_dir(name: string) {
    mkdir_p(name)
  }

  function create_directories(
    directories: string[],
    name?: string,
  ) {
    for (const dir of directories) {
      mkdir_p(_full_path(dir, name))
      stdOut(_full_path(dir, name) + " Created folder.")
    }
  }

  function create_files(spec: CreateFiles) {
    const { files, name, contents } = spec

    for (const key of _filtered_files(files)) {
      _write_file(
        _contents(key, contents),
        _full_path(key, name),
      )
    }
  }

  function create_file(full_path: string, content: string) {
    // TODO: e2e test dont overwrite
    for (const entry of walkSync("blocks", { maxDepth: 1 })) {
      if (path.basename(full_path) === path.basename(entry.path)) {
        return stdOut("\n" + full_path + " Already Created file.")
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

  function append_block(html: string, index_file: string) {
    try {
      // todo: e2e for extra line
      _append(index_file, html + "\n")
    } catch (e) {
      stdOut(`\n\n${index_file} not found.\n`)
    }

    stdOut(`\nOr you can include this code below on your main ${index_file}.`)
    stdOut("\n\n" + html + "\n\n")
  }

  function stdOut(text: string) {
    Deno.stdout.writeSync(new TextEncoder().encode(text))
  }

  return {
    create_directories,
    create_files,
    exec,
    remove,
    create_file,
    create_dir,
    append_block,
    stdOut,
  }
})()

function _filtered_files(files: FilesList[]) {
  const created_files: FilesList[] = []

  for (const entry of walkSync(".", { maxDepth: 1 })) {
    console.log("walked", entry.path)
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

function _filter_files(
  { entry, files, created_files }: Filter,
) {
  const current_file = entry.path as keyof FilesList

  if (files.includes(current_file)) {
    created_files.push(current_file)
  }
}

function _append(main_html: string, block: string) {
  const page = Deno.readTextFileSync(main_html)
  const dom = new DOMParser().parseFromString(
    page,
    "text/html",
  )
  const body = dom?.querySelector("body")
  if (!dom || !body || !dom.documentElement) return
  _insert_block_in_index({ body, dom, block })
}

type InsertBlock = {
  body: Element;
  dom: HTMLDocument;
  block: string;
};

// eslint-disable-next-line max-lines-per-function
function _insert_block_in_index(spec: InsertBlock) {
  try {
    spec.body.insertBefore(
      spec.dom.createTextNode("\n    " + spec.block),
      spec.body.childNodes[0],
    )

    if (spec.dom.documentElement) {
      const html = "<!DOCTYPE html>\n" + spec.dom.documentElement.outerHTML
      // todo: e2e unescape
      _write_file(_unescape(html), "index.html")
    }
  } catch (error) {
    console.log(error)
  }
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

  return (string && reHasEscapedHtml.test(string))
    ? string.replace(
      reEscapedHtml,
      (entity: string) => (htmlUnescapes[entity] || "'"),
    )
    : (string || "")
}

export type CreateFiles = {
  files: FilesList[];
  name?: string;
  contents: FileContents;
};

function _contents(key: any, contents: any): string {
  return contents[key]
}

function _full_path(key: any, name?: string): string {
  return name ? `${name}/${key}` : key
}

function _write_file(file_data: string, full_path: string) {
  Deno.writeTextFileSync(full_path, file_data, { create: true })
  // Deno.writeFileSync(full_path, _text_encode(file_data), { create: true })
}

function _text_encode(s: string) {
  return new TextEncoder().encode(s)
}
