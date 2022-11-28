import { Token } from './token.ts';
import { TokenType } from './token_type.ts';

export default class Scanner {
	source: string;
	tokens: Array<Token>;
	start: number = 0;
	line: number = 0;
	current: number = 0;
	keywords: Map<string, TokenType> = new Map();
	on_error: Function;
	constructor(source: string, on_error: Function) {
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
				this.add_token(TokenType.LEFT_PAREN)
			default:
				this.advance();
		}
	}
	private advance(): string {
		this.current++;
		return this.source[this.current - 1];
	}
	private is_at_end() {
		return this.current >= this.source.length;
	}
	private add_token(type: TokenType, literal: string | null = null) {
		const text = this.source.slice(this.start, this.current);
		this.tokens.push({
			type,
			lexeme: text,
			literal,
			line: this.line
		} as Token);
	}
}