import { YargsInstance } from "./deps.ts"
import { http_handler } from "./tank.ts"

const p_opt = {
  alias: "port",
  default: 3000,
  describe: "Port.",
  type: "number",
}

export const HTTP = {
  command: "<http>",
  describe: "Simple HTTP Server.",
  builder: (cli: YargsInstance) => cli.options({ p: p_opt }),
  handler: http_handler,
  example: ["tank http", "Simple HTTP Server."],
}