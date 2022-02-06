/* eslint-disable max-lines-per-function */
import { assertEquals, sinon } from "./dev_deps.ts"
import { fns, new_handler, generate_handler, pages_handler, vite_handler } from "./tank.ts"

Deno.test("tank can create a fancy blog", async function() {
  const {
    sandbox, fakeNewProject,
  } = setup()
  await new_handler({ name: "test" })
  assertEquals(fakeNewProject.getCalls().length, 1)
  assertEquals(fakeNewProject.getCall(0).args, ["test"])
  sandbox.restore()
})

Deno.test("tank can create an unfancy blog", async function() {
  const {
    sandbox, fakeNewProject, fakeViteConfigs
  } = setup()
  await new_handler({ name: "test", bs: true })
  assertEquals(fakeNewProject.getCalls().length, 1)
  assertEquals(fakeNewProject.getCall(0).args, ["test"])
  assertEquals(fakeViteConfigs.getCalls().length, 1)
  sandbox.restore()
})

Deno.test("tank can create vite configs", async function() {
  const {
    sandbox, fakeViteConfigs
  } = setup()
  await vite_handler()
  assertEquals(fakeViteConfigs.getCalls().length, 1)
  sandbox.restore()
})

Deno.test("tank can create multiple blocks at once", function () {
  const {
    sandbox,
    fakeMacroBlock,
    fakeApiBlock,
    fakeDataBlock,
    fakeHtmlBlock,
  } = setup()

  generate_handler({ data: ["list", "sections"] })

  assertEquals(fakeDataBlock.getCalls().length, 2)
  assertEquals(fakeDataBlock.getCall(0).args, ["list"])
  assertEquals(fakeDataBlock.getCall(1).args, ["sections"])

  generate_handler({ html: ["list", "sections"] })

  assertEquals(fakeHtmlBlock.getCalls().length, 2)
  assertEquals(fakeHtmlBlock.getCall(0).args, ["list"])
  assertEquals(fakeHtmlBlock.getCall(1).args, ["sections"])

  generate_handler({ macro: ["list", "sections"] })

  assertEquals(fakeMacroBlock.getCalls().length, 2)
  assertEquals(fakeMacroBlock.getCall(0).args, ["list"])
  assertEquals(fakeMacroBlock.getCall(1).args, ["sections"])

  generate_handler({ api: ["list", "sections"] })

  assertEquals(fakeApiBlock.getCalls().length, 2)
  assertEquals(fakeApiBlock.getCall(0).args, ["list"])
  assertEquals(fakeApiBlock.getCall(1).args, ["sections"])
  sandbox.restore()
})

Deno.test("tank generator can slug fancy block names", function () {
  const {
    sandbox,
    fakeMacroBlock,
    fakeApiBlock,
    fakeDataBlock,
    fakeHtmlBlock,
  } = setup()
  generate_handler({ macro: ["fancy-title"] })
  assertEquals(fakeMacroBlock.getCall(0).args, ["fancy_title"])

  generate_handler({ api: ["fancy]title"] })
  assertEquals(fakeApiBlock.getCall(0).args, ["fancytitle"])

  generate_handler({ data: ["fancy///title"] })
  assertEquals(fakeDataBlock.getCall(0).args, ["fancytitle"])

  generate_handler({ html: ["FANCY=title%"] })
  assertEquals(fakeHtmlBlock.getCall(0).args, ["fancytitle"])
  sandbox.restore()
})

Deno.test("tank can create a single page", function () {
  const { sandbox, fakeSinglePage } = setup()
  pages_handler({ single: ["pricing"] })
  assertEquals(fakeSinglePage.getCalls().length, 1)
  assertEquals(fakeSinglePage.getCall(0).args, ["pricing"])
  sandbox.restore()
})

Deno.test("tank can slug a page names", () => {
  const { sandbox, fakeSinglePage } = setup()
  pages_handler({ single: ["landing-page"] })
  assertEquals(fakeSinglePage.getCall(0).args, ["landing-page"])

  pages_handler({ single: ["/-$-pricing-$-/"] })
  assertEquals(fakeSinglePage.getCall(1).args, ["pricing"])

  pages_handler({ single: ["//eve///nts//"] })
  assertEquals(fakeSinglePage.getCall(2).args, ["events"])

  pages_handler({ single: ["\\ev\\\\\\ents\\"] })
  assertEquals(fakeSinglePage.getCall(3).args, ["events"])
  sandbox.restore()
})

Deno.test("tank can handle a page names with sub-directories", () => {
  const { sandbox, fakeSinglePage } = setup()
  pages_handler({
    single: ["landing-page/my/subfolder/page"],
  })
  assertEquals(fakeSinglePage.getCall(0).args, [
    "landing-page/my/subfolder/page",
  ])
  sandbox.restore()
})

Deno.test("tank can handle --page names with Windows slashes \\.", () => {
  const { sandbox, fakeSinglePage } = setup()
  pages_handler({
    single: ["landing-page\\my\\subfolder\\page"],
  })
  assertEquals(fakeSinglePage.getCall(0).args, [
    "landing-page/my/subfolder/page",
  ])
  sandbox.restore()
})

Deno.test("tank can create a multiple page creator files.", function () {
  const { sandbox, fakeMultiplePage } = setup()
  pages_handler({ multiple: ["money"] })
  assertEquals(fakeMultiplePage.getCalls().length, 1)
  assertEquals(fakeMultiplePage.getCall(0).args, ["money"])
  sandbox.restore()
})

Deno.test("tank can slug a --multiple names", function () {
  const { sandbox, fakeMultiplePage } = setup()
  pages_handler({ multiple: ["landing-page"] })
  assertEquals(fakeMultiplePage.getCall(0).args, ["landing-page"])

  pages_handler({ multiple: ["/-$-pricing-$-/"] })
  assertEquals(fakeMultiplePage.getCall(1).args, ["pricing"])

  pages_handler({ multiple: ["//eve///nts//"] })
  assertEquals(fakeMultiplePage.getCall(2).args, ["eve-nts"])

  pages_handler({ multiple: ["\\ev\\\\\\ents\\"] })
  assertEquals(fakeMultiplePage.getCall(3).args, ["ev-ents"])
  sandbox.restore()
})

Deno.test("tank can handle --multiple names with sub-directories", () => {
  const { sandbox, fakeMultiplePage } = setup()
  pages_handler({ multiple: ["landing-page/my/subfolder/page"] })
  assertEquals(fakeMultiplePage.getCall(0).args, [
    "landing-page-my-subfolder-page",
  ])
  sandbox.restore()
})

Deno.test(
  "tank can handle --multiple names with Windows slashes \\.",
  function () {
    const { sandbox, fakeMultiplePage } = setup()
    pages_handler({
      multiple: ["landing-page\\my\\subfolder\\page"],
    })
    assertEquals(fakeMultiplePage.getCall(0).args, [
      "landing-page-my-subfolder-page",
    ])
    sandbox.restore()
  },
)

Deno.test({
  name:
    "tank can build --multiple pages and move files in current directory on Windows.",
  ignore: true,
  fn: async () => {
    try {
      await pages_handler({ build: true })
      // assertEquals(mock.executed({ call: 0 }).args, [
      //   "cmd",
      //   "/c",
      //   "mv",
      //   "_site/**",
      //   ".",
      // ])
    } finally {
    }
  },
})

// todo: test when node.js is no installed bc npm will be absente.

function setup() {
  const sandbox = sinon.createSandbox()
  const fakeApiBlock = sandbox.stub(fns, "create_api_block")
  const fakeDataBlock = sandbox.stub(fns, "create_data_block")
  const fakeHtmlBlock = sandbox.stub(fns, "create_html_block")
  const fakeMacroBlock = sandbox.stub(fns, "create_macro_block")
  const fakeSinglePage = sandbox.stub(fns, "create_single_page")
  const fakeNewProject = sandbox.stub(fns, "create_new_project")
  const fakeViteConfigs = sandbox.stub(fns, "create_vite_configs")
  const fakeMultiplePage = sandbox.stub(fns, "create_multiple_configs")
  return {
    sandbox,
    fakeApiBlock,
    fakeDataBlock,
    fakeHtmlBlock,
    fakeMacroBlock,
    fakeSinglePage,
    fakeNewProject,
    fakeViteConfigs,
    fakeMultiplePage,
  }
}
