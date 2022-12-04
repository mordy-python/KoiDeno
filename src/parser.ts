// deno-lint-ignore-file no-unused-vars no-explicit-any
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
  Return,
  Stmt,
  Var,
  While,
} from "./stmt.ts";
import { Token } from "./token.ts";
import { TokenType } from "./token_type.ts";

class ParseError extends SyntaxError {}

export class Parser {
  tokens: Array<Token>;
  on_error: (token: Token, message: string) => void;
  current: number;
  constructor(
    tokens: Array<Token>,
    on_error: (token: Token, message: string) => void,
  ) {
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
      } else if (this.match(TokenType.CLASS)) {
        return this.class_declaration();
      } else if (this.match(TokenType.VAR)) {
        return this.var_declaration();
      } else {
        return this.statement();
      }
    } catch (error) {
      this.synchronize();
      console.log(error);
      Deno.exit(1);
    }
  }

  private statement(): any {
    if (this.match(TokenType.IF)) {
      return this.if_statement();
    }
    if (this.match(TokenType.LEFT_BRACE)) {
      return this.block();
    }
    if (this.match(TokenType.FOR)) {
      return this.for_statement();
    }
    if (this.match(TokenType.WHILE)) {
      return this.while_statement();
    }
    if (this.match(TokenType.RETURN)) {
      return this.return_statement();
    }
    return this.expression_statement();
  }
  private return_statement() {
    const keyword = this.previous();
    let value: Expr | undefined;
    if (!this.check(TokenType.SEMICOLON)) {
      value = this.expression();
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after return value");
    return new Return(keyword, value);
  }
  private for_statement() {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' in for loop declaration");
    let initializer: Stmt | undefined | null;
    let condition: Expr | undefined | null;
    let increment: Expr | undefined | null;
    if (this.match(TokenType.SEMICOLON)) {
      initializer = null;
    } else if (this.match(TokenType.VAR)) {
      initializer = this.var_declaration();
    } else {
      initializer = this.expression_statement();
    }
    if (!this.check(TokenType.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(
      TokenType.SEMICOLON,
      "Expected semicolon after loop condition",
    );
    if (!this.check(TokenType.RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(
      TokenType.RIGHT_PAREN,
      "Expected ')' after for loop initialization",
    );
    let body = this.statement();

    // Desugar it; turn it into a while loop
    if (increment != null || increment != undefined) {
      body = new Block([body, new Expression(increment)]);
    }
    if (condition == null || condition == undefined) {
      condition = new Literal(true);
    }
    body = new While(condition, body);
    if (initializer != null || initializer != undefined) {
      body = new Block([initializer, body]);
    }
    return body;
  }
  private while_statement() {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after while keyword");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after while condition");
    const body = this.statement();

    return new While(condition, this.statement());
  }
  private if_statement() {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after if keyword");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition");

    const then_branch = this.statement();
    let else_branch: Stmt | undefined;
    if (this.match(TokenType.ELSE)) {
      else_branch = this.statement();
    }
    return new If(condition, then_branch, else_branch);
  }
  private expression_statement(): Stmt {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value");
    return new Expression(expr);
  }
  private expression() {
    return this.assignment();
  }
  private assignment(): any {
    const expr = this.or();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Variable) {
        const name = expr.name;
        return new Assign(name, value);
      } else if (expr instanceof Get) {
        return new Set(expr.obj, expr.name, value);
      }
      return this.error(equals, "Invalid assignment target");
    }

    return expr;
  }
  private or() {
    let expr = this.and();

    while (this.match(TokenType.OR)) {
      const op = this.previous();
      const right = this.and();
      expr = new Logical(expr, op, right);
    }
    return expr;
  }
  private and(): any {
    let expr = this.equality();

    while (this.match(TokenType.AND)) {
      const op = this.previous();
      const right = this.equality();
      expr = new Logical(expr, op, right);
    }
    return expr;
  }
  private equality() {
    let expr = this.comparison();

    while (this.match(TokenType.BANG, TokenType.BANG_EQUAL)) {
      const op = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, op, right);
    }
    return expr;
  }
  private comparison() {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
        TokenType.EQUAL_EQUAL,
      )
    ) {
      const op = this.previous();
      const right = this.term();
      expr = new Binary(expr, op, right);
    }
    return expr;
  }
  private term() {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const op = this.previous();
      const right = this.factor();
      expr = new Binary(expr, op, right);
    }
    return expr;
  }
  private factor() {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR, TokenType.MOD)) {
      const op = this.previous();
      const right = this.unary();
      expr = new Binary(expr, op, right);
    }
    return expr;
  }
  private unary(): any {
    if (this.match(TokenType.BANG_EQUAL, TokenType.MINUS)) {
      const op = this.previous();
      const right = this.unary();
      return new Unary(op, right);
    }
    return this.call();
  }
  private call() {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finish_call(expr);
      } else if (this.match(TokenType.DOT)) {
        const name = this.consume(
          TokenType.IDENTIFIER,
          "Expected valid property name following '.'",
        );
        expr = new Get(expr, name);
      } else {
        break;
      }
    }
    return expr;
  }
  private finish_call(callee: Expr) {
    const args: Array<Expr> = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }
    const paren = this.consume(
      TokenType.RIGHT_PAREN,
      "Expect ')' after arguments in call expression",
    );
    return new Call(callee, paren, args);
  }
  private primary(): Variable | Literal | This | Super | Grouping | Call {
    if (this.match(TokenType.FALSE)) {
      return new Literal(false);
    } else if (this.match(TokenType.TRUE)) {
      return new Literal(true);
    } else if (this.match(TokenType.NIL)) {
      return new Literal(null);
    } else if (this.match(TokenType.IDENTIFIER)) {
      return new Variable(this.previous());
    } else if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    } else if (this.match(TokenType.THIS)) {
      return new This(this.previous());
    } else if (this.match(TokenType.SUPER)) {
      const keyword = this.previous();
      this.consume(TokenType.DOT, "Expected '.' after 'super' keyword");
      const method = this.consume(
        TokenType.IDENTIFIER,
        "Expected superclass name after '.' in 'super' expression",
      );
      return new Super(keyword, method);
    } else if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.equality();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' aqfter expression");
      return new Grouping(expr);
    }
    throw this.error(this.peek(), "Expected expression");
  }
  private var_declaration() {
    const name = this.consume(TokenType.IDENTIFIER, "Expected identifier");
    let init_val: Expr | undefined;
    if (this.match(TokenType.EQUAL)) {
      init_val = this.expression();
    }
    this.consume(
      TokenType.SEMICOLON,
      "Expected ';' after variable declaration",
    );
    return new Var(name, init_val);
  }
  private class_declaration() {
    const name = this.consume(
      TokenType.IDENTIFIER,
      "Expected valid identifier in class name",
    );
    let superclass: Variable | undefined = undefined;
    if (this.match(TokenType.LESS)) {
      this.consume(
        TokenType.IDENTIFIER,
        "Expected valid identifier in superclass name",
      );
      superclass = new Variable(this.previous());
    }
    this.consume(
      TokenType.LEFT_BRACE,
      "Expected block after class declaration",
    );
    const methods: Array<Function> = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.is_at_end()) {
      methods.push(this.function("method"));
    }
    this.consume(TokenType.RIGHT_BRACE, "Expected '}' after class body");
    return new Class(name, methods, superclass);
  }
  private function(kind: string): Function {
    const name = this.consume(TokenType.IDENTIFIER, `Expected ${kind} name`);
    this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name`);
    const params: Array<Token> = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      params.push(
        this.consume(
          TokenType.IDENTIFIER,
          `Parameter names must be valid identifiers`,
        ),
      );
      while (this.match(TokenType.COMMA)) {
        params.push(
          this.consume(
            TokenType.IDENTIFIER,
            `Parameter names must be valid identifiers`,
          ),
        );
      }
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after paramter list");
    this.consume(TokenType.LEFT_BRACE, "Expect '{' before " + kind + " body");
    const body = this.block();
    return new Function(name, params, body);
  }
  private block(): Array<Stmt> {
    const statements: Array<Stmt> = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.is_at_end()) {
      statements.push(this.declaration());
    }
    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block");
    return statements;
  }
  private consume(type: TokenType, message: string) {
    if (this.check(type)) {
      return this.advance();
    }
    throw this.on_error(this.peek(), message);
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
  private synchronize() {
    this.advance();

    while (!this.is_at_end()) {
      if (this.previous().type == TokenType.SEMICOLON) {
        return;
      }
      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.WHILE:
        case TokenType.IF:
        case TokenType.RETURN:
          return;
      }
      this.advance();
    }
  }
  private error(token: Token, message: string) {
    this.on_error(token, message);
    throw new ParseError(token.line + " " + message);
  }
}
