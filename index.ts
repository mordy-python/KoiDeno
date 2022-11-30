import Scanner from "./src/scanner.ts";

function on_err(line: number, message: string) {
  console.error(`Error on line ${line}`);
  console.error("\t" + message);
}
const code = `
"Hello, World"
123
printer@nae
`;
const s = new Scanner(code, on_err);
console.log(s.scan_tokens());
