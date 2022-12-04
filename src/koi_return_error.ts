// deno-lint-ignore-file no-explicit-any
export class KoiReturnError extends Error {
  value: any;
  constructor(value: any) {
    super(undefined, undefined);
    this.value = value;
  }
}
