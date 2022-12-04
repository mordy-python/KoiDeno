import { Token } from "./token.ts";

export class KoiRuntimeError {
  token: Token;
  message: string;
  constructor(token: Token, message: string) {
    this.token = token;
    this.message = message;
  }
  
}
