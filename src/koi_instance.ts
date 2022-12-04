// deno-lint-ignore-file no-explicit-any
import { Token } from "./token.ts";
import { KoiClass } from "./koi_class.ts";

export class KoiInstance {
  klass: KoiClass;
  fields: Map<string, any>;
  constructor(klass: KoiClass) {
    this.klass = klass;
    this.fields = new Map();
  }
  toString() {
    return `<instance of class ${(<any> this.klass).constructor.name}`;
  }

  get(name: Token) {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme);
    }
    const method = this.klass.find_method(name.lexeme);
    if (method) {
      return method.bind(this);
    }
    throw `Undefined property "${name.lexeme}"`;
  }
  set(name: Token, value: any) {
    this.fields.set(name.lexeme, value);
  }
}
