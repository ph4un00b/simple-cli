export default `<section class="bg-gray-900 text-zinc-100">
    <span class="text-3xl text-transparent uppercase bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
        ___name___ api block
    </span>
    <section class="flex flex-col flex-wrap sm:flex-row">

        <!-- Items from *.model.{dev,prod}.js have a "_items" suffix. -->
        <!-- you can change the suffix in "__tank__/defaults.js" -->

        <!-- For this special component, you will need to stop the local Vite server. -->
        <!-- and re-run it!, $ npm run dev -->

        <!-- This component, created two model files, one for development process. -->
        <!-- one for your production model. yo can see the production output by running:  -->
        <!-- $ npm run prod, then $ npm run preview -->

        {% for item in ___name____items %}
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