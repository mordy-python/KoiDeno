// deno-lint-ignore-file no-explicit-any
import { KoiCallable } from "../koi_callable.ts";
import { Interpreter } from "../interpreter.ts";

export class Input extends KoiCallable {
  arity(): number {
    return 1;
  }
  call(_interpreter: Interpreter, args: any[]): string | null {
    return prompt(args[0]);
  }
  toString() {
    return "<native function input>";
  }
}
