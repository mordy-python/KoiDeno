// deno-lint-ignore-file no-explicit-any
import { KoiCallable } from "../koi_callable.ts";
import { Interpreter } from "../interpreter.ts";

export class Print extends KoiCallable {
  arity(): number {
    return 1;
  }
  call(_interpreter: Interpreter, args: any[]) {
    console.log(this.stringify(args[0]));
  }
  private stringify(value: any) {
    if (value == null || value == undefined) {
      return "nil";
    } else if (value == true) {
      return "true";
    } else if (value == false) {
      return "false";
    } else if (value instanceof Number) {
      return value.toString();
    }
    return value.toString();
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
    console.log(this.stringify(args[0]) + "\n");
  }
  private stringify(value: any) {
    if (value == null || value == undefined) {
      return "nil";
    } else if (value == true) {
      return "true";
    } else if (value == false) {
      return "false";
    } else if (value instanceof Number) {
      return value.toString();
    }
    return value.toString();
  }
  toString() {
    return "<native function println>";
  }
}
