/* eslint-disable max-lines-per-function */
import { create_api_block, fns } from "./block.api.ts"
import { assertEquals, sinon } from "./dev_deps.ts"
import {
  assertDirectoriesCalls,
  assertFilesCalls,
  assertInsertCalls,
  assertOutputCallHave,
  assertOutputCalls,
} from "./shared_test.ts"

Deno.test("can create a html block.", function () {
  const { sandbox, fakeDir, fakeFile, fakeInsert } = setup()
  sandbox.stub(fns, "block_exist").returns(false)
  create_api_block("title")
  assertEquals(fakeDir.getCall(0).args, ["blocks"])
  assertEquals(fakeFile.getCalls().length, 3)
  assertEquals(fakeFile.getCall(0).args[0], "blocks/title.api.html")
  assertEquals(fakeFile.getCall(0).args[1], html)
  assertEquals(fakeFile.getCall(1).args[0], "blocks/title.model.dev.js")
  assertEquals(fakeFile.getCall(1).args[1], dev_model)
  assertEquals(fakeFile.getCall(2).args[0], "blocks/title.model.prod.js")
  assertEquals(fakeFile.getCall(2).args[1], prod_model)
  assertEquals(fakeInsert.getCall(0).args[1], "index.html")
  assertEquals(
    fakeInsert.getCall(0).args[0],
    "{% include \"blocks/title.api.html\" %}",
  )
  sandbox.restore()
})

Deno.test("--html do not patch index.html.", function () {
  const { sandbox, fakeDir, fakeFile, fakeInsert } = setup()
  sandbox.stub(fns, "block_exist").returns(false)
  create_api_block("title", false)
  assertDirectoriesCalls(fakeDir, 1)
  assertFilesCalls(fakeFile, 3)
  assertInsertCalls(fakeInsert, 0)
  sandbox.restore()
})

Deno.test("--html do not allow to create the same block.", function () {
  const { sandbox, fakeDir, fakeFile, fakeInsert, fakeStdOut } = setup()
  sinon.stub(fns, "block_exist").returns(true)
  create_api_block("title")
  assertDirectoriesCalls(fakeDir, 1)
  assertOutputCalls(fakeStdOut, 1)
  assertOutputCallHave(fakeStdOut, 0, "Already Created Block: title")
  assertFilesCalls(fakeFile, 0)
  assertInsertCalls(fakeInsert, 0)
  sandbox.restore()
})

function setup() {
  const sandbox = sinon.createSandbox()
  const fakeDir = sandbox.stub(fns, "create_dir")
  const fakeFile = sandbox.stub(fns, "create_block_file")
  const fakeInsert = sandbox.stub(fns, "insert_content")
  const fakeStdOut = sandbox.stub(fns, "stdOut")
  return { sandbox, fakeDir, fakeFile, fakeInsert, fakeStdOut }
}

const html = `<section class="bg-gray-900 text-zinc-100">
    <span class="text-3xl text-transparent uppercase bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
        title api block
    </span>
    <section class="flex flex-col flex-wrap sm:flex-row">

        <!-- Items from *.model.{dev,prod}.js have a "_items" suffix. -->
        <!-- you can change the suffix in "__tank__/defaults.js" -->

        <!-- For this special component, you will need to stop the local Vite server. -->
        <!-- and re-run it!, $ npm run dev -->

        <!-- This component, created two model files, one for development process. -->
        <!-- one for your production model. yo can see the production output by running:  -->
        <!-- $ npm run prod, then $ npm run preview -->

        {% for item in title_items %}
        <article class="flex flex-col items-center justify-center w-full sm:w-1/4">
            <header>
                <picture class="flex justify-center p-3">

                    <!-- https://mozilla.github.io/nunjucks/templating.html#if-expression -->
                    <img class="w-40 h-40 p-0.5 rounded-3xl bg-clip-border bg-gradient-to-r from-pink-500 to-violet-500"
                        src="//www.{{ 'placecage' if loop.index % 2 else 'fillmurray' }}.com/g/{{ loop.index }}00/{{ loop.index }}00"
                        alt="random_image">

                </picture>
                <h3 class="pb-2 text-base text-center">
                    {{ item.character }}
                </h3>
            </header>

            <blockquote class="w-3/4 text-sm">
                {{ item.quote | truncate(70) }}
            </blockquote>
        </article>
        {% endfor %}
    </section>
</section>`

const dev_model = `// https://axios-http.com/docs/instance
const axios = require("axios").default;
const baseURL = "https://animechan.vercel.app";
const endpoint = \`\${baseURL}/api/quotes/anime\`;
const timeout = { timeout: 2500 /*ms*/ };

module.exports = async function () {
  let json;

  try {
    json = await axios.get(\`\${endpoint}?title=zero+kara\`, timeout);
  } catch ({ message }) {
    console.error(\`[Model/title]: \${message}\`);
    process.exit(1);
  }

  // Pass the JSON Array in
  // Or customize the Model data
  // the way you want for your component view,
  // Happy Modeling!
  if (json) {
    const arrayOfData = json.data.slice(0, 4);
    return arrayOfData;
  }

  console.error(\`[Model/title]: No data found.\`);
  process.exit(1);
};
`

const prod_model = `// https://axios-http.com/docs/instance
const axios = require("axios").default;
const baseURL = "https://animechan.vercel.app";
const endpoint = \`\${baseURL}/api/quotes/anime\`;
const timeout = { timeout: 2500 /*ms*/ };

module.exports = async function () {
  let json;

  try {
    json = await axios.get(\`\${endpoint}?title=saint+seiya\`, timeout);
  } catch ({ message }) {
    console.error(\`[Model/title]: \${message}\`);
    process.exit(1);
  }

  // Pass the JSON Array in
  // Or customize the Model data
  // the way you want for your component view,
  // Happy Modeling!
  if (json) {
    const arrayOfData = json.data.slice(0, 4);
    return arrayOfData;
  }

  console.error(\`[Model/title]: No data found.\`);
  process.exit(1);
};
`