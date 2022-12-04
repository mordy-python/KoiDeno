// deno-lint-ignore-file no-explicit-any
import {
  Block,
  Class,
  Expression,
  Function,
  If,
  Return,
  Stmt,
  Var,
  While,
} from "./stmt.ts";
import {
  Assign,
  Binary,
  Call,
  Expr,
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
import { Token } from "./token.ts";
import { Visitor } from "./visitor.ts";
import { Interpreter } from "./interpreter.ts";
import { FunctionType } from "./function_type.ts";
import { ClassType } from "./class_type.ts";
import { Deque } from "https://deno.land/x/deno_deque@1.0.0/mod.ts";

export class Resolver extends Visitor {
  interpreter: Interpreter;
  scopes: Deque<Map<any, any>>;
  on_error: (token: Token, message: string) => void;
  current_function: FunctionType;
  current_class: ClassType;
  constructor(
    interpreter: Interpreter,
    on_error: (token: Token, message: string) => void,
  ) {
    super();
    this.interpreter = interpreter;
    this.scopes = new Deque();
    this.on_error = on_error;
    this.current_function = FunctionType.NONE;
    this.current_class = ClassType.NONE;
  }
  private begin_scope() {
    this.scopes.push(new Map());
  }
  private end_scope() {
    this.scopes.pop();
  }
  resolve(stmts: Stmt[]) {
    this.resolve_statements(stmts);
  }
  private resolve_statements(stmts: Stmt[] | Stmt) {
    if (!(stmts instanceof Array)) {
      stmts = [stmts];
    }
    for (const stmt of stmts) {
      this.resolve_statement(stmt);
    }
  }
  private resolve_statement(stmt: Stmt) {
    stmt.accept(this);
  }
  private resolve_expression(expr: Expression | Expr) {
    return expr.accept(this);
  }
  private resolve_local(expr: Expr, name: Token) {
    Array.from(this.scopes).reverse().map((scope, index) => {
      if (scope?.has(name.lexeme)) {
        this.interpreter.resolve(expr, index);
        return;
      }
    });
  }
  private resolve_function(fn: Function, type: FunctionType) {
    const enclosing: FunctionType = this.current_function;
    this.current_function = type;

    this.begin_scope();
    for (const param of fn.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve_statements(fn.body);
    this.end_scope();
    this.current_function = enclosing;
  }
  private declare(name: Token) {
    if (this.scopes.length == 0) {
      return;
    }
    const scope = this.scopes.back;
    if (scope?.has(name.lexeme)) {
      this.on_error(
        name,
        `Variable with name "${name}" already exists in this scope`,
      );
    }
    scope?.set(name.lexeme, false);
  }
  private define(name: Token) {
    if (this.scopes.length == 0) {
      return;
    }
    const scope = this.scopes.back;
    scope?.set(name.lexeme, true);
  }
  visit_var_stmt(stmt: Var) {
    this.declare(stmt.name);
    if (stmt.initializer) {
      this.resolve_expression(stmt.initializer);
    }
    this.define(stmt.name);
    return null;
  }
  visit_variable_expr(expr: Variable) {
    if (
      (this.scopes.length != 0) &&
      (this.scopes.back)?.get(expr.name.lexeme) == false
    ) {
      this.on_error(expr.name, "Cannot read variable in it's own initializer");
    }
    this.resolve_local(expr, expr.name);
  }
  visit_assign_expr(expr: Assign) {
    this.resolve_expression(expr.value);
    this.resolve_local(expr, expr.name);
  }
  visit_function_stmt(stmt: Function) {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolve_function(stmt, FunctionType.FUNCTION);
  }
  visit_expression_stmt(stmt: Expression) {
    this.resolve_expression(stmt.expression);
  }
  visit_if_stmt(stmt: If) {
    this.resolve_expression(stmt.condition);
    this.resolve_statement(stmt.then_branch);
    if (stmt.else_branch) {
      this.resolve_statement(stmt.else_branch);
    }
  }
  visit_return_stmt(stmt: Return) {
    if (this.current_function == FunctionType.NONE) {
      this.on_error(stmt.keyword, "Cannot use return outside of a function");
    }
    if (stmt.value) {
      if (this.current_function == FunctionType.INITIALIZER) {
        this.on_error(
          stmt.keyword,
          "Cannot return a value from an initializer",
        );
      }
      this.resolve_expression(stmt.value);
    }
  }
  visit_while_stmt(stmt: While) {
    this.resolve_expression(stmt.condition);
    this.resolve_statement(stmt.body);
  }
  visit_binary_expr(expr: Binary) {
    this.resolve_expression(expr.left);
    this.resolve_expression(expr.right);
  }
  visit_call_expr(expr: Call) {
    this.resolve_expression(expr.callee);
    for (const arg of expr.args) {
      this.resolve_expression(arg);
    }
  }
  visit_grouping_expr(expr: Grouping) {
    this.resolve_expression(expr.expression);
  }
  visit_literal_expr(_expr: Literal) {
    return null;
  }
  visit_logical_expr(expr: Logical) {
    this.resolve_expression(expr.left);
    this.resolve_expression(expr.right);
  }
  visit_unary_expr(expr: Unary) {
    this.resolve_expression(expr.right);
  }
  visit_set_expr(expr: Set) {
    this.resolve_expression(expr.value);
    this.resolve_expression(expr.obj);
  }
  visit_this_expr(expr: This) {
    if (this.current_class == ClassType.NONE) {
      this.on_error(expr.keyword, "Cannot use 'this' keyword outside a class");
    }
    this.resolve_local(expr, expr.keyword);
    return null;
  }
  visit_super_expr(expr: Super) {
    if (this.current_class == ClassType.NONE) {
      this.on_error(expr.keyword, "Cannot use 'super' keyword outside a class");
    } else if (this.current_class != ClassType.SUBCLASS) {
      this.on_error(
        expr.keyword,
        "Cannot use 'super' keyword in a class with no superclass",
      );
    }
    this.resolve_local(expr, expr.keyword);
  }
  visit_class_stmt(stmt: Class) {
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

    for (const method of stmt.methods) {
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
  visit_get_expr(expr: Get) {
    this.resolve_expression(expr.obj);
    return null;
  }
  visit_block_stmt(stmt: Block) {
    this.begin_scope();
    this.resolve(stmt.stmts);
    this.end_scope();
    return null;
  }
}
