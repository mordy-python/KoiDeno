// deno-lint-ignore-file no-explicit-any no-unused-vars

export abstract class KoiCallable {
  arity(): number {
    throw "Not Implemented";
  }
  call(interpreter: any, args: Array<any>) {
    throw "Not Implemented";
  }
}
