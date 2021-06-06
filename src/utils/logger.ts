export class Logger {
  constructor(public enableDebug: boolean = false) {}

  public debug(text: string, ...args: any[]) {
    if (this.enableDebug) console.log(text, ...args)
  }
}
