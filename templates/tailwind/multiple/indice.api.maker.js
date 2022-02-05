export default `export const layout = "layouts/paginator.pages.html";
// Changed this to "1"
// in order to create all paginated pages
// then will be able to fetch the pages by tag.
export const renderOrder = 1;

// exported data will be available in your layout
export const title = "___name___ pages";
export const global_text = "Have nice day :)!";

export default function* ({ search, paginate }) {
  // https://lumeland.github.io/core/pagination/
  const items = search.pages("api-___name___");

  // modify your paginator URL as you desire :).
  const opts = { url: (n) => \`/___name___/page/\${n}/\`, size: 8 };

  for (const page of paginate(items, opts)) {
    // Added property "menu"
    // in order to show the first page
    // within our template "paginator.pages.html".
    if (page.pagination.page === 1) {
      page.menu = { visible: true, title: "___name___ pages" };
    }

    yield page;
  }
}
`