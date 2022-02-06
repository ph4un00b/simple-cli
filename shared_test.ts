import { assertEquals } from "./dev_deps.ts"

export function assertOutputCallHave(
  fakeStdOut: sinon.SinonStub<[text: string], void>,
  call: number,
  match: string | RegExp,
) {
  // be careful, colours modify the expectation!
  assertEquals(
    fakeStdOut.getCall(call).args[0].match(match)?.length,
    1,
    fakeStdOut.getCall(call).args[0],
  )
}

export function assertOutputCalls(
  fakeStdOut: sinon.SinonStub<[text: string], void>,
  expected: number,
) {
  assertEquals(fakeStdOut.getCalls().length, expected, "wrong output.")
}

export function assertInsertCalls(
  fakeInsert: sinon.SinonStub<[content: string, filename: string], void>,
  expected: number,
) {
  assertEquals(fakeInsert.getCalls().length, expected, "wrong insert.")
}

export function assertFilesCalls(
  fakeFile: sinon.SinonStub<[full_path: string, content: string], void>,
  expected: number,
) {
  assertEquals(fakeFile.getCalls().length, expected, "wrong files.")
}

export function assertDirectoriesCalls(
  fakeDir: sinon.SinonStub<[name: string], void>,
  expected: number,
) {
  assertEquals(fakeDir.getCalls().length, expected, "wrong directories.")
}

export function assertBlockCalls(
  fakeBlock: sinon.SinonStub<
    [name: string, insert?: boolean | undefined],
    void
  >,
  expected: number,
) {
  assertEquals(fakeBlock.getCalls().length, expected, "wrong block.")
}
