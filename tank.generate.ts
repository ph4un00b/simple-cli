import { exec, stdOut } from "./actions.ts";
import {
  brightGreen,
  lume,
  parse,
  slugify_urls,
} from "./deps.ts"

export const fns = {
  exec,
  stdOut,
  lume
}
// eslint-disable-next-line max-lines-per-function
export async function generate_multiple_pages() {
  // todo, tests with sinon
  const site = fns.lume(
    { quiet: false },
    {
      yaml: {
        extensions: [".pages.yaml", ".pages.yml"],
      },
      markdown: {
        // todo[1]: error, research why content is not parsed?
        extensions: [".pages.md"],
      },
      json: {
        // not working, due to docs
        extensions: {
          data: [".pages.json"],
          pages: [".pages.json"],
        },
      },
      // todo: pr docs enhancement
      modules: {
        extensions: {
          pages: [".indice.js", ".pages.js", ".pages.ts", ".pages.md"],
          data: [".pages.js", ".pages.ts"],
          components: [".pages.js", ".pages.ts"],
        },
      },
      nunjucks: {
        extensions: [".pages.html"],
        includes: "blocks",
        options: {
          throwOnUndefined: true,
        },
      },
    },
  )

  let start: number
  const folders_to_remove = new Set<string>()

  site.addEventListener("beforeBuild", () => {
    start = Date.now()
  })

  site.use(slugify_urls())

  // eslint-disable-next-line max-lines-per-function
  site.addEventListener("afterBuild", ({ pages }) => {
    if (!pages) return
    if (pages.length === 0) return

    for (
      const {
        dest: { path },
      } of pages
    ) {
      folders_to_remove.add(_parent_directory(path))
    }

    site.run("deleting-folders")

    const millis = Date.now() - start
    fns.stdOut(brightGreen(`took: ${Math.floor(millis)} ms.`))
  })

  // eslint-disable-next-line max-lines-per-function
  site.script("deleting-folders", async () => {
    for (const folder of folders_to_remove) {
      try {
        Deno.removeSync(folder, { recursive: true })
      } catch (error) {
        // console.log(error);
      }
    }

    try {
      if (Deno.build.os === "windows") {
        await fns.exec(["cmd", "/c", "mv", "_site/**", "."])
      } else {
        await fns.exec(["cp", "-R", "_site/", "."])
      }
      Deno.removeSync("_site", { recursive: true })
    } catch (error) {
      // console.log(error);
    }
  })

  function _parent_directory(path: string) {
    return parse(path).dir.split("/")[1]
  }

  await site
    .ignore("blocks")
    .ignore("src")
    .ignore("public")
    .ignore("dist")
    .build()
}