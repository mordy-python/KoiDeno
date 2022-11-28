import { TokenType } from './token_type.ts'

export class Token {
	type: TokenType;
	lexeme: string;
	literal: string | null;
	line: Number;
	constructor(type: TokenType, lexeme: string, literal: string, line: Number) {
		this.type = type;
		this.lexeme = lexeme;
		this.literal = literal;
		this.line = line;
	}
	toString() {
		const literal = this.literal ? this.literal : '';
		return `(${TokenType[this.type]}, ${this.lexeme.toString()}, ${literal})`
	}
}
