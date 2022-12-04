// deno-lint-ignore-file no-unused-vars
import {
  Block,
  Class,
  Expression,
  Function,
  If,
  Print,
  Return,
  Var,
  While,
} from "./stmt.ts";
import {
  Assign,
  Binary,
  Call,
  Get,
  Grouping,
  Literal,
  Logical,
  Set,
  Super,
  This,
  Unary,
  Variable,
} from "./expr.ts";

export class Visitor {
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
  visit_print_stmt(stmt: Print) {
    throw "Not Implemented";
  }
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
