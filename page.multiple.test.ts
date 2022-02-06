/* eslint-disable max-lines-per-function */
import { assertEquals, sinon } from "./dev_deps.ts"
import { create_multiple_configs, fns } from "./page.multiple.ts"
import {
  assertDirectoriesCalls,
  assertFilesCalls,
  assertOutputCalls,
  assertOutputCallHave,
  assertBlockCalls
} from "./shared_test.ts"

Deno.test("can create multiple pages configuration", function () {
  const { sandbox, fakeDir, fakeFile, fakeBlock, fakeStdOut } =
    setup()
  sandbox.stub(fns, "page_exist").returns(false)
  create_multiple_configs("money")
  assertEquals(fakeDir.getCalls().length, 2)
  assertEquals(fakeDir.getCall(0).args, ["blocks/layouts"])
  assertEquals(fakeDir.getCall(1).args, ["makers"])
  assertEquals(fakeBlock.getCall(0).args[0], "pages_title")
  assertEquals(fakeBlock.getCall(0).args[1], false)
  assertEquals(fakeFile.getCalls().length, 8)
  assertEquals(fakeFile.getCall(0).args[0], "blocks/layouts/money.pages.html")
  assertEquals(fakeFile.getCall(0).args[1], page_layout)
  assertEquals(fakeFile.getCall(1).args[0], "blocks/layouts/paginator.pages.html")
  assertEquals(fakeFile.getCall(1).args[1], paginator_layout)
  assertEquals(fakeFile.getCall(2).args[0], "makers/money/indice/api.indice.js")
  assertEquals(fakeFile.getCall(2).args[1], api_indice_config)
  assertEquals(fakeFile.getCall(3).args[0], "makers/money/indice/css.indice.js")
  assertEquals(fakeFile.getCall(3).args[1], css_indice)
  assertEquals(fakeFile.getCall(4).args[0], "makers/money/indice/js.indice.js")
  assertEquals(fakeFile.getCall(4).args[1], js_indice)
  assertEquals(fakeFile.getCall(5).args[0], "makers/money/pages/api.pages.js")
  assertEquals(fakeFile.getCall(5).args[1], api_pages_config)
  assertEquals(fakeFile.getCall(6).args[0], "makers/money/pages/css.pages.js")
  assertEquals(fakeFile.getCall(6).args[1], css_pages)
  assertEquals(fakeFile.getCall(7).args[0], "makers/money/pages/js.pages.js")
  assertEquals(fakeFile.getCall(7).args[1], js_pages)
  assertEquals(fakeStdOut.getCalls().length, 3)
  assertOutputCallHave(fakeStdOut, 0, "Update content property")
  assertOutputCallHave(fakeStdOut, 1, /money\/\*\*\/\*\.\{html,js\}/)
  assertOutputCallHave(fakeStdOut, 2, "Adjust as needed.")
  sandbox.restore()
})


Deno.test("--multiple do not allow to create the same page.", function () {
  const { sandbox, fakeDir, fakeFile, fakeBlock, fakeStdOut } = setup()
  sandbox.stub(fns, "page_exist").returns(true)
  create_multiple_configs("money")
  assertOutputCalls(fakeStdOut, 1)
  assertOutputCallHave(fakeStdOut, 0, "Already Created Page")
  assertDirectoriesCalls(fakeDir, 0)
  assertBlockCalls(fakeBlock, 0)
  assertFilesCalls(fakeFile, 0)
  sandbox.restore()
})

function setup() {
  const sandbox = sinon.createSandbox()
  const fakeDir = sandbox.stub(fns, "create_dir")
  const fakeFile = sandbox.stub(fns, "create_page_file")
  const fakeBlock = sandbox.stub(fns, "create_macro_block")
  const fakeStdOut = sandbox.stub(fns, "stdOut")
  return { sandbox, fakeDir, fakeFile, fakeBlock, fakeStdOut }
}

const api_pages_config = `// the layout to be used for all the pages.
export const layout = "layouts/money.pages.html";
// export const renderOrder = 0; //  default is "0"

const baseURL = "https://api.coinlore.net";
const endpoint = \`\${baseURL}/api/tickers/\`;

export default async function* () {
  const response = await fetch(\`\${endpoint}?start=30&limit=10\`);
  const { data } = await response.json();

  for (const json of data) {
    // be careful of name collisions with your macro names
    // in your money.pages.html layout!
    const model = {
      title: json.name,
      usd: json.price_usd,
      btc: json.price_btc,
      change_day: json.percent_change_24h,
      change_week: json.percent_change_7d,
      market: json.market_cap_usd,
    };

    yield {
      ...model,
      // Make sure the URL last character is slash "/"
      // in order to properly create an index.html file.
      // run: tank p --build
      // You can create all the pages even in a '/my/sub/directory/'
      url: \`/money/\${json.symbol}/\`,
      tags: ["api-money"],
    };
  }
}
`

const page_layout = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
</head>

<body>
    {% from "pages_title.macro.html" import pages_title %}

    <h1>{{ pages_title(title) }}: {{ usd }} US / {{ btc }} BTC</h1>

    <section>
        <div>market: {{ market }}</div>
        <div>last 24 hrs: {{ change_day }}</div>
        <div>last week hrs: {{ change_week }}</div>
    </section>

    <script type="module" src="./../main.js"></script>
</body>

</html>
`

const api_indice_config =
      `export const layout = "layouts/paginator.pages.html";
// Changed this to "1"
// in order to create all paginated pages
// then will be able to fetch the pages by tag.
export const renderOrder = 1;

// exported data will be available in your layout
export const title = "money pages";
export const global_text = "Have nice day :)!";

export default function* ({ search, paginate }) {
  // https://lumeland.github.io/core/pagination/
  const items = search.pages("api-money");

  // modify your paginator URL as you desire :).
  const opts = { url: (n) => \`/money/page/\${n}/\`, size: 8 };

  for (const page of paginate(items, opts)) {
    // Added property "menu"
    // in order to show the first page
    // within our template "paginator.pages.html".
    if (page.pagination.page === 1) {
      page.menu = { visible: true, title: "money pages" };
    }

    yield page;
  }
}
`
const paginator_layout = `<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <meta name="description" content="">
    <link rel="alternate" href="/feed.xml" type="application/atom+xml" title="">
    <link rel="alternate" href="/feed.json" type="application/json" title="">
</head>

<body>

    <nav>
        <a href="/">
            <strong>Home</strong>
        </a>

        <ul>
            {% for entry in search.pages("menu.visible=true") %}
            <li>
                <a href="{{ entry.data.url }}">
                    {{ entry.data.menu.title or entry.data.title }}
                </a>
            </li>
            {% endfor %}
        </ul>
    </nav>

    <main>
        <h1>{{ title }}: "{{ global_text }}"</h1>

        <!-- https://lumeland.github.io/core/pagination/#paginate-helper -->

        {% set pages = results %}

        <nav>
            <ul>
                {% if pagination.previous %}
                <li>
                    <a href="{{ pagination.previous }}" rel="prev">← Previous</a>
                </li>
                {% endif %}
                <li>
                    Page {{ pagination.page }}
                </li>
                {% if pagination.next %}
                <li>
                    <a href="{{ pagination.next }}" rel="next">Next →</a>
                </li>
                {% endif %}
            </ul>
        </nav>

        <ul>
            {% for page in pages %}
            <li>
                <a href="{{ page.data.url }}">
                    {% if page.data.title %}
                    <strong>{{ page.data.title }}</strong>
                    {% else %}
                    <code>{{ page.url }}</code>
                    {% endif %}
                </a>

                <time datetime="{{ page.data.date }}">
                    {{ page.data.date }}
                </time>
            </li>
            {% endfor %}
        </ul>

    </main>

    <script type="module" src="./../main.js"></script>
</body>

</html>`

const css_indice = `// this will create a css file for the index pages.
export const url = "/money/page/styles.css";

// css content.
export default () =>
  \`@tailwind base;
@tailwind components;
@tailwind utilities;\`;`

const css_pages = `// make sure you match the same url path
// as for your pages, if not 'npm run build' will not run!
export const url = "/money/styles.css";

export default () =>
  \`@tailwind base;
@tailwind components;
@tailwind utilities;\`;`

const js_pages = `export const url = "/money/main.js";

export default () =>
  \`import "./styles.css";

// add all your js content...
console.log("money page!");\`;
`

const js_indice = `export const url = "/money/page/main.js";

export default () =>
  \`import "./styles.css";

// add all your js content...
console.log("money indice!");\`;
`
