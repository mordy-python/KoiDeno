// deno-lint-ignore-file no-unused-vars
import {
  Assign,
  Binary,
  Call,
  Expr,
  Get,
  Grouping,
  Literal,
  Logical,
  Set,
  Super,
  This,
  Unary,
  Variable,
} from "./expr.ts";
import {
  Block,
  Class,
  Expression,
  Function,
  If,
  Print,
  Return,
  Stmt,
  Var,
  While,
} from "./stmt.ts";
import { Token } from "./token.ts";
import { TokenType } from "./token_type.ts";

class ParseError extends SyntaxError {}

class Parser {
  tokens: Array<Token>;
  on_error?: Function;
  current: number;
  constructor(tokens: Array<Token>, on_error?: Function) {
    this.tokens = tokens;
    this.on_error = on_error;
    this.current = 0;
  }

  parse(): Array<Stmt> {
    const stmts: Array<Stmt> = [];
    while (!this.is_at_end()) {
      stmts.push(this.declaration());
    }
    return stmts;
  }
  declaration(): Stmt {
    try {
      if (this.match(TokenType.FUN)) {
        return this.function("function");
      }
    } catch (error) {
      //
    }
  }
  private match(...types: Array<TokenType>) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }
  private advance() {
    if (!this.is_at_end()) {
      this.current++;
    }
    return this.previous();
  }
  private previous() {
    return this.tokens[this.current - 1];
  }
  private is_at_end(): boolean {
    return this.peek().type == TokenType.EOF;
  }
  private peek(): Token {
    return this.tokens[this.current];
  }
  private check(type: TokenType) {
    if (this.is_at_end()) {
      return false;
    }
    return this.peek().type == type;
  }
}
