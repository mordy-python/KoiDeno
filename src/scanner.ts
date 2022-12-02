import { Token } from "./token.ts";
import { TokenType } from "./token_type.ts";

export default class Scanner {
  source: string;
  tokens: Array<Token>;
  start = 0;
  line = 0;
  current = 0;
  keywords: Map<string, TokenType> = new Map();
  on_error: (line: number, message: string) => void;
  constructor(
    source: string,
    on_error: (line: number, message: string) => void,
  ) {
    this.source = source;
    this.tokens = [];
    this.keywords.set("and", TokenType.AND);
    this.keywords.set("or", TokenType.OR);
    this.keywords.set("not", TokenType.NOT);
    this.keywords.set("if", TokenType.IF);
    this.keywords.set("else", TokenType.ELSE);
    this.keywords.set("class", TokenType.CLASS);
    this.keywords.set("true", TokenType.TRUE);
    this.keywords.set("false", TokenType.FALSE);
    this.keywords.set("nil", TokenType.NIL);
    this.keywords.set("fun", TokenType.FUN);
    this.keywords.set("for", TokenType.FOR);
    this.keywords.set("while", TokenType.WHILE);
    this.keywords.set("print", TokenType.PRINT);
    this.keywords.set("return", TokenType.RETURN);
    this.keywords.set("super", TokenType.SUPER);
    this.keywords.set("this", TokenType.THIS);
    this.keywords.set("var", TokenType.VAR);
    this.on_error = on_error;
  }
  scan_tokens(): Array<Token> {
    while (!this.is_at_end()) {
      this.start = this.current;
      this.tokenize();
    }
    this.tokens.push({
      type: TokenType.EOF,
      lexeme: "",
      literal: null,
      line: this.line,
    } as Token);
    return this.tokens;
  }
  private tokenize() {
    const char = this.advance();

    switch (char) {
      case "(":
        this.add_token(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.add_token(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.add_token(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.add_token(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.add_token(TokenType.COMMA);
        break;
      case ".":
        this.add_token(TokenType.DOT);
        break;
      case "+":
        this.add_token(TokenType.PLUS);
        break;
      case ";":
        this.add_token(TokenType.SEMICOLON);
        break;
      case "*":
        this.add_token(TokenType.STAR);
        break;
      case "%":
        this.add_token(TokenType.MOD);
        break;
      case "/":
        this.operator_slash();
        break;
      case "!":
        this.add_token(
          this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG,
        );
        break;
      case "=":
        this.add_token(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL,
        );
        break;
      case "<":
        this.add_token(
          this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS,
        );
        break;
      case ">":
        this.add_token(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER,
        );
        break;
      case " ":
      case "\t":
      case "\r":
        return null;
      case "\n":
        this.operator_newline();
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isNumber(char)) {
          this.number();
        } else if (this.isAlpha(char) || char == "_") {
          this.identifier();
        } else {
          this.on_error(this.line, `Unexpected character: ${char}`);
          Deno.exit(1);
        }
    }
  }
  private identifier() {
    while (this.isAlphaNum(this.peek()) || this.peek() == "_") {
      this.advance();
    }
    // Check if identifier is a keyword
    const text = this.source.slice(this.start, this.current);
    const type = this.keywords.has(text)
      ? this.keywords.get(text)
      : TokenType.IDENTIFIER;
    this.add_token(type, text);
  }
  private number() {
    while (this.isNumber(this.peek())) {
      this.advance();
    }
    if (this.peek() == "." && this.isNumber(this.peek_next())) {
      // Eat the number
      this.advance();
      while (this.isNumber(this.peek())) {
        this.advance();
      }
    }
    const value = this.source.slice(this.start, this.current);
    const number_value = value.includes(".")
      ? parseFloat(value)
      : parseInt(value);
    this.add_token(TokenType.NUMBER, number_value);
  }
  private peek_next(): string {
    if (this.current + 1 >= this.source.length) {
      return "\0";
    }
    return this.source[this.current + 1];
  }
  private advance(): string {
    this.current++;
    return this.source[this.current - 1];
  }
  private is_at_end() {
    return this.current >= this.source.length;
  }
  private add_token(
    type?: TokenType | string,
    literal: string | number | null = null,
  ) {
    const text = this.source.slice(this.start, this.current);
    this.tokens.push({
      type,
      lexeme: text,
      literal,
      line: this.line,
    } as Token);
  }
  private match(expected: string): boolean {
    if (this.is_at_end()) {
      return false;
    }
    if (this.source[this.current] != expected) {
      return false;
    }
    this.current++;
    return true;
  }
  private operator_slash() {
    if (this.match("/")) { // We got a comment
      // Go to the end of the line
      while (this.peek() != "\n" && !this.is_at_end()) {
        this.advance();
      }
    } else {
      this.add_token(TokenType.SLASH);
    }
  }
  private operator_newline() {
    this.line += 1;
  }
  private peek(): string {
    return this.is_at_end() ? "\0" : this.source[this.current];
  }
  private string() {
    while (this.peek() != '"' && !this.is_at_end()) {
      if (this.peek() == "\n") {
        this.line++;
      }
      this.advance();
    }
    if (this.is_at_end()) {
      // Unterminated string
      this.on_error(this.line, "Unterminated String");
      return;
    }

    // Advance past the "
    this.advance();

    const string_value = this.source.slice(this.start + 1, this.current - 1);
    this.add_token(TokenType.STRING, string_value);
  }
  private isNumber(str: string): boolean {
    if (typeof str !== "string") {
      return false;
    }

    if (str.trim() === "") {
      return false;
    }

    return !Number.isNaN(Number(str));
  }
  private isAlpha(str: string): boolean {
    return str >= "a" && str <= "z" || str >= "A" && str <= "Z";
  }
  private isAlphaNum(char: string): boolean {
    return this.isNumber(char) || this.isAlpha(char);
  }
}
