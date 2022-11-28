import Scanner from './src/scanner.ts';

function on_err(x: any) {
	console.error(x);
}
var s = new Scanner("hello, (world)", on_err);
console.log(s.scan_tokens());