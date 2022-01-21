export async function exec(cmd: string[]) {
  const process = Deno.run({ cmd });
  const status = await process?.status();
  if (status?.success == false) {
    Deno.exit(status.code);
  } else {
    process?.close();
  }
}
