// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var TokenType;
(function(TokenType) {
    TokenType[TokenType["LEFT_PAREN"] = 0] = "LEFT_PAREN";
    TokenType[TokenType["RIGHT_PAREN"] = 1] = "RIGHT_PAREN";
    TokenType[TokenType["LEFT_BRACE"] = 2] = "LEFT_BRACE";
    TokenType[TokenType["RIGHT_BRACE"] = 3] = "RIGHT_BRACE";
    TokenType[TokenType["SEMICOLON"] = 4] = "SEMICOLON";
    TokenType[TokenType["COMMA"] = 5] = "COMMA";
    TokenType[TokenType["DOT"] = 6] = "DOT";
    TokenType[TokenType["MINUS"] = 7] = "MINUS";
    TokenType[TokenType["PLUS"] = 8] = "PLUS";
    TokenType[TokenType["STAR"] = 9] = "STAR";
    TokenType[TokenType["SLASH"] = 10] = "SLASH";
    TokenType[TokenType["MOD"] = 11] = "MOD";
    TokenType[TokenType["BANG"] = 12] = "BANG";
    TokenType[TokenType["BANG_EQUAL"] = 13] = "BANG_EQUAL";
    TokenType[TokenType["EQUAL"] = 14] = "EQUAL";
    TokenType[TokenType["EQUAL_EQUAL"] = 15] = "EQUAL_EQUAL";
    TokenType[TokenType["GREATER"] = 16] = "GREATER";
    TokenType[TokenType["GREATER_EQUAL"] = 17] = "GREATER_EQUAL";
    TokenType[TokenType["LESS"] = 18] = "LESS";
    TokenType[TokenType["LESS_EQUAL"] = 19] = "LESS_EQUAL";
    TokenType[TokenType["IDENTIFIER"] = 20] = "IDENTIFIER";
    TokenType[TokenType["STRING"] = 21] = "STRING";
    TokenType[TokenType["NUMBER"] = 22] = "NUMBER";
    TokenType[TokenType["AND"] = 23] = "AND";
    TokenType[TokenType["OR"] = 24] = "OR";
    TokenType[TokenType["NOT"] = 25] = "NOT";
    TokenType[TokenType["TRUE"] = 26] = "TRUE";
    TokenType[TokenType["FALSE"] = 27] = "FALSE";
    TokenType[TokenType["NIL"] = 28] = "NIL";
    TokenType[TokenType["IF"] = 29] = "IF";
    TokenType[TokenType["ELSE"] = 30] = "ELSE";
    TokenType[TokenType["CLASS"] = 31] = "CLASS";
    TokenType[TokenType["FUN"] = 32] = "FUN";
    TokenType[TokenType["FOR"] = 33] = "FOR";
    TokenType[TokenType["WHILE"] = 34] = "WHILE";
    TokenType[TokenType["PRINT"] = 35] = "PRINT";
    TokenType[TokenType["RETURN"] = 36] = "RETURN";
    TokenType[TokenType["SUPER"] = 37] = "SUPER";
    TokenType[TokenType["THIS"] = 38] = "THIS";
    TokenType[TokenType["VAR"] = 39] = "VAR";
    TokenType[TokenType["EOF"] = 40] = "EOF";
})(TokenType || (TokenType = {}));
class Scanner {
    source;
    tokens;
    start = 0;
    line = 0;
    current = 0;
    keywords = new Map();
    on_error;
    constructor(source, on_error){
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
        this.keywords.set("return", TokenType.RETURN);
        this.keywords.set("super", TokenType.SUPER);
        this.keywords.set("this", TokenType.THIS);
        this.keywords.set("var", TokenType.VAR);
        this.on_error = on_error;
    }
    scan_tokens() {
        while(!this.is_at_end()){
            this.start = this.current;
            this.tokenize();
        }
        this.tokens.push({
            type: TokenType.EOF,
            lexeme: "",
            literal: null,
            line: this.line
        });
        return this.tokens;
    }
    tokenize() {
        const __char = this.advance();
        switch(__char){
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
            case "-":
                this.add_token(TokenType.MINUS);
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
                this.add_token(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case "=":
                this.add_token(this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case "<":
                this.add_token(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case ">":
                this.add_token(this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER);
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
                if (this.isNumber(__char)) {
                    this.number();
                } else if (this.isAlpha(__char) || __char == "_") {
                    this.identifier();
                } else {
                    this.on_error(this.line, `Unexpected character: ${__char}`);
                    Deno.exit(1);
                }
        }
    }
    identifier() {
        while(this.isAlphaNum(this.peek()) || this.peek() == "_"){
            this.advance();
        }
        const text = this.source.slice(this.start, this.current);
        const type = this.keywords.has(text) ? this.keywords.get(text) : TokenType.IDENTIFIER;
        this.add_token(type, text);
    }
    number() {
        while(this.isNumber(this.peek())){
            this.advance();
        }
        if (this.peek() == "." && this.isNumber(this.peek_next())) {
            this.advance();
            while(this.isNumber(this.peek())){
                this.advance();
            }
        }
        const value = this.source.slice(this.start, this.current);
        const number_value = value.includes(".") ? parseFloat(value) : parseInt(value);
        this.add_token(TokenType.NUMBER, number_value);
    }
    peek_next() {
        if (this.current + 1 >= this.source.length) {
            return "\0";
        }
        return this.source[this.current + 1];
    }
    advance() {
        this.current++;
        return this.source[this.current - 1];
    }
    is_at_end() {
        return this.current >= this.source.length;
    }
    add_token(type, literal = null) {
        const text = this.source.slice(this.start, this.current);
        this.tokens.push({
            type,
            lexeme: text,
            literal,
            line: this.line
        });
    }
    match(expected) {
        if (this.is_at_end()) {
            return false;
        }
        if (this.source[this.current] != expected) {
            return false;
        }
        this.current++;
        return true;
    }
    operator_slash() {
        if (this.match("/")) {
            while(this.peek() != "\n" && !this.is_at_end()){
                this.advance();
            }
        } else {
            this.add_token(TokenType.SLASH);
        }
    }
    operator_newline() {
        this.line += 1;
    }
    peek() {
        return this.is_at_end() ? "\0" : this.source[this.current];
    }
    string() {
        while(this.peek() != '"' && !this.is_at_end()){
            if (this.peek() == "\n") {
                this.line++;
            }
            this.advance();
        }
        if (this.is_at_end()) {
            this.on_error(this.line, "Unterminated String");
            return;
        }
        this.advance();
        const string_value = this.source.slice(this.start + 1, this.current - 1);
        this.add_token(TokenType.STRING, string_value);
    }
    isNumber(str) {
        if (typeof str !== "string") {
            return false;
        }
        if (str.trim() === "") {
            return false;
        }
        return !Number.isNaN(Number(str));
    }
    isAlpha(str) {
        return str >= "a" && str <= "z" || str >= "A" && str <= "Z";
    }
    isAlphaNum(__char) {
        return this.isNumber(__char) || this.isAlpha(__char);
    }
}
class Expr {
    accept(_visitor) {
        throw "Not Implemented";
    }
}
class Assign extends Expr {
    name;
    value;
    constructor(name, value){
        super();
        this.name = name;
        this.value = value;
    }
    accept(visitor) {
        return visitor.visit_assign_expr(this);
    }
}
class Binary extends Expr {
    op;
    left;
    right;
    constructor(left, op, right){
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }
    accept(visitor) {
        return visitor.visit_binary_expr(this);
    }
}
class Call extends Expr {
    callee;
    paren;
    args;
    constructor(callee, paren, args){
        super();
        this.callee = callee;
        this.paren = paren;
        this.args = args;
    }
    accept(visitor) {
        return visitor.visit_call_expr(this);
    }
}
class Get extends Expr {
    obj;
    name;
    constructor(obj, name){
        super();
        this.obj = obj;
        this.name = name;
    }
    accept(visitor) {
        return visitor.visit_get_expr(this);
    }
}
class Grouping extends Expr {
    expression;
    constructor(expression){
        super();
        this.expression = expression;
    }
    accept(_visitor) {
        return _visitor.visit_grouping_expr(this);
    }
}
class Literal extends Expr {
    value;
    constructor(value){
        super();
        this.value = value;
    }
    accept(_visitor) {
        return _visitor.visit_literal_expr(this);
    }
}
class Logical extends Expr {
    left;
    op;
    right;
    constructor(left, op, right){
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }
    accept(_visitor) {
        return _visitor.visit_logical_expr(this);
    }
}
class Set extends Expr {
    obj;
    name;
    value;
    constructor(obj, name, value){
        super();
        this.obj = obj;
        this.name = name;
        this.value = value;
    }
    accept(_visitor) {
        return _visitor.visit_set_expr(this);
    }
}
class Super extends Expr {
    keyword;
    method;
    constructor(keyword, method){
        super();
        this.keyword = keyword;
        this.method = method;
    }
    accept(_visitor) {
        return _visitor.visit_super_expr(this);
    }
}
class This extends Expr {
    keyword;
    constructor(keyword){
        super();
        this.keyword = keyword;
    }
    accept(_visitor) {
        return _visitor.visit_this_expr(this);
    }
}
class Unary extends Expr {
    operator;
    right;
    constructor(operator, right){
        super();
        this.operator = operator;
        this.right = right;
    }
    accept(_visitor) {
        return _visitor.visit_unary_expr(this);
    }
}
class Variable extends Expr {
    name;
    constructor(name){
        super();
        this.name = name;
    }
    accept(_visitor) {
        return _visitor.visit_variable_expr(this);
    }
}
class Stmt {
    accept(visitor) {
        throw "Not Implemented";
    }
}
class Block extends Stmt {
    stmts;
    constructor(stmts){
        super();
        this.stmts = stmts;
    }
    accept(visitor) {
        return visitor.visit_block_stmt(this);
    }
}
class Class extends Stmt {
    name;
    methods;
    superclass;
    constructor(name, methods, superclass){
        super();
        this.name = name;
        this.methods = methods;
        this.superclass = superclass;
    }
    accept(visitor) {
        return visitor.visit_class_stmt(this);
    }
}
class Expression extends Stmt {
    expression;
    constructor(expression){
        super();
        this.expression = expression;
    }
    accept(visitor) {
        return visitor.visit_expression_stmt(this);
    }
}
class Function extends Stmt {
    name;
    params;
    body;
    constructor(name, params, body){
        super();
        this.name = name;
        this.params = params;
        this.body = body;
    }
    accept(visitor) {
        return visitor.visit_function_stmt(this);
    }
}
class If extends Stmt {
    condition;
    then_branch;
    else_branch;
    constructor(condition, then_branch, else_branch){
        super();
        this.condition = condition;
        this.then_branch = then_branch;
        this.else_branch = else_branch;
    }
    accept(visitor) {
        return visitor.visit_if_stmt(this);
    }
}
class Return extends Stmt {
    keyword;
    value;
    constructor(keyword, value){
        super();
        this.keyword = keyword;
        this.value = value;
    }
    accept(visitor) {
        return visitor.visit_return_stmt(this);
    }
}
class Var extends Stmt {
    name;
    initializer;
    constructor(name, initializer){
        super();
        this.name = name;
        this.initializer = initializer;
    }
    accept(visitor) {
        return visitor.visit_var_stmt(this);
    }
}
class While extends Stmt {
    condition;
    body;
    constructor(condition, body){
        super();
        this.condition = condition;
        this.body = body;
    }
    accept(visitor) {
        return visitor.visit_while_stmt(this);
    }
}
class ParseError extends SyntaxError {
}
class Parser {
    tokens;
    on_error;
    current;
    constructor(tokens, on_error){
        this.tokens = tokens;
        this.on_error = on_error;
        this.current = 0;
    }
    parse() {
        const stmts = [];
        while(!this.is_at_end()){
            stmts.push(this.declaration());
        }
        return stmts;
    }
    declaration() {
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
    statement() {
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
    return_statement() {
        const keyword = this.previous();
        let value;
        if (!this.check(TokenType.SEMICOLON)) {
            value = this.expression();
        }
        this.consume(TokenType.SEMICOLON, "Expect ';' after return value");
        return new Return(keyword, value);
    }
    for_statement() {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' in for loop declaration");
        let initializer;
        let condition;
        let increment;
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
        this.consume(TokenType.SEMICOLON, "Expected semicolon after loop condition");
        if (!this.check(TokenType.RIGHT_PAREN)) {
            increment = this.expression();
        }
        this.consume(TokenType.RIGHT_PAREN, "Expected ')' after for loop initialization");
        let body = this.statement();
        if (increment != null || increment != undefined) {
            body = new Block([
                body,
                new Expression(increment)
            ]);
        }
        if (condition == null || condition == undefined) {
            condition = new Literal(true);
        }
        body = new While(condition, body);
        if (initializer != null || initializer != undefined) {
            body = new Block([
                initializer,
                body
            ]);
        }
        return body;
    }
    while_statement() {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after while keyword");
        const condition = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after while condition");
        this.statement();
        return new While(condition, this.statement());
    }
    if_statement() {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after if keyword");
        const condition = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition");
        const then_branch = this.statement();
        let else_branch;
        if (this.match(TokenType.ELSE)) {
            else_branch = this.statement();
        }
        return new If(condition, then_branch, else_branch);
    }
    expression_statement() {
        const expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after value");
        return new Expression(expr);
    }
    expression() {
        return this.assignment();
    }
    assignment() {
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
    or() {
        let expr = this.and();
        while(this.match(TokenType.OR)){
            const op = this.previous();
            const right = this.and();
            expr = new Logical(expr, op, right);
        }
        return expr;
    }
    and() {
        let expr = this.equality();
        while(this.match(TokenType.AND)){
            const op = this.previous();
            const right = this.equality();
            expr = new Logical(expr, op, right);
        }
        return expr;
    }
    equality() {
        let expr = this.comparison();
        while(this.match(TokenType.BANG, TokenType.BANG_EQUAL)){
            const op = this.previous();
            const right = this.comparison();
            expr = new Binary(expr, op, right);
        }
        return expr;
    }
    comparison() {
        let expr = this.term();
        while(this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL, TokenType.EQUAL_EQUAL)){
            const op = this.previous();
            const right = this.term();
            expr = new Binary(expr, op, right);
        }
        return expr;
    }
    term() {
        let expr = this.factor();
        while(this.match(TokenType.MINUS, TokenType.PLUS)){
            const op = this.previous();
            const right = this.factor();
            expr = new Binary(expr, op, right);
        }
        return expr;
    }
    factor() {
        let expr = this.unary();
        while(this.match(TokenType.SLASH, TokenType.STAR, TokenType.MOD)){
            const op = this.previous();
            const right = this.unary();
            expr = new Binary(expr, op, right);
        }
        return expr;
    }
    unary() {
        if (this.match(TokenType.BANG_EQUAL, TokenType.MINUS)) {
            const op = this.previous();
            const right = this.unary();
            return new Unary(op, right);
        }
        return this.call();
    }
    call() {
        let expr = this.primary();
        while(true){
            if (this.match(TokenType.LEFT_PAREN)) {
                expr = this.finish_call(expr);
            } else if (this.match(TokenType.DOT)) {
                const name = this.consume(TokenType.IDENTIFIER, "Expected valid property name following '.'");
                expr = new Get(expr, name);
            } else {
                break;
            }
        }
        return expr;
    }
    finish_call(callee) {
        const args = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                args.push(this.expression());
            }while (this.match(TokenType.COMMA))
        }
        const paren = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments in call expression");
        return new Call(callee, paren, args);
    }
    primary() {
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
            const method = this.consume(TokenType.IDENTIFIER, "Expected superclass name after '.' in 'super' expression");
            return new Super(keyword, method);
        } else if (this.match(TokenType.LEFT_PAREN)) {
            const expr = this.equality();
            this.consume(TokenType.RIGHT_PAREN, "Expected ')' aqfter expression");
            return new Grouping(expr);
        }
        throw this.error(this.peek(), "Expected expression");
    }
    var_declaration() {
        const name = this.consume(TokenType.IDENTIFIER, "Expected identifier");
        let init_val;
        if (this.match(TokenType.EQUAL)) {
            init_val = this.expression();
        }
        this.consume(TokenType.SEMICOLON, "Expected ';' after variable declaration");
        return new Var(name, init_val);
    }
    class_declaration() {
        const name = this.consume(TokenType.IDENTIFIER, "Expected valid identifier in class name");
        let superclass = undefined;
        if (this.match(TokenType.LESS)) {
            this.consume(TokenType.IDENTIFIER, "Expected valid identifier in superclass name");
            superclass = new Variable(this.previous());
        }
        this.consume(TokenType.LEFT_BRACE, "Expected block after class declaration");
        const methods = [];
        while(!this.check(TokenType.RIGHT_BRACE) && !this.is_at_end()){
            methods.push(this.function("method"));
        }
        this.consume(TokenType.RIGHT_BRACE, "Expected '}' after class body");
        return new Class(name, methods, superclass);
    }
    function(kind) {
        const name = this.consume(TokenType.IDENTIFIER, `Expected ${kind} name`);
        this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name`);
        const params = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            params.push(this.consume(TokenType.IDENTIFIER, `Parameter names must be valid identifiers`));
            while(this.match(TokenType.COMMA)){
                params.push(this.consume(TokenType.IDENTIFIER, `Parameter names must be valid identifiers`));
            }
        }
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after paramter list");
        this.consume(TokenType.LEFT_BRACE, "Expect '{' before " + kind + " body");
        const body = this.block();
        return new Function(name, params, body);
    }
    block() {
        const statements = [];
        while(!this.check(TokenType.RIGHT_BRACE) && !this.is_at_end()){
            statements.push(this.declaration());
        }
        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block");
        return statements;
    }
    consume(type, message) {
        if (this.check(type)) {
            return this.advance();
        }
        throw this.on_error(this.peek(), message);
    }
    match(...types) {
        for (const type of types){
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    advance() {
        if (!this.is_at_end()) {
            this.current++;
        }
        return this.previous();
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    is_at_end() {
        return this.peek().type == TokenType.EOF;
    }
    peek() {
        return this.tokens[this.current];
    }
    check(type) {
        if (this.is_at_end()) {
            return false;
        }
        return this.peek().type == type;
    }
    synchronize() {
        this.advance();
        while(!this.is_at_end()){
            if (this.previous().type == TokenType.SEMICOLON) {
                return;
            }
            switch(this.peek().type){
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
    error(token, message) {
        this.on_error(token, message);
        throw new ParseError(token.line + " " + message);
    }
}
class Environment {
    parent;
    values;
    constructor(parent){
        this.parent = parent;
        this.values = new Map();
    }
    define(name, value) {
        this.values.set(name, value);
    }
    get(name) {
        if (this.values.has(name.lexeme)) {
            return this.values.get(name.lexeme);
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw `Undefined name: "${name.lexeme}"`;
    }
    assign(name, value) {
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
    get_at(distance, name) {
        return this.ancestor(distance).values.get(name);
    }
    ancestor(distance) {
        let env = this;
        for (const _ of [
            ...Array(distance)
        ].map((_, i)=>0 + i * 1)){
            env = env.parent;
        }
        return env;
    }
    assign_at(distance, name, value) {
        this.ancestor(distance).assign(name, value);
    }
}
class KoiInstance {
    klass;
    fields;
    constructor(klass){
        this.klass = klass;
        this.fields = new Map();
    }
    toString() {
        return `<instance of class ${this.klass.constructor.name}`;
    }
    get(name) {
        if (this.fields.has(name.lexeme)) {
            return this.fields.get(name.lexeme);
        }
        const method = this.klass.find_method(name.lexeme);
        if (method) {
            return method.bind(this);
        }
        throw `Undefined property "${name.lexeme}"`;
    }
    set(name, value) {
        this.fields.set(name.lexeme, value);
    }
}
class KoiCallable {
    arity() {
        throw "Not Implemented";
    }
    call(interpreter, args) {
        throw "Not Implemented";
    }
}
class KoiClass extends KoiCallable {
    name;
    superclass;
    methods;
    constructor(name, methods, superclass){
        super();
        this.name = name;
        this.superclass = superclass;
        this.methods = methods;
    }
    find_method(name) {
        if (this.methods.has(name)) {
            return this.methods.get(name);
        } else {
            if (this.superclass) {
                return this.superclass.find_method(name);
            } else {
                return null;
            }
        }
    }
    toString() {
        return `<class "${this.constructor.name}">`;
    }
    call(interpreter, args) {
        const instance = new KoiInstance(this);
        const initializer = this.find_method("init");
        if (initializer) {
            initializer.bind(instance).call(interpreter, args);
        }
        return instance;
    }
    arity() {
        const initializer = this.find_method("init");
        if (initializer) {
            return initializer.arity();
        }
        return 0;
    }
}
class KoiReturnError extends Error {
    value;
    constructor(value){
        super(undefined, undefined);
        this.value = value;
    }
}
function minOf(array, selector) {
    let minimumValue = undefined;
    for (const i of array){
        const currentValue = selector(i);
        if (minimumValue === undefined || currentValue < minimumValue) {
            minimumValue = currentValue;
            continue;
        }
        if (Number.isNaN(currentValue)) {
            return currentValue;
        }
    }
    return minimumValue;
}
function zip(...arrays) {
    const minLength = minOf(arrays, (it)=>it.length) ?? 0;
    const ret = new Array(minLength);
    for(let i = 0; i < minLength; i += 1){
        const arr = arrays.map((it)=>it[i]);
        ret[i] = arr;
    }
    return ret;
}
class KoiFunction extends KoiCallable {
    decl;
    closure;
    is_initializer;
    constructor(declaration, closure, is_initializer){
        super();
        this.decl = declaration;
        this.closure = closure;
        this.is_initializer = is_initializer;
    }
    call(interpreter, args) {
        const env = new Environment(this.closure);
        for (const token_arg of zip(this.decl.params, args)){
            env.define(token_arg[0].lexeme, token_arg[1]);
        }
        try {
            interpreter.exec_block(this.decl.body, env);
        } catch (error) {
            if (error instanceof KoiReturnError) {
                if (this.is_initializer) {
                    return this.closure.get_at(0, "this");
                }
                return error.value;
            } else {
                console.log(error);
            }
        }
        if (this.is_initializer) {
            return this.closure.get_at(0, "this");
        }
        return null;
    }
    arity() {
        return this.decl.params.length;
    }
    bind(instance) {
        const env = new Environment(this.closure);
        env.define("this", instance);
        return new KoiFunction(this.decl, env, this.is_initializer);
    }
    toString() {
        return `<function ${this.decl.name.lexeme}>`;
    }
}
class KoiRuntimeError {
    token;
    message;
    constructor(token, message){
        this.token = token;
        this.message = message;
    }
}
class Visitor {
    visit_assign_expr(expr) {
        throw "Not Implemented";
    }
    visit_binary_expr(expr) {
        throw "Not Implemented";
    }
    visit_call_expr(expr) {
        throw "Not Implemented";
    }
    visit_get_expr(expr) {
        throw "Not Implemented";
    }
    visit_grouping_expr(expr) {
        throw "Not Implemented";
    }
    visit_literal_expr(expr) {
        throw "Not Implemented";
    }
    visit_logical_expr(expr) {
        throw "Not Implemented";
    }
    visit_set_expr(expr) {
        throw "Not Implemented";
    }
    visit_super_expr(expr) {
        throw "Not Implemented";
    }
    visit_this_expr(expr) {
        throw "Not Implemented";
    }
    visit_unary_expr(expr) {
        throw "Not Implemented";
    }
    visit_variable_expr(expr) {
        throw "Not Implemented";
    }
    visit_block_stmt(stmt) {
        throw "Not Implemented";
    }
    visit_class_stmt(stmt) {
        throw "Not Implemented";
    }
    visit_expression_stmt(stmt) {
        throw "Not Implemented";
    }
    visit_function_stmt(stmt) {
        throw "Not Implemented";
    }
    visit_if_stmt(stmt) {
        throw "Not Implemented";
    }
    visit_print_stmt(stmt) {
        throw "Not Implemented";
    }
    visit_return_stmt(stmt) {
        throw "Not Implemented";
    }
    visit_var_stmt(stmt) {
        throw "Not Implemented";
    }
    visit_while_stmt(stmt) {
        throw "Not Implemented";
    }
}
class Clock extends KoiCallable {
    arity() {
        return 0;
    }
    call(_interpreter, _args) {
        return Date.now() / 1000;
    }
    toString() {
        return "<native function clock>";
    }
}
class Input extends KoiCallable {
    arity() {
        return 1;
    }
    call(_interpreter, args) {
        return prompt(args[0]);
    }
    toString() {
        return "<native function input>";
    }
}
class Print extends KoiCallable {
    arity() {
        return 1;
    }
    call(_interpreter, args) {
        console.log(args[0]);
    }
    toString() {
        return "<native function print>";
    }
}
class Println extends KoiCallable {
    arity() {
        return 1;
    }
    call(_interpreter, args) {
        console.log(args[0] + "\n");
    }
    toString() {
        return "<native function println>";
    }
}
class Interpreter extends Visitor {
    globals;
    env;
    locals;
    constructor(){
        super();
        this.globals = new Environment();
        this.env = this.globals;
        this.locals = new Map();
        this.globals.define("clock", new Clock());
        this.globals.define("input", new Input());
        this.globals.define("print", new Print());
        this.globals.define("println", new Println());
    }
    interpret(statements) {
        try {
            for (const stmt of statements){
                this.execute(stmt);
            }
        } catch (error) {
            console.log(error);
            Deno.exit(1);
        }
    }
    execute(statement) {
        return statement.accept(this);
    }
    evaluate(expr) {
        return expr.accept(this);
    }
    stringify(value) {
        if (value == null || value == undefined) {
            return "nil";
        } else if (value == true) {
            return "true";
        } else if (value == false) {
            return "false";
        } else if (value instanceof Number) {
            return value.toString();
        }
        return value.toString();
    }
    visit_literal_expr(expr) {
        return expr.value;
    }
    visit_grouping_expr(expr) {
        return this.evaluate(expr.expression);
    }
    visit_unary_expr(expr) {
        const right = this.evaluate(expr.right);
        if (expr.operator.type == TokenType.MINUS) {
            this.check_number_operand(expr.operator, right);
            return 0 - right;
        } else if (expr.operator.type == TokenType.BANG) {
            return !this.is_truthy(right);
        }
        return null;
    }
    visit_binary_expr(expr) {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);
        switch(expr.op.type){
            case TokenType.MINUS:
                this.check_number_operands(expr.op, left, right);
                return left - right;
            case TokenType.MOD:
                this.check_number_operands(expr.op, left, right);
                return left % right;
            case TokenType.PLUS:
                if (left instanceof Number && right instanceof Number) {
                    return left + right;
                }
                return left + right;
            case TokenType.SLASH:
                if (right == 0) {
                    throw new KoiRuntimeError(right, `Cannor divide ${left} by zero`);
                }
                this.check_number_operands(expr.op, left, right);
                return left / right;
            case TokenType.STAR:
                this.check_number_operands(expr.op, left, right);
                return left * right;
            case TokenType.GREATER:
                this.check_number_operands(expr.op, left, right);
                return left > right;
            case TokenType.GREATER_EQUAL:
                this.check_number_operands(expr.op, left, right);
                return left >= right;
            case TokenType.LESS:
                this.check_number_operands(expr.op, left, right);
                return left < right;
            case TokenType.LESS_EQUAL:
                this.check_number_operands(expr.op, left, right);
                return left <= right;
            case TokenType.BANG_EQUAL:
                return !this.is_equal(left, right);
            case TokenType.EQUAL_EQUAL:
                return this.is_equal(left, right);
        }
        return null;
    }
    visit_expression_stmt(stmt) {
        this.evaluate(stmt.expression);
        return null;
    }
    visit_assign_expr(expr) {
        const value = this.evaluate(expr.value);
        const distance = this.locals.get(expr);
        if (distance) {
            this.env.assign_at(distance, expr.name, value);
        } else {
            this.globals.assign(expr.name, value);
        }
        return value;
    }
    visit_block_stmt(stmt) {
        this.exec_block(stmt.stmts, new Environment(this.env));
        return null;
    }
    visit_call_expr(expr) {
        const fn = this.evaluate(expr.callee);
        const args = [];
        for (const arg of expr.args){
            args.push(this.evaluate(arg));
        }
        if (!(fn instanceof KoiCallable)) {
            throw new KoiRuntimeError(expr.paren, `Can only call functions and classes`);
        }
        const arity = fn.arity();
        const arg_len = args.length;
        if (arg_len != arity) {
            throw new KoiRuntimeError(expr.paren, `Expected ${arity} argument${arity > 1 ? "s" : ""} but got ${arg_len}`);
        }
        return fn.call(this, args);
    }
    visit_var_stmt(stmt) {
        let value = null;
        if (stmt.initializer) {
            value = this.evaluate(stmt.initializer);
        }
        this.env.define(stmt.name.lexeme, value);
        return null;
    }
    visit_class_stmt(stmt) {
        let superclass;
        if (stmt.superclass) {
            superclass = this.evaluate(stmt.superclass);
            if (!(superclass instanceof KoiClass)) {
                throw new KoiRuntimeError(stmt.superclass.name, "Superclass must be a class");
            }
        }
        this.env.define(stmt.name.lexeme, null);
        if (stmt.superclass) {
            this.env = new Environment(this.env);
            this.env.define("super", superclass);
        }
        const methods = new Map();
        for (const method of stmt.methods){
            const fn = new KoiFunction(method, this.env, method.name.lexeme == "init");
            methods.set(method.name.lexeme, fn);
        }
        const klass = new KoiClass(stmt.name.lexeme, methods, superclass);
        if (superclass) {
            this.env = this.env.parent;
        }
        this.env.assign(stmt.name, klass);
    }
    visit_super_expr(expr) {
        const distance = this.locals.get(expr);
        const superclass = this.env.get_at(distance, "super");
        const this_ = this.env.get_at(distance - 1, "this");
        const method = superclass.find_method(expr.method.lexeme);
        if (method == null) {
            throw new KoiRuntimeError(expr.method, `Undefined property "${expr.method.lexeme}" on class ${superclass.name}`);
        }
        return method.bind(this_);
    }
    visit_this_expr(expr) {
        return this.lookup_variable(expr.keyword, expr);
    }
    visit_variable_expr(expr) {
        return this.lookup_variable(expr.name, expr);
    }
    visit_function_stmt(stmt) {
        const fn = new KoiFunction(stmt, this.env, false);
        this.env.define(stmt.name.lexeme, fn);
        return null;
    }
    visit_get_expr(expr) {
        const obj = this.evaluate(expr.obj);
        if (obj instanceof KoiInstance) {
            return obj.get(expr.name);
        }
        throw new KoiRuntimeError(expr.name, "Can only access properties from a class instance");
    }
    visit_if_stmt(stmt) {
        if (this.is_truthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.then_branch);
        } else if (stmt.else_branch) {
            this.execute(stmt.else_branch);
        }
        return null;
    }
    visit_return_stmt(stmt) {
        let value;
        if (stmt.value) {
            value = this.evaluate(stmt.value);
        }
        throw new KoiReturnError(value);
    }
    visit_set_expr(expr) {
        const obj = this.evaluate(expr.obj);
        if (!(obj instanceof KoiInstance)) {
            throw new KoiRuntimeError(expr.name, "Can only set properties on class instances");
        }
        const value = this.evaluate(expr.value);
        obj.set(expr.name, value);
        return value;
    }
    visit_logical_expr(expr) {
        const left = this.evaluate(expr.left);
        if (expr.op.type == TokenType.OR) {
            if (this.is_truthy(left)) {
                return left;
            }
        } else {
            if (!this.is_truthy(left)) {
                return left;
            }
        }
        return this.evaluate(expr.right);
    }
    visit_while_stmt(stmt) {
        while(this.is_truthy(this.evaluate(stmt.condition))){
            this.execute(stmt.body);
        }
        return null;
    }
    resolve(expr, depth) {
        this.locals.set(expr, depth);
    }
    check_number_operand(operator, operand) {
        if (operand instanceof Number) {
            return;
        }
        throw new KoiRuntimeError(operator, `Operand ${operand} must be a number`);
    }
    check_number_operands(operator, left, right) {
        if (left instanceof Number && right instanceof Number) {
            return;
        }
        throw new KoiRuntimeError(operator, `Both operands must be numbers`);
    }
    is_truthy(object) {
        if (!object) {
            return false;
        } else if (object instanceof Boolean) {
            return object;
        }
        return true;
    }
    is_equal(left, right) {
        if (left == null && right == null) {
            return true;
        } else if (left == null) {
            return false;
        }
        return left == right;
    }
    exec_block(statements, env) {
        const previous = this.env;
        try {
            this.env = env;
            for (const stmt of statements){
                this.execute(stmt);
            }
        } finally{
            this.env = previous;
        }
    }
    lookup_variable(name, expr) {
        const distance = this.locals.get(expr);
        if (distance != null) {
            return this.env.get_at(distance, name.lexeme);
        } else {
            return this.globals.get(name);
        }
    }
}
var FunctionType;
(function(FunctionType) {
    FunctionType[FunctionType["NONE"] = 0] = "NONE";
    FunctionType[FunctionType["FUNCTION"] = 1] = "FUNCTION";
    FunctionType[FunctionType["INITIALIZER"] = 2] = "INITIALIZER";
    FunctionType[FunctionType["METHOD"] = 3] = "METHOD";
})(FunctionType || (FunctionType = {}));
var ClassType;
(function(ClassType) {
    ClassType[ClassType["NONE"] = 0] = "NONE";
    ClassType[ClassType["CLASS"] = 1] = "CLASS";
    ClassType[ClassType["SUBCLASS"] = 2] = "SUBCLASS";
})(ClassType || (ClassType = {}));
class Deque {
    #head = 0;
    #tail = 0;
    #capacityMask = 0b11;
    #list = new Array(this.#capacityMask + 1);
    get capacity() {
        return this.#list.length;
    }
    get length() {
        return this.#head <= this.#tail ? this.#tail - this.#head : this.#capacityMask + 1 - (this.#head - this.#tail);
    }
    get empty() {
        return this.#head === this.#tail;
    }
    get front() {
        return this.at(0);
    }
    get back() {
        return this.at(-1);
    }
    clear() {
        this.#head = this.#tail = 0;
    }
    unshift(item) {
        const len = this.#list.length;
        this.#head = this.#head - 1 + len & this.#capacityMask;
        this.#list[this.#head] = item;
        if (this.#tail === this.#head) this.#growArray();
        if (this.#head < this.#tail) return this.#tail - this.#head;
        return this.#capacityMask + 1 - (this.#head - this.#tail);
    }
    shift() {
        if (this.empty) return;
        const head = this.#head;
        const item = this.#list[head];
        this.#list[head] = undefined;
        this.#head = head + 1 & this.#capacityMask;
        if (head < 2 && this.#tail > 10000 && this.#tail <= this.#list.length >>> 2) this.#shrinkArray();
        return item;
    }
    push(item) {
        const tail = this.#tail;
        this.#list[tail] = item;
        this.#tail = tail + 1 & this.#capacityMask;
        if (this.empty) this.#growArray();
        if (this.#head < this.#tail) return this.#tail - this.#head;
        return this.#capacityMask + 1 - (this.#head - this.#tail);
    }
    pop() {
        if (this.empty) return;
        const tail = this.#tail;
        const len = this.#list.length;
        this.#tail = tail - 1 + len & this.#capacityMask;
        const item = this.#list[this.#tail];
        this.#list[this.#tail] = undefined;
        if (this.#head < 2 && tail > 10000 && tail <= len >>> 2) this.#shrinkArray();
        return item;
    }
    at(index) {
        const len = this.length;
        if (index >= len || index < -len) return;
        if (index < 0) index += len;
        index = this.#head + index & this.#capacityMask;
        return this.#list[index];
    }
    *[Symbol.iterator]() {
        const head = this.#head;
        const tail = this.#tail;
        if (head <= tail) {
            for(let i = head; i < tail; ++i)yield this.#list[i];
            return;
        }
        const capacity = this.capacity;
        for(let i1 = head; i1 < capacity; ++i1)yield this.#list[i1];
        for(let i2 = 0; i2 < tail; ++i2)yield this.#list[i2];
    }
    #shrinkArray() {
        this.#list.length >>>= 1;
        this.#capacityMask >>>= 1;
    }
    #growArray() {
        if (this.#head > 0) {
            const deleted = this.#list.splice(this.#head);
            deleted.push(...this.#list);
            this.#tail -= this.#head;
            this.#head = 0;
            this.#list = deleted;
        }
        this.#tail = this.#list.length;
        this.#list.length *= 2;
        this.#capacityMask = this.#capacityMask << 1 | 1;
    }
}
class Resolver extends Visitor {
    interpreter;
    scopes;
    on_error;
    current_function;
    current_class;
    constructor(interpreter, on_error){
        super();
        this.interpreter = interpreter;
        this.scopes = new Deque();
        this.on_error = on_error;
        this.current_function = FunctionType.NONE;
        this.current_class = ClassType.NONE;
    }
    begin_scope() {
        this.scopes.push(new Map());
    }
    end_scope() {
        this.scopes.pop();
    }
    resolve(stmts) {
        this.resolve_statements(stmts);
    }
    resolve_statements(stmts) {
        if (!(stmts instanceof Array)) {
            stmts = [
                stmts
            ];
        }
        for (const stmt of stmts){
            this.resolve_statement(stmt);
        }
    }
    resolve_statement(stmt) {
        stmt.accept(this);
    }
    resolve_expression(expr) {
        return expr.accept(this);
    }
    resolve_local(expr, name) {
        Array.from(this.scopes).reverse().map((scope, index)=>{
            if (scope?.has(name.lexeme)) {
                this.interpreter.resolve(expr, index);
                return;
            }
        });
    }
    resolve_function(fn, type) {
        const enclosing = this.current_function;
        this.current_function = type;
        this.begin_scope();
        for (const param of fn.params){
            this.declare(param);
            this.define(param);
        }
        this.resolve_statements(fn.body);
        this.end_scope();
        this.current_function = enclosing;
    }
    declare(name) {
        if (this.scopes.length == 0) {
            return;
        }
        const scope = this.scopes.back;
        if (scope?.has(name.lexeme)) {
            this.on_error(name, `Variable with name "${name}" already exists in this scope`);
        }
        scope?.set(name.lexeme, false);
    }
    define(name) {
        if (this.scopes.length == 0) {
            return;
        }
        const scope = this.scopes.back;
        scope?.set(name.lexeme, true);
    }
    visit_var_stmt(stmt) {
        this.declare(stmt.name);
        if (stmt.initializer) {
            this.resolve_expression(stmt.initializer);
        }
        this.define(stmt.name);
        return null;
    }
    visit_variable_expr(expr) {
        if (this.scopes.length != 0 && this.scopes.back?.get(expr.name.lexeme) == false) {
            this.on_error(expr.name, "Cannot read variable in it's own initializer");
        }
        this.resolve_local(expr, expr.name);
    }
    visit_assign_expr(expr) {
        this.resolve_expression(expr.value);
        this.resolve_local(expr, expr.name);
    }
    visit_function_stmt(stmt) {
        this.declare(stmt.name);
        this.define(stmt.name);
        this.resolve_function(stmt, FunctionType.FUNCTION);
    }
    visit_expression_stmt(stmt) {
        this.resolve_expression(stmt.expression);
    }
    visit_if_stmt(stmt) {
        this.resolve_expression(stmt.condition);
        this.resolve_statement(stmt.then_branch);
        if (stmt.else_branch) {
            this.resolve_statement(stmt.else_branch);
        }
    }
    visit_return_stmt(stmt) {
        if (this.current_function == FunctionType.NONE) {
            this.on_error(stmt.keyword, "Cannot use return outside of a function");
        }
        if (stmt.value) {
            if (this.current_function == FunctionType.INITIALIZER) {
                this.on_error(stmt.keyword, "Cannot return a value from an initializer");
            }
            this.resolve_expression(stmt.value);
        }
    }
    visit_while_stmt(stmt) {
        this.resolve_expression(stmt.condition);
        this.resolve_statement(stmt.body);
    }
    visit_binary_expr(expr) {
        this.resolve_expression(expr.left);
        this.resolve_expression(expr.right);
    }
    visit_call_expr(expr) {
        this.resolve_expression(expr.callee);
        for (const arg of expr.args){
            this.resolve_expression(arg);
        }
    }
    visit_grouping_expr(expr) {
        this.resolve_expression(expr.expression);
    }
    visit_literal_expr(_expr) {
        return null;
    }
    visit_logical_expr(expr) {
        this.resolve_expression(expr.left);
        this.resolve_expression(expr.right);
    }
    visit_unary_expr(expr) {
        this.resolve_expression(expr.right);
    }
    visit_set_expr(expr) {
        this.resolve_expression(expr.value);
        this.resolve_expression(expr.obj);
    }
    visit_this_expr(expr) {
        if (this.current_class == ClassType.NONE) {
            this.on_error(expr.keyword, "Cannot use 'this' keyword outside a class");
        }
        this.resolve_local(expr, expr.keyword);
        return null;
    }
    visit_super_expr(expr) {
        if (this.current_class == ClassType.NONE) {
            this.on_error(expr.keyword, "Cannot use 'super' keyword outside a class");
        } else if (this.current_class != ClassType.SUBCLASS) {
            this.on_error(expr.keyword, "Cannot use 'super' keyword in a class with no superclass");
        }
        this.resolve_local(expr, expr.keyword);
    }
    visit_class_stmt(stmt) {
        const enclosing = this.current_class;
        this.current_class = ClassType.CLASS;
        this.declare(stmt.name);
        this.define(stmt.name);
        if (stmt.superclass) {
            if (stmt.name.lexeme == stmt.superclass.name.lexeme) {
                this.on_error(stmt.name, "A class cannot inherit from itself");
            }
            this.current_class = ClassType.SUBCLASS;
            this.resolve_expression(stmt.superclass);
        }
        if (stmt.superclass) {
            this.begin_scope();
            this.scopes.back?.set("super", true);
        }
        this.begin_scope();
        this.scopes.back?.set("this", true);
        for (const method of stmt.methods){
            let decl = FunctionType.METHOD;
            if (method.name.lexeme == "init") {
                decl = FunctionType.INITIALIZER;
            }
            this.resolve_function(method, decl);
        }
        this.end_scope();
        if (stmt.superclass) {
            this.end_scope();
        }
        this.current_class = enclosing;
    }
    visit_get_expr(expr) {
        this.resolve_expression(expr.obj);
        return null;
    }
    visit_block_stmt(stmt) {
        this.begin_scope();
        this.resolve(stmt.stmts);
        this.end_scope();
        return null;
    }
}
class Koi {
    had_error;
    had_runtime_error;
    interpreter;
    constructor(){
        this.had_error = false;
        this.had_runtime_error = false;
        this.interpreter = new Interpreter();
    }
    run(source) {
        const scanner = new Scanner(source, this.scanner_error);
        const tokens = scanner.scan_tokens();
        const parser = new Parser(tokens, this.parse_error);
        const statements = parser.parse();
        if (this.had_error) {
            return;
        }
        const resolver = new Resolver(this.interpreter, (token, message)=>{
            this.report(token.line, token.lexeme, message);
        });
        resolver.resolve(statements);
        if (this.had_error) {
            return;
        }
        this.interpreter.interpret(statements);
    }
    scanner_error(line, message) {
        this.report(line, "", message);
    }
    parse_error(token, message) {
        if (token.type == TokenType.EOF) {
            this.report(token.line, " At end ", message);
        } else {
            this.report(token.line, ` at "${token.lexeme}" `, message);
        }
    }
    runtime_error(error) {
        const message = `"${error.message}" in line [line ${error.token.line}]`;
        console.error(message);
        this.had_runtime_error = true;
    }
    report(line, where, message) {
        message = `[line ${line}] Error ${where} : ${message}`;
        console.error(message);
        this.had_error = true;
    }
    run_file(filename) {
        const lines = Deno.readTextFileSync(filename);
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
        while(true){
            try {
                const line = prompt("> ");
                if (line && line[0] == "\x04") {
                    throw "";
                }
                this.run(line);
                this.had_error = false;
            } catch  {
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
        if (args.length > 1) {
            console.log("Usage: koi [script]");
            Deno.exit(64);
        } else if (args.length == 1) {
            new Koi().run_file(args[0]);
        } else {
            new Koi().repl();
        }
    }
}
new Koi().main();
export { Koi as Koi };
