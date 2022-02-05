export default `<!DOCTYPE html>
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