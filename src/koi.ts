import Scanner from "./scanner.ts";
import { Parser } from "./parser.ts";
import { Token } from "./token.ts";
import { Interpreter } from "./interpreter.ts";
import { KoiRuntimeError } from "./koi_runtime_error.ts";
import { Resolver } from "./resolver.ts";
import { TokenType } from "./token_type.ts";

class Koi {
  had_error: boolean;
  had_runtime_error: boolean;
  interpreter: Interpreter;
  constructor() {
    this.had_error = false;
    this.had_runtime_error = false;
    this.interpreter = new Interpreter();
  }
  run(source: string) {
    const scanner = new Scanner(source, this.scanner_error);
    const tokens = scanner.scan_tokens();

    const parser = new Parser(tokens, this.parse_error);
    const statements = parser.parse();
    if (this.had_error) {
      return;
    }
    const resolver = new Resolver(
      this.interpreter,
      (token: Token, message: string) => {
        this.report(token.line, token.lexeme, message);
      },
    );
    resolver.resolve(statements);
    if (this.had_error) {
      return;
    }
    this.interpreter.interpret(statements);
  }
  scanner_error(line: number, message: string) {
    this.report(line, "", message);
  }
  parse_error(token: Token, message: string) {
    if (token.type == TokenType.EOF) {
      this.report(token.line, " At end ", message);
    } else {
      this.report(token.line, ` at "${token.lexeme}" `, message);
    }
  }
  runtime_error(error: KoiRuntimeError) {
    const message = `"${error.message}" in line [line ${error.token.line}]`;
    console.error(message);
    this.had_runtime_error = true;
  }
  report(line: number, where: string, message: string) {
    message = `[line ${line}] Error ${where} : ${message}`;
    console.error(message);
    this.had_error = true;
  }
  async run_file(filename: string) {
    const lines = await Deno.readTextFile(filename);
    this.run(lines);

    if (this.had_error) {
      Deno.exit(65);
    } else if (this.had_runtime_error) {
      Deno.exit(70);
    }
  }
  repl() {
    console.log("Koi v2.0");
    console.log("Hit Ctrl+C or Ctrl+D to exit");

    while (true) {
      try {
        const line = prompt("> ");
        if (line && line[0] == "\x04") {
          throw "";
        }
        this.run(<string> line);
        this.had_error = false;
      } catch {
        this.quit();
      }
    }
  }
  quit() {
    console.log("So long and thanks for all the fish");
    Deno.exit(0);
  }
  main() {
    const args = Deno.args;
    console.log(args);
    if (args.length > 1) {
      console.log("Usage: koi [script]");
      Deno.exit(64);
    } else if (args.length == 1) {
      new Koi().run_file(args[1]);
    } else {
      new Koi().repl();
    }
  }
}

new Koi().main();
