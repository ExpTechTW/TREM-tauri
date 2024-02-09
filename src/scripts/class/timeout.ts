export class RefreshableTimeout {
  callback: (...args: any[]) => void;
  delay: number;
  args: any[];
  reference: number;

  constructor(
    callback: (...args: any[]) => void,
    delay: number,
    ...args: any[]
  ) {
    this.callback = callback;
    this.delay = delay;
    this.args = args;
    this.reference = window.setTimeout(callback, delay, ...args);
  }

  refresh(newDelay?: number) {
    window.clearTimeout(this.reference);

    if (newDelay) {
      this.delay = newDelay;
    }

    this.reference = window.setTimeout(this.callback, this.delay, ...this.args);
  }

  clear() {
    window.clearTimeout(this.reference);
  }
}
