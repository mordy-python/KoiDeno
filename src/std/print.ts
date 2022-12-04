// deno-lint-ignore-file no-explicit-any
import { KoiCallable } from "../koi_callable.ts";
import { Interpreter } from "../interpreter.ts";

export class Print extends KoiCallable {
  arity(): number {
    return 1;
  }
  call(_interpreter: Interpreter, args: any[]) {
    console.log(args[0]);
  }
  toString() {
    return "<native function print>";
  }
}

export class Println extends KoiCallable {
  arity(): number {
    return 1;
  }
  call(_interpreter: Interpreter, args: any[]) {
    console.log(args[0] + "\n");
  }
  toString() {
    return "<native function println>";
  }
}
