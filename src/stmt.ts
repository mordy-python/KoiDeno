// deno-lint-ignore-file no-unused-vars
import { Token } from "./token.ts";
import { Expr, Variable } from "./expr.ts";

export abstract class StmtVisitor {
  visit_block_stmt(stmt: Block) {
    throw "Not Implemented";
  }
  visit_class_stmt(stmt: Class) {
    throw "Not Implemented";
  }
  visit_expression_stmt(stmt: Expression) {
    throw "Not Implemented";
  }
  visit_function_stmt(stmt: Function) {
    throw "Not Implemented";
  }
  visit_if_stmt(stmt: If) {
    throw "Not Implemented";
  }
  // visit_print_stmt(stmt: Print) {
  //   throw "Not Implemented";
  // }
  visit_return_stmt(stmt: Return) {
    throw "Not Implemented";
  }
  visit_var_stmt(stmt: Var) {
    throw "Not Implemented";
  }
  visit_while_stmt(stmt: While) {
    throw "Not Implemented";
  }
}

export abstract class Stmt {
  accept(visitor: StmtVisitor) {
    throw "Not Implemented";
  }
}

export class Block extends Stmt {
  stmts: Array<Stmt>;
  constructor(stmts: Array<Stmt>) {
    super();
    this.stmts = stmts;
  }
  accept(visitor: StmtVisitor) {
    return visitor.visit_block_stmt(this);
  }
}

export class Class extends Stmt {
  name: Token;
  methods: Array<Function>;
  superclass?: Variable;
  constructor(name: Token, methods: Array<Function>, superclass?: Variable) {
    super();
    this.name = name;
    this.methods = methods;
    this.superclass = superclass;
  }
  accept(visitor: StmtVisitor) {
    return visitor.visit_class_stmt(this);
  }
}

export class Expression extends Stmt {
  expression: Expr;
  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }
  accept(visitor: StmtVisitor) {
    return visitor.visit_expression_stmt(this);
  }
}

export class Function extends Stmt {
  name: Token;
  params: Array<Token>;
  body: Array<Stmt>;
  constructor(name: Token, params: Array<Token>, body: Array<Stmt>) {
    super();
    this.name = name;
    this.params = params;
    this.body = body;
  }
  accept(visitor: StmtVisitor) {
    return visitor.visit_function_stmt(this);
  }
}

export class If extends Stmt {
  condition: Expr;
  then_branch: Stmt[];
  else_branch?: Stmt[];
  constructor(condition: Expr, then_branch: Stmt[], else_branch?: Stmt[]) {
    super();
    this.condition = condition;
    this.then_branch = then_branch;
    this.else_branch = else_branch;
  }
  accept(visitor: StmtVisitor) {
    return visitor.visit_if_stmt(this);
  }
}

// export class Print extends Stmt {
//   expression: Expr;
//   constructor(expression: Expr) {
//     super();
//     this.expression = expression;
//   }
//   accept(visitor: StmtVisitor) {
//     return visitor.visit_print_stmt(this);
//   }
// }

export class Return extends Stmt {
  keyword: Token;
  value?: Expr;
  constructor(keyword: Token, value?: Expr) {
    super();
    this.keyword = keyword;
    this.value = value;
  }
  accept(visitor: StmtVisitor) {
    return visitor.visit_return_stmt(this);
  }
}

export class Var extends Stmt {
  name: Token;
  initializer?: Expr;
  constructor(name: Token, initializer?: Expr) {
    super();
    this.name = name;
    this.initializer = initializer;
  }
  accept(visitor: StmtVisitor) {
    return visitor.visit_var_stmt(this);
  }
}

export class While extends Stmt {
  condition: Expr;
  body: Stmt[];
  constructor(condition: Expr, body: Stmt[]) {
    super();
    this.condition = condition;
    this.body = body;
  }
  accept(visitor: StmtVisitor) {
    return visitor.visit_while_stmt(this);
  }
}
