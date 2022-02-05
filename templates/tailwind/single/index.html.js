export default `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body class="text-5xl bg-gray-900 text-rose-400">
    {% from "blocks/titles.macro.html" import titles_green %}

    <main class="flex flex-col items-center justify-center w-screen h-screen">
        Welcome to {{ titles_green("___name___ Page!") }}
    </main>
    <script type="module" src="./main.js"></script>
</body>

</html>`