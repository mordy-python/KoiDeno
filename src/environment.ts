// deno-lint-ignore-file no-explicit-any
import { Token } from "./token.ts";

export class Environment {
  parent?: Environment;
  values: Map<string, any>;
  constructor(parent?: Environment) {
    this.parent = parent;
    this.values = new Map<string, any>();
  }
  define(name: string, value: any) {
    this.values.set(name, value);
  }
  get(name: Token): any {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    throw `Undefined name: "${name.lexeme}"`;
  }
  assign(name: Token, value: any): any {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }
    if (this.parent) {
      this.parent.assign(name, value);
      return;
    }
    throw `Cannot assign to variable "${name.lexeme}" before it was declared`;
  }
  get_at(distance: number, name: string) {
    return this.ancestor(distance).values.get(name);
  }
  private ancestor(distance: number) {
    let env = <Environment> this;

    for (const _ of [...Array(distance)].map((_, i) => 0 + i * 1)) {
      env = <Environment> env.parent;
    }
    return env;
  }
  assign_at(distance: number, name: Token, value: any) {
    this.ancestor(distance).assign(name, value);
  }
}
