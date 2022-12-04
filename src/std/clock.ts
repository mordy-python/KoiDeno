// deno-lint-ignore-file no-explicit-any
import { KoiCallable } from "../koi_callable.ts";
import { Interpreter } from "../interpreter.ts";

export class Clock extends KoiCallable {
  arity(): number {
    return 0;
  }
  call(_interpreter: Interpreter, _args: any[]): number {
    return Date.now() / 1000;
  }
  toString() {
    return "<native function clock>";
  }
}
