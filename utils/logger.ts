export class Logger {
  static ok (account: string, msg: string): void {
    console.log("\x1b[32m", `${account} | ${msg} success`, "\x1b[0m");
  }

  static warn (account: string, msg: string): void {
    console.log("\x1b[33m", `${account} | ${msg}`, "\x1b[0m");
  }

  static info (account: string, msg: string): void {
    console.log("\x1b[34m", `${account} | ${msg}`, "\x1b[0m");
  }

  static error (account: string, msg: string): void {
    console.log("\x1b[31m", `${account} | ${msg} error`, "\x1b[0m");
  }
}
