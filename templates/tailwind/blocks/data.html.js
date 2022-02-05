export default `<article class="flex flex-col items-center antialiased bg-rose-500 text-gray-50">
    <h1 class="text-4xl font-extralight">
        ___name___ block
    </h1>

    <!-- https://mozilla.github.io/nunjucks/templating.html#dump -->
    <!-- Items from *.model.json have a "_items" suffix. -->
    <!-- you can change the suffix in "__tank__/defaults.js" -->

    <!-- For this special component, you will need to stop the local Vite server. -->
    <!-- and re-run it!, $ npm run dev -->

    <section>
        <details>
            <summary class="pl-3 font-mono text-xl ">
                <!-- Special filters provided by Nunjucks. -->
                {{ ___name____items | dump | truncate(20) }}
            </summary>

            <pre class="pt-6">{{ ___name____items | dump(2) }}</pre>
        </details>

        <ol>
            {% for item in ___name____items %}
            <li class="list-decimal">{{ item.title }}</li>
            {% endfor %}
        </ol>
    </section>
</article>
`