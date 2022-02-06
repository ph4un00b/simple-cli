import { brightRed, YargsInstance } from "./deps.ts"
import { new_handler } from "./tank.ts"

const name_opt = {
  alias: "name",
  describe: "Project name.",
  type: "string",
}

const bs_opt = {
  alias: "bs",
  default: false,
  describe: "Adds Vite + Tailwind configurations.",
  type: "boolean",
}

export const NEW = {
  command: "<new>",
  describe: "Creates a new project.",
  builder: (cli: YargsInstance) =>
    cli
      .options({ n: name_opt, b: bs_opt })
      .check(function ({ n, b }: { n: string; b: boolean }) {
        // todo: e2e
        if (!n) {
          throw new Error(brightRed("Project name required."))
        }

        return true
      }),
  handler: new_handler,
  example: ["tank new -n my-site", "Creates an unfancy new project."],
}
