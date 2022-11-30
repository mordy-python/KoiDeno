// deno-lint-ignore-file no-unused-vars
import { Token } from "./token.ts";

export abstract class ExprVisitor {
  visit_assign_expr(expr: Assign) {
    throw "Not Implemented";
  }
  visit_binary_expr(expr: Binary) {
    throw "Not Implemented";
  }
  visit_call_expr(expr: Call) {
    throw "Not Implemented";
  }
  visit_get_expr(expr: Get) {
    throw "Not Implemented";
  }
  visit_grouping_expr(expr: Grouping) {
    throw "Not Implemented";
  }
  visit_literal_expr(expr: Literal) {
    throw "Not Implemented";
  }
  visit_logical_expr(expr: Logical) {
    throw "Not Implemented";
  }
  visit_set_expr(expr: Set) {
    throw "Not Implemented";
  }
  visit_super_expr(expr: Super) {
    throw "Not Implemented";
  }
  visit_this_expr(expr: This) {
    throw "Not Implemented";
  }
  visit_unary_expr(expr: Unary) {
    throw "Not Implemented";
  }
  visit_variable_expr(expr: Variable) {
    throw "Not Implemented";
  }
}

export abstract class Expr {
  accept(_visitor: ExprVisitor) {
    throw "Not Implemented";
  }
}

export class Assign extends Expr {
  name: Token;
  value: Expr;
  constructor(name: Token, value: Expr) {
    super();
    this.name = name;
    this.value = value;
  }
  accept(visitor: ExprVisitor) {
    return visitor.visit_assign_expr(this);
  }
}

export class Binary extends Expr {
  op: Token;
  left: Expr;
  right: Expr;
  constructor(left: Expr, op: Token, right: Expr) {
    super();
    this.left = left;
    this.op = op;
    this.right = right;
  }
  accept(visitor: ExprVisitor) {
    return visitor.visit_binary_expr(this);
  }
}

export class Call extends Expr {
  callee: Expr;
  paren: Token;
  args: Array<Token>;
  constructor(callee: Expr, paren: Token, args: Array<Token>) {
    super();
    this.callee = callee;
    this.paren = paren;
    this.args = args;
  }
  accept(visitor: ExprVisitor) {
    return visitor.visit_call_expr(this);
  }
}

export class Get extends Expr {
  obj: Expr;
  name: Token;
  constructor(obj: Expr, name: Token) {
    super();
    this.obj = obj;
    this.name = name;
  }
  accept(visitor: ExprVisitor) {
    return visitor.visit_get_expr(this);
  }
}

export class Grouping extends Expr {
  expression: Expr;
  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }
  accept(_visitor: ExprVisitor) {
    return _visitor.visit_grouping_expr(this);
  }
}

export class Literal extends Expr {
  // deno-lint-ignore no-explicit-any
  value: any;
  // deno-lint-ignore no-explicit-any
  constructor(value: any) {
    super();
    this.value = value;
  }
  accept(_visitor: ExprVisitor) {
    return _visitor.visit_literal_expr(this);
  }
}

export class Logical extends Expr {
  left: Expr;
  op: Token;
  right: Expr;
  constructor(left: Expr, op: Token, right: Expr) {
    super();
    this.left = left;
    this.op = op;
    this.right = right;
  }
  accept(_visitor: ExprVisitor) {
    return _visitor.visit_logical_expr(this);
  }
}

export class Set extends Expr {
  obj: Expr;
  name: Token;
  value: Expr;
  constructor(obj: Expr, name: Token, value: Expr) {
    super();
    this.obj = obj;
    this.name = name;
    this.value = value;
  }
  accept(_visitor: ExprVisitor) {
    return _visitor.visit_set_expr(this);
  }
}

export class Super extends Expr {
  keyword: Token;
  method: Token;
  constructor(keyword: Token, method: Token) {
    super();
    this.keyword = keyword;
    this.method = method;
  }
  accept(_visitor: ExprVisitor) {
    return _visitor.visit_super_expr(this);
  }
}

export class This extends Expr {
  keyword: Token;
  constructor(keyword: Token) {
    super();
    this.keyword = keyword;
  }
  accept(_visitor: ExprVisitor) {
    return _visitor.visit_this_expr(this);
  }
}

export class Unary extends Expr {
  operator: Token;
  right: Expr;
  constructor(operator: Token, right: Expr) {
    super();
    this.operator = operator;
    this.right = right;
  }
  accept(_visitor: ExprVisitor) {
    return _visitor.visit_unary_expr(this);
  }
}

export class Variable extends Expr {
  name: Token;
  constructor(name: Token) {
    super();
    this.name = name;
  }
  accept(_visitor: ExprVisitor) {
    return _visitor.visit_variable_expr(this);
  }
}
