import { brightGreen, brightRed, YargsInstance } from "./deps.ts"
import { generate_handler } from "./tank.ts"

const html_opt = {
  h: {
    alias: "html",
    describe:
      "Creates an html block component. You need Vite config in order to run it!.",
    type: "array",
  },
  d: {
    alias: "data",
    describe:
      "Creates a data block component. You need Vite configs in order to run it!",
    type: "array",
  },
  a: {
    alias: "api",
    describe:
      "Creates an API block component. You need Vite configs in order to run it!",
    type: "array",
  },
  m: {
    alias: "macro",
    describe:
      "Creates a macro block component. You need Vite configs in order to run it!",
    type: "array",
  },
}

export const COMPONENTS = {
  command: "<c>",
  describe: "Generates a component. [ --html, --data, --api, --macro ]",
  builder: (cli: YargsInstance) => cli.options(html_opt).check(block_validator),
  handler: generate_handler,
  example: [
    brightGreen("tank c --html") +
    " sidebar footer " +
    brightGreen("--data") +
    " features " +
    brightGreen("--api") +
    " events",
  ],
}

// eslint-disable-next-line max-lines-per-function
function block_validator({
  h,
  d,
  a,
  m,
}: {
  h: string[];
  d: string[];
  a: string[];
  m: string[];
}): true {
  if (_not_empty_option(h)) {
    throw new Error(brightRed("HTML component name required."))
  }

  // TODO: e2e test
  if (_not_empty_option(d)) {
    throw new Error(brightRed("Data component name required."))
  }

  // TODO: e2e test
  if (_not_empty_option(a)) {
    throw new Error(brightRed("API component name required."))
  }

  // TODO: e2e test
  if (_not_empty_option(m)) {
    throw new Error(brightRed("Macro component name required."))
  }
  return true
}

function _not_empty_option(h: string[]) {
  return Array.isArray(h) && h.length === 0
}
