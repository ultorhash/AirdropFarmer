export class Logger {
  static ok (account: string, protocol: string): void {
    console.log("\x1b[32m", `${account}, ${protocol} success`, "\x1b[0m");
  }

  static error (account: string, protocol: string): void {
    console.log("\x1b[31m", `${account}, ${protocol} error`, "\x1b[0m");
  }
}
