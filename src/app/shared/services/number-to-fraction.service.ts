import { Injectable } from '@angular/core';
import Fraction from 'fraction.js';

@Injectable({
  providedIn: 'root',
})
export class NumberToFractionService {
  constructor() {}

  numberToFraction(value: number): string {
    const valueString = value.toString();
    if (!valueString.includes('.')) {
      return value < 0 ? `(${value})` : valueString;
    }
    const fraction = new Fraction(value);
    const textarea = document.createElement('textarea');
    return this.updateTextarea(value, fraction, textarea);
  }

  private updateTextarea(
    value: number,
    fraction: Fraction,
    textarea: HTMLTextAreaElement
  ): string {
    if (value && value < 0) {
      textarea.innerHTML = `${fraction.s < 0 ? '-' : ''}<sup>${
        fraction.n
      }</sup>&frasl;<sub>${fraction.d}</sub>`;
      return `(${textarea.value})`;
    } else
      textarea.innerHTML = `<sup>${fraction.n}</sup>&frasl;<sub>${fraction.d}</sub>`;

    return textarea.value;
  }
}
