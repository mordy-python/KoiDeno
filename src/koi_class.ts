// deno-lint-ignore-file no-explicit-any

import { KoiInstance } from "./koi_instance.ts";
import { KoiCallable } from "./koi_callable.ts";
import { KoiFunction } from "./koi_function.ts";

export class KoiClass extends KoiCallable {
  name: string;
  superclass?: KoiClass;
  methods: Map<string, any>;
  constructor(
    name: string,
    methods: Map<string, KoiFunction>,
    superclass?: KoiClass,
  ) {
    super();
    this.name = name;
    this.superclass = superclass;
    this.methods = methods;
  }
  find_method(name: string): any {
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
    return `<class "${(<any> this).constructor.name}">`;
  }

  call(interpreter: any, args: Array<any>) {
    const instance = new KoiInstance(this);
    const initializer = this.find_method("init");
    if (initializer) {
      initializer.bind(instance).call(interpreter, args);
    }
    return instance;
  }
  arity(): number {
    const initializer = this.find_method("init");
    if (initializer) {
      return initializer.arity();
    }
    return 0;
  }
}
