export default `<!doctype html>
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