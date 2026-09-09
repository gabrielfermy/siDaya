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
   * Opens standard cash drawer connected via RJ11 (ESC p m t1 t2)
   * Pin 2 (m=0) or Pin 5 (m=1)
   */
  cashDrawerKick(pin: 2 | 5 = 2): this {
    const m = pin === 2 ? 0x00 : 0x01;
    this.buffer.push(0x1b, 0x70, m, 0x19, 0xfa);
    return this;
  }

  /**
   * Prints a 2D QR Code using standard ESC/POS GS ( k commands
   */
  qrCode(data: string, size: number = 6): this {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const len = dataBytes.length + 3;
    const pL = len % 256;
    const pH = Math.floor(len / 256);

    // 1. Set model (Model 2)
    this.buffer.push(0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
    // 2. Set module size (1-16 dots)
    this.buffer.push(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, Math.min(Math.max(size, 1), 16));
    // 3. Set error correction (Level M = 49)
    this.buffer.push(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31);
    // 4. Store data in symbol storage area
    this.buffer.push(0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30);
    for (let i = 0; i < dataBytes.length; i++) {
      this.buffer.push(dataBytes[i]!);
    }
    // 5. Print symbol
    this.buffer.push(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30);
    return this;
  }

  /**
   * Prints 1D Barcode (GS k)
   */
  barcode(code: string, type: 'EAN13' | 'CODE128' = 'CODE128'): this {
    const encoder = new TextEncoder();
    const codeBytes = encoder.encode(code);

    // Set barcode height = 64 dots
    this.buffer.push(0x1d, 0x68, 64);
    // Set HRI characters below barcode
    this.buffer.push(0x1d, 0x48, 2);

    if (type === 'EAN13') {
      this.buffer.push(0x1d, 0x6b, 67, codeBytes.length);
    } else {
      // CODE128
      this.buffer.push(0x1d, 0x6b, 73, codeBytes.length);
    }

    for (let i = 0; i < codeBytes.length; i++) {
      this.buffer.push(codeBytes[i]!);
    }
    return this;
  }

  /**
   * Appends raw bytes into buffer
   */
  raw(bytes: number[] | Uint8Array): this {
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]!);
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
