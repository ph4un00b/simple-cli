export default `// https://axios-http.com/docs/instance
const axios = require("axios").default;
const baseURL = "https://animechan.vercel.app";
const endpoint = \`\${baseURL}/api/quotes/anime\`;
const timeout = { timeout: 2500 /*ms*/ };

module.exports = async function () {
  let json;

  try {
    json = await axios.get(\`\${endpoint}?title=zero+kara\`, timeout);
  } catch ({ message }) {
    console.error(\`[Model/___name___]: \${message}\`);
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

  console.error(\`[Model/___name___]: No data found.\`);
  process.exit(1);
};
`