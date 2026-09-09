export type EscPosAlignment = 'left' | 'center' | 'right';
export type ThermalPaperWidth = 58 | 80;

export class EscPosBuilder {
  private readonly buffer: number[] = [];
  readonly columns: number;

  constructor(readonly paperWidth: ThermalPaperWidth = 58) {
    this.columns = paperWidth === 58 ? 32 : 48;
    this.initialize();
  }

  initialize(): this {
    // ESC @ (Initialize printer)
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  align(alignment: EscPosAlignment): this {
    // ESC a n (Select justification)
    const n = alignment === 'left' ? 0 : alignment === 'center' ? 1 : 2;
    this.buffer.push(0x1b, 0x61, n);
    return this;
  }

  bold(enable: boolean = true): this {
    // ESC E n (Turn emphasized mode on/off)
    this.buffer.push(0x1b, 0x45, enable ? 1 : 0);
    return this;
  }

  doubleSize(enable: boolean = true): this {
    // GS ! n (Select character size: 0x11 = double height + width)
    this.buffer.push(0x1d, 0x21, enable ? 0x11 : 0x00);
    return this;
  }

  underline(enable: boolean = true): this {
    // ESC - n (Turn underline mode on/off)
    this.buffer.push(0x1b, 0x2d, enable ? 1 : 0);
    return this;
  }

  feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0a);
    }
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
    this.feed(1);
    return this;
  }

  divider(char: string = '-'): this {
    this.align('left');
    this.textLine(char.repeat(this.columns));
    return this;
  }

  /**
   * Prints a two-column row aligned to left and right margins
   */
  row(left: string, right: string): this {
    const totalSpaces = this.columns - left.length - right.length;
    if (totalSpaces > 0) {
      this.textLine(left + ' '.repeat(totalSpaces) + right);
    } else {
      // Left text is too long, print on separate lines
      this.textLine(left);
      this.align('right').textLine(right).align('left');
    }
    return this;
  }

  /**
   * Cuts paper with full or partial feed
   */
  cut(partial: boolean = false): this {
    this.feed(3);
    // GS V m (Cut paper)
    this.buffer.push(0x1d, 0x56, partial ? 0x01 : 0x00);
    return this;
  }

  toBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
