import { vite_handler } from "./tank.ts"

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export const VITE = {
  command: "<vite>",
  describe: "Updates your project with Vite + Tailwind stuff.",
  builder: noop,
  handler: vite_handler,
  example: ["tank vite", "Tailwind + Vite configurations for your project."],
}
