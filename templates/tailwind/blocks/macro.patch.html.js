export default `{% from "blocks/___name___.macro.html" import ___name___, ___name____green %}

<div> {{ ___name___("reuse me!", "capitalize") }} </div>
<div> {{ ___name____green("Macro blocks") }} 😁</div>
`