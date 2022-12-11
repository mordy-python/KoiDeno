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
import { Environment } from "./environment.ts";
import { KoiInstance } from "./koi_instance.ts";
import { KoiClass } from "./koi_class.ts";
import { KoiCallable } from "./koi_callable.ts";
import { KoiFunction } from "./koi_function.ts";
import { KoiReturnError } from "./koi_return_error.ts";
import { KoiRuntimeError } from "./koi_runtime_error.ts";
import { Token } from "./token.ts";
import { TokenType } from "./token_type.ts";
import { Visitor } from "./visitor.ts";
import * as Colors from "https://deno.land/std@0.167.0/fmt/colors.ts";
import { Print, Println } from "./std/print.ts";
import { Input } from "./std/input.ts";
import { Clock } from "./std/clock.ts";
export class Interpreter extends Visitor {
  globals: Environment;
  env: Environment;
  locals: Map<string | Expr, any>;
  constructor() {
    super();
    this.globals = new Environment();
    this.env = this.globals;
    this.locals = new Map<string | Expr, any>();

    this.globals.define("print", new Print());
    this.globals.define("println", new Println());
    this.globals.define("clock", new Clock());
    this.globals.define("input", new Input());
    // this.globals.define("read_file", ReadFile())
    // this.globals.define("write_file", WriteFile())
    // this.globals.define("length", Length())
  }
  interpret(statements: Array<Stmt>) {
    try {
      for (const stmt of statements) {
        this.execute(stmt);
      }
    } catch (error) {
      if (error instanceof KoiRuntimeError) {
        console.error(Colors.red("Runtime error:"));
        console.error(Colors.red(`  Error on line ${error.token.line}
    Error at ${error.token.type == TokenType.EOF ? "end" : error.token.lexeme}
      ${error.message}`));
      } else {
        console.error(error);
      }
      Deno.exit(1);
    }
  }
  private execute(statement: Stmt) {
    return statement.accept(this);
  }
  private evaluate(expr: Expr): any {
    return expr.accept(this);
  }
  private stringify(value: any) {
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
  visit_literal_expr(expr: Literal) {
    return expr.value;
  }
  visit_grouping_expr(expr: Grouping) {
    return this.evaluate(expr.expression);
  }
  visit_unary_expr(expr: Unary) {
    const right = this.evaluate(expr.right);

    if (expr.operator.type == TokenType.MINUS) {
      this.check_number_operand(expr.operator, right);
      return 0 - right;
    } else if (expr.operator.type == TokenType.BANG) {
      return !this.is_truthy(right);
    }
    return null;
  }
  visit_binary_expr(expr: Binary) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.op.type) {
      case TokenType.MINUS:
        if (this.check_number_operands(left, right)) {
          return <number> left - <number> right;
        } else if (left instanceof KoiInstance) {
          if (left.klass.methods.has("_sub")) {
            return (left.klass.methods.get("_sub") as KoiFunction).call(this, [
              right,
            ]);
          }
        }
        throw new KoiRuntimeError(
          expr.op,
          `Operands are not numbers and no _sub method found on class "${left.klass.name}"`,
        );
      case TokenType.MOD:
        if (this.check_number_operands(left, right)) {
          return <number> left % <number> right;
        } else if (left instanceof KoiInstance) {
          if (left.klass.methods.has("_mod")) {
            return (left.klass.methods.get("_mod") as KoiFunction).call(this, [
              right,
            ]);
          }
        }
        throw new KoiRuntimeError(
          expr.op,
          `Operands are not numbers and no _mod method found on class "${left.klass.name}"`,
        );
      case TokenType.PLUS:
        if ((typeof left == "number") && (typeof right == "number")) {
          return <number> left + <number> right;
        } else if (typeof left == "string") {
          return <string> left + <string> right;
        } else if ((typeof left == "number") && (typeof right == "string")) {
          throw new KoiRuntimeError(
            expr.op,
            `Cannot add string "${right}" to number ${left}`,
          );
        } else {
          if (left instanceof KoiInstance) {
            if (left.klass.methods.has("_add")) {
              return (left.klass.methods.get("_add") as KoiFunction).call(
                this,
                [
                  right,
                ],
              );
            }
          }
          throw new KoiRuntimeError(
            right,
            `Operands are not numbers and no _add method found on class "${left.klass.name}"`,
          );
        }
      case TokenType.SLASH:
        if (<number> right == 0) {
          throw new KoiRuntimeError(right, `Cannot divide ${left} by zero`);
        }
        if (this.check_number_operands(left, right)) {
          return <number> left / <number> right;
        }
        if (left instanceof KoiInstance) {
          if (left.klass.methods.has("_div")) {
            return (left.klass.methods.get("_div") as KoiFunction).call(this, [
              right,
            ]);
          }
        }
        throw new KoiRuntimeError(
          expr.op,
          `Operands are not numbers and no _div method found on class "${left.klass.name}"`,
        );
      case TokenType.STAR:
        if (this.check_number_operands(left, right)) {
          return <number> left * <number> right;
        } else if (left instanceof KoiInstance) {
          if (left.klass.methods.has("_mul")) {
            return (left.klass.methods.get("_mul") as KoiFunction).call(this, [
              right,
            ]);
          }
        }
        throw new KoiRuntimeError(
          expr.op,
          `Operands are not numbers and no _mul method found on class "${left.klass.name}"`,
        );
      case TokenType.GREATER:
        if (this.check_number_operands(left, right)) {
          return <number> left > <number> right;
        } else if (left instanceof KoiInstance) {
          if (left.klass.methods.has("_gt")) {
            return (left.klass.methods.get("_gt") as KoiFunction).call(this, [
              right,
            ]);
          }
        }
        throw new KoiRuntimeError(
          expr.op,
          `Operands are not numbers and no _gt method found on class "${left.klass.name}"`,
        );
      case TokenType.GREATER_EQUAL:
        if (this.check_number_operands(left, right)) {
          return <number> left >= <number> right;
        } else if (left instanceof KoiInstance) {
          if (left.klass.methods.has("_gte")) {
            return (left.klass.methods.get("_gte") as KoiFunction).call(this, [
              right,
            ]);
          }
        }
        throw new KoiRuntimeError(
          expr.op,
          `Operands are not numbers and no _gte method found on class "${left.klass.name}"`,
        );
      case TokenType.LESS:
        if (this.check_number_operands(left, right)) {
          return <number> left < <number> right;
        } else if (left instanceof KoiInstance) {
          if (left.klass.methods.has("_lt")) {
            return (left.klass.methods.get("_lt") as KoiFunction).call(this, [
              right,
            ]);
          }
        }
        throw new KoiRuntimeError(
          expr.op,
          `Operands are not numbers and no _lt method found on class "${left.klass.name}"`,
        );
      case TokenType.LESS_EQUAL:
        if (this.check_number_operands(left, right)) {
          return <number> left <= <number> right;
        } else if (left instanceof KoiInstance) {
          if (left.klass.methods.has("_lte")) {
            return (left.klass.methods.get("_lte") as KoiFunction).call(this, [
              right,
            ]);
          }
        }
        throw new KoiRuntimeError(
          expr.op,
          `Operands are not numbers and no _lte method found on class "${left.klass.name}"`,
        );
      case TokenType.BANG_EQUAL:
        return !this.is_equal(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.is_equal(left, right);
    }
    return null;
  }
  visit_expression_stmt(stmt: Expression) {
    this.evaluate(stmt.expression);
    return null;
  }
  visit_assign_expr(expr: Assign) {
    const value = this.evaluate(expr.value);
    const distance = this.locals.get(expr);
    if (distance) {
      this.env.assign_at(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }
    return value;
  }
  visit_block_stmt(stmt: Block) {
    this.exec_block(stmt.stmts, new Environment(this.env));
    return null;
  }
  visit_call_expr(expr: Call) {
    const fn = this.evaluate(expr.callee);
    const args = [];
    for (const arg of expr.args) {
      args.push(this.evaluate(arg));
    }
    if (!(fn instanceof KoiCallable)) {
      throw new KoiRuntimeError(
        expr.paren,
        `Can only call functions and classes`,
      );
    }
    const arity = fn.arity();
    const arg_len = args.length;
    if (arg_len != arity) {
      throw new KoiRuntimeError(
        expr.paren,
        `Expected ${arity} argument${arity > 1 ? "s" : ""} but got ${arg_len}`,
      );
    }
    return fn.call(this, args);
  }
  visit_var_stmt(stmt: Var) {
    let value = null;
    if (stmt.initializer) {
      value = this.evaluate(stmt.initializer);
    }
    this.env.define(stmt.name.lexeme, value);
    return null;
  }
  visit_class_stmt(stmt: Class) {
    let superclass;
    if (stmt.superclass) {
      superclass = this.evaluate(stmt.superclass);
      if (!(superclass instanceof KoiClass)) {
        throw new KoiRuntimeError(
          stmt.superclass.name,
          "Superclass must be a class",
        );
      }
    }
    this.env.define(stmt.name.lexeme, null);
    if (stmt.superclass) {
      this.env = new Environment(this.env);
      this.env.define("super", superclass);
    }
    const methods = new Map<string, KoiFunction>();
    for (const method of stmt.methods) {
      const fn = new KoiFunction(
        method,
        this.env,
        method.name.lexeme == "init",
      );
      methods.set(method.name.lexeme, fn);
    }

    const klass = new KoiClass(stmt.name.lexeme, methods, superclass);
    if (superclass) {
      this.env = this.env.parent as Environment;
    }
    this.env.assign(stmt.name, klass);
  }
  visit_super_expr(expr: Super) {
    const distance = this.locals.get(expr);
    const superclass: KoiClass = this.env.get_at(distance, "super");
    const this_: KoiInstance = this.env.get_at(distance - 1, "this");
    const method: KoiFunction = superclass.find_method(expr.method.lexeme);
    if (method == null) {
      throw new KoiRuntimeError(
        expr.method,
        `Undefined property "${expr.method.lexeme}" on class ${superclass.name}`,
      );
    }
    return method.bind(this_);
  }
  visit_this_expr(expr: This) {
    return this.lookup_variable(expr.keyword, expr);
  }
  visit_variable_expr(expr: Variable) {
    return this.lookup_variable(expr.name, expr);
  }
  visit_function_stmt(stmt: Function) {
    const fn = new KoiFunction(stmt, this.env, false);
    this.env.define(stmt.name.lexeme, fn);
    return null;
  }
  visit_get_expr(expr: Get) {
    const obj = this.evaluate(expr.obj);
    if (obj instanceof KoiInstance) {
      return obj.get(expr.name);
    }
    throw new KoiRuntimeError(
      expr.name,
      "Can only access properties from a class instance",
    );
  }
  visit_if_stmt(stmt: If) {
    if (this.is_truthy(this.evaluate(stmt.condition))) {
      this.exec_block(stmt.then_branch, this.env);
    } else if (stmt.else_branch) {
      this.exec_block(stmt.else_branch, this.env);
    }
    return null;
  }
  visit_return_stmt(stmt: Return) {
    let value;
    if (stmt.value) {
      value = this.evaluate(stmt.value);
    }
    throw new KoiReturnError(value);
  }
  visit_set_expr(expr: Set) {
    const obj = this.evaluate(expr.obj);
    if (!(obj instanceof KoiInstance)) {
      throw new KoiRuntimeError(
        expr.name,
        "Can only set properties on class instances",
      );
    }
    const value = this.evaluate(expr.value);
    obj.set(expr.name, value);
    return value;
  }
  visit_logical_expr(expr: Logical) {
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
  visit_while_stmt(stmt: While) {
    while (this.is_truthy(this.evaluate(stmt.condition))) {
      this.exec_block(stmt.body, this.env);
    }
    return null;
  }
  resolve(expr: Expr, depth: number) {
    this.locals.set(expr, depth);
  }
  private check_number_operand(operator: Token, operand: any) {
    if (typeof operand == "number") {
      return;
    } else {
      throw new KoiRuntimeError(
        operator,
        `Operand ${operand} must be a number`,
      );
    }
  }
  private check_number_operands(left: any, right: any) {
    if ((typeof left == "number") && (typeof right == "number")) {
      return true;
    } else {
      return false;
    }
  }
  private is_truthy(object: any): boolean {
    if (!object) {
      return false;
    } else if (object instanceof Boolean) {
      return <boolean> object;
    }
    return true;
  }
  private is_equal(left: any, right: any): boolean {
    if (left == null && right == null) {
      return true;
    } else if (left == null) {
      return false;
    }
    return left == right;
  }
  exec_block(statements: Stmt[], env: Environment) {
    const previous = this.env;
    try {
      this.env = env;
      for (const stmt of statements) {
        this.execute(stmt);
      }
    } finally {
      this.env = previous;
    }
  }
  private lookup_variable(name: Token, expr: Variable | This) {
    const distance = this.locals.get(expr);
    if (distance != null) {
      return this.env.get_at(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }
}
