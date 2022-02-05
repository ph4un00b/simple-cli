export default `// the layout to be used for all the pages.
export const layout = "layouts/___name___.pages.html";
// export const renderOrder = 0; //  default is "0"

const baseURL = "https://api.coinlore.net";
const endpoint = \`\${baseURL}/api/tickers/\`;

export default async function* () {
  const response = await fetch(\`\${endpoint}?start=30&limit=10\`);
  const { data } = await response.json();

  for (const json of data) {
    // be careful of name collisions with your macro names
    // in your ___name___.pages.html layout!
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
      url: \`/___name___/\${json.symbol}/\`,
      tags: ["api-___name___"],
    };
  }
}
`