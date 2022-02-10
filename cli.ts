import { brightGreen, yargs } from "./deps.ts"
import { HTTP } from "./command.http.ts"
import { NEW } from "./command.new.ts"
import { VITE } from "./command.vite.ts"
import { PAGES } from "./command.p.ts"
import { COMPONENTS } from "./command.c.ts"
import { json2html, readLines } from "./deps.ts"
import base_page from "./templates/vanilla/base_page.ts"
import { create_dir, create_page_file } from "./actions.ts"

if (import.meta.main) {
  yargs(Deno.args)
    .command(
      "$0",
      "cli",
      () => {},
      // eslint-disable-next-line max-lines-per-function
      async (argv) => {
        console.log("jamon!", argv)

        const json = await data_stdin()
        console.log(json2html(JSON.parse(json.join(""))))

        const js_object = JSON.parse(json.join(""))

        if (Array.isArray(js_object)) {
          for (const item of js_object) {
            create_dir(`tank_multiple/${item["name"]}`)
            create_page_file(
              `tank_multiple/${item["name"]}/index.html`,
              base_page.replace(/__html__/g, json2html(item)),
            )
          }
        } else {
          create_dir("tank_single")
          create_page_file(
            "tank_single/index.html",
            base_page.replace(
              /__html__/g,
              json2html(JSON.parse(json.join(""))),
            ),
          )
        }

        async function data_stdin() {
          const json = []
          for await (const line of readLines(Deno.stdin)) {
            json.push(line)
          }
          return json
        }
      },
    )
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
    .version("0.9.0.0")
    .parse()
}
