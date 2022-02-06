import { brightGreen, brightRed, YargsInstance } from "./deps.ts"
import { pages_handler } from "./tank.ts"

const page_opt = {
  s: {
    alias: "single",
    describe:
      "Creates a single page. You need Vite config in order to run it!.",
    type: "array",
  },
  m: {
    alias: "multiple",
    describe:
      "Creates multple page creator files. You need Vite config in order to run it!.",
    type: "array",
  },
  b: {
    alias: "build",
    describe: "Build pages for the --multiple creator files in your project.",
    type: "boolean",
  },
}

export const PAGES = {
  command: "<p>",
  describe: "Generates new pages. [--single --multiple --build]",
  // eslint-disable-next-line max-lines-per-function
  builder: (cli: YargsInstance) =>
    cli.options(page_opt).check(
      // eslint-disable-next-line max-lines-per-function
      function ({ s, m }: { s: string[]; m: string[] }) {
        // todo: e2e
        if (_not_empty_option(s)) {
          throw new Error(brightRed("Single page path name required."))
        }

        // todo: e2e
        if (_not_empty_option(m)) {
          throw new Error(brightRed("Multiple page path name required."))
        }

        return true
      },
    ),
  handler: pages_handler,
  example: [
    brightGreen("tank p --single") +
    " signup contact" +
    brightGreen("--multiple") +
    " anime",
  ],
}

function _not_empty_option(h: string[]) {
  return Array.isArray(h) && h.length === 0
}
