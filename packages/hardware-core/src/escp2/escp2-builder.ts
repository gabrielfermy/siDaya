export type EscP2Pitch = '10cpi' | '12cpi' | '15cpi' | 'condensed';

export class EscP2Builder {
  private readonly buffer: number[] = [];
  readonly columns: number;

  constructor(isCondensed: boolean = true) {
    this.columns = isCondensed ? 132 : 80;
    this.initialize();
    if (isCondensed) {
      this.condensed(true);
    }
  }

  initialize(): this {
    // ESC @ (Initialize printer)
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  /**
   * Enables or disables condensed printing (SI = 0x0F, DC2 = 0x12)
   */
  condensed(enable: boolean = true): this {
    this.buffer.push(enable ? 0x0f : 0x12);
    return this;
  }

  bold(enable: boolean = true): this {
    // ESC E (Turn emphasized mode on), ESC F (Turn off)
    this.buffer.push(0x1b, enable ? 0x45 : 0x46);
    return this;
  }

  doubleWidth(enable: boolean = true): this {
    // ESC W n (Double-width mode on/off)
    this.buffer.push(0x1b, 0x57, enable ? 1 : 0);
    return this;
  }

  text(str: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]!);
    }
    return this;
  }

  textLine(str: string): this {
    this.text(str);
    this.buffer.push(0x0d, 0x0a); // CR LF
    return this;
  }

  divider(char: string = '='): this {
    this.textLine(char.repeat(this.columns));
    return this;
  }

  row(left: string, right: string): this {
    const totalSpaces = this.columns - left.length - right.length;
    if (totalSpaces > 0) {
      this.textLine(left + ' '.repeat(totalSpaces) + right);
    } else {
      this.textLine(left);
      this.textLine(' '.repeat(Math.max(0, this.columns - right.length)) + right);
    }
    return this;
  }

  feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0d, 0x0a);
    }
    return this;
  }

  /**
   * Advances continuous form perforated paper to next page (Form Feed: 0x0C)
   */
  formFeed(): this {
    this.buffer.push(0x0c);
    return this;
  }

  toBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
