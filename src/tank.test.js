import { exec } from "./utils.ts";
import {
  assert,
  assertEquals,
  fail,
} from "https://deno.land/std/testing/asserts.ts";
import * as path from "https://deno.land/std@0.122.0/path/mod.ts";
import { walk, walkSync } from "https://deno.land/std@0.122.0/fs/mod.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  spy,
  stub
} from "https://deno.land/x/mock@0.12.2/mod.ts";

function cli_command(options) {
  const cli = [
    Deno.execPath(),
    "run",
    "--allow-read",
    "--allow-write",
    "--unstable",
    "--no-check",
    "--allow-run",
    "./src/cli.ts",
    ...options,
  ];

  return exec(cli);
}

Deno.test(
  "tank can create a fancy blog",
  async () => {
    await cli_command(["blog", "--name", "test_data/test_blog"]);

    try {
      assert(Deno.statSync("test_data/test_blog").isDirectory);
      assert(Deno.statSync("test_data/test_blog/images").isDirectory);
      assert(Deno.statSync("test_data/test_blog/index.html").isFile);
      assert(Deno.statSync("test_data/test_blog/styles.css").isFile);
      assert(Deno.statSync("test_data/test_blog/.gitignore").isFile);

      assertEquals(_num_contents(), 5);
    } finally {
      Deno.removeSync("test_data/test_blog", { recursive: true });
    }
  },
);

Deno.test(
  "tank can create a fancy blog with -n",
  async () => {
    await cli_command(["blog", "-n", "test_data/test_blog"]);

    try {
      assert(Deno.statSync("test_data/test_blog").isDirectory);
      assert(Deno.statSync("test_data/test_blog/images").isDirectory);
      assert(Deno.statSync("test_data/test_blog/index.html").isFile);
      assert(Deno.statSync("test_data/test_blog/styles.css").isFile);
      assert(Deno.statSync("test_data/test_blog/.gitignore").isFile);

      assertEquals(_num_contents(), 5);
    } finally {
      Deno.removeSync("test_data/test_blog", { recursive: true });
    }
  },
);

Deno.test(
  "tank can create a fancy blog with --no-bs",
  async () => {
    await cli_command(["blog", "-n", "test_data/test_blog", "--no-bs"]);

    try {
      assert(Deno.statSync("test_data/test_blog").isDirectory);
      assert(Deno.statSync("test_data/test_blog/images").isDirectory);
      assert(Deno.statSync("test_data/test_blog/index.html").isFile);
      assert(Deno.statSync("test_data/test_blog/styles.css").isFile);
      assert(Deno.statSync("test_data/test_blog/.gitignore").isFile);

      assertEquals(_num_contents(), 5);
    } finally {
      Deno.removeSync("test_data/test_blog", { recursive: true });
    }
  },
);

Deno.test(
  "tank can create a fancy blog with vite configs",
  async () => {
    await cli_command(["blog", "-n", "test_data/test_blog", "-b"]);

    try {
      assert(Deno.statSync("test_data/test_blog").isDirectory);
      assert(Deno.statSync("test_data/test_blog/images").isDirectory);
      assert(Deno.statSync("test_data/test_blog/public").isDirectory);
      assert(Deno.statSync("test_data/test_blog/index.html").isFile);
      assert(Deno.statSync("test_data/test_blog/styles.css").isFile);
      assert(Deno.statSync("test_data/test_blog/.gitignore").isFile);
      assert(Deno.statSync("test_data/test_blog/main.js").isFile);
      assert(Deno.statSync("test_data/test_blog/postcss.config.js").isFile);
      assert(Deno.statSync("test_data/test_blog/tailwind.config.js").isFile);
      assert(Deno.statSync("test_data/test_blog/vite.config.js").isFile);
      assert(Deno.statSync("test_data/test_blog/package.json").isFile);

      assert(Deno.statSync("test_data/test_blog/package-lock.json").isFile);
      assert(Deno.statSync("test_data/test_blog/node_modules").isDirectory);

      assertEquals(_num_contents(), 13);
    } finally {
      Deno.removeSync("test_data/test_blog", { recursive: true });
    }
  },
);


Deno.test(
  "tank can add vite configs inside a directory",
  async () => {
    await cli_command(["vite"]);

    try {
      assert(Deno.statSync("public").isDirectory);
      assert(Deno.statSync("main.js").isFile);
      assert(Deno.statSync("postcss.config.js").isFile);
      assert(Deno.statSync("tailwind.config.js").isFile);
      assert(Deno.statSync("vite.config.js").isFile);
      assert(Deno.statSync("package.json").isFile);

      assert(Deno.statSync("package-lock.json").isFile);
      assert(Deno.statSync("node_modules").isDirectory);
    } finally {
      Deno.removeSync("public", { recursive: true });
      Deno.removeSync("main.js", { recursive: true });
      Deno.removeSync("postcss.config.js", { recursive: true });
      Deno.removeSync("tailwind.config.js", { recursive: true });
      Deno.removeSync("vite.config.js", { recursive: true });
      Deno.removeSync("package.json", { recursive: true });
      Deno.removeSync("package-lock.json", { recursive: true });
      Deno.removeSync("node_modules", { recursive: true });
    }
  },
);


function _num_contents() {
  let num_contents = 0;
  for (const entry of walkSync("test_data/test_blog", { maxDepth: 1 })) {
    num_contents += 1;
    //   console.log(num_contents, entry.path)
  }
  return num_contents;
}
