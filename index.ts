import Scanner from "./src/scanner.ts";
import { Parser, Parser as _Parser } from "./src/parser.ts";
import { Token } from "./src/token.ts";
import { Interpreter } from "./src/interpreter.ts";
// import { TokenType } from "./src/token_type.ts";

function on_err(line: number, message: string) {
  console.error(`Error on line ${line}`);
  console.error("\t" + message);
}
function on_parse_error(token: Token, message: string) {
  // console.log(
  //   token.line,
  //   token.lexeme,
  //   TokenType[token.type] ? TokenType[token.type] : token.type,
  // );
  return " Error on line: " + token.line + "\n\t" + message;
}
const code = `
class printer {
  init() {
    print "printer";
  }
  init1(){
    print "print";
  }
}
`;
const s = new Scanner(code, on_err);
const p = new Parser(s.scan_tokens(), on_parse_error);
const i = new Interpreter();
i.interpret(p.parse());
