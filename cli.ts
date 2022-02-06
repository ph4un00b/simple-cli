import { brightGreen, yargs } from "./deps.ts"
import { HTTP } from "./command.http.ts"
import { NEW } from "./command.new.ts"
import { VITE } from "./command.vite.ts"
import { PAGES } from "./command.p.ts"
import { COMPONENTS } from "./command.c.ts"

if (import.meta.main) {
  yargs(Deno.args)
    .command(HTTP)
    .example(...HTTP.example)
    .command(NEW)
    .example(...NEW.example)
    .command(VITE)
    .example(...VITE.example)
    .command(COMPONENTS)
    .example(...COMPONENTS.example)
    .command(PAGES)
    .example(...PAGES.example)
    .example(brightGreen("tank p --build"), "Create/Rebuild multiple pages.")
    // .epilogue("for more information, find our manual at http://example.com")
    .strictCommands()
    .demandCommand(1)
    .version("0.8.0.61")
    .parse()
}
