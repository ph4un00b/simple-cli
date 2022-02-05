export default `<!-- You can leverage the Nunjucks templating stuff -->
<!-- https://mozilla.github.io/nunjucks/templating.html#tags -->
<!-- Or keep it simple with just plain old HTML. -->

<!-- Your fancy HTML markup code here. -->
<h1 class="text-3xl text-center uppercase">___name___ block</h1>

<!-- Then include your component '___name___' anywhere in any page with: -->
<!-- "{" % include "blocks/___name___.html" % "}" -->

<!-- One cool thing about Vite is once you enter $ npm run dev -->
<!-- You can work and your changes will be reflected in the browser on the fly. -->

<!-- type $ npm run build, to yield your webapp in the best optimal way. -->
<!-- type $ npm run preview, to lurk the output, the output will be available in dist/ -->
`