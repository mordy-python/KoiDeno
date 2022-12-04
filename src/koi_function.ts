// deno-lint-ignore-file no-explicit-any
import { Environment } from "./environment.ts";
import { KoiCallable } from "./koi_callable.ts";
import { KoiInstance } from "./koi_instance.ts";
import { KoiReturnError } from "./koi_return_error.ts";
import { Function } from "./stmt.ts";
import { Token } from "./token.ts";

export class KoiFunction extends KoiCallable {
  decl: Function;
  closure: Environment;
  is_initializer: boolean;
  constructor(
    declaration: Function,
    closure: Environment,
    is_initializer: boolean,
  ) {
    super();
    this.decl = declaration;
    this.closure = closure;
    this.is_initializer = is_initializer;
  }
  call(interpreter: any, args: any[]) {
    const env = new Environment(this.closure);
    for (const token_arg of this.zip(this.decl.params, args)) {
      const tok: Token = token_arg[0];
      const arg: any = token_arg[1];

      env.define(tok.lexeme, arg);
    }
    try {
      interpreter.exec_block(this.decl.body, env);
    } catch (error) {
      if (error instanceof KoiReturnError) {
        if (this.is_initializer) {
          return this.closure.get_at(0, "this");
        }
        return error.value;
      }
    }
    if (this.is_initializer) {
      return this.closure.get_at(0, "this");
    }
    return null;
  }
  private *zip(a: Array<Token>, b: Array<any>) {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      yield [a[i], b[i]];
    }
  }
  arity(): number {
    return this.decl.params.length;
  }
  bind(instance: KoiInstance) {
    const env = new Environment(this.closure);
    env.define("this", instance);
    return new KoiFunction(this.decl, env, this.is_initializer);
  }
  toString() {
    return `<function ${this.decl.name.lexeme}>`;
  }
}
