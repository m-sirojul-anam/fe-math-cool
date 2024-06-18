import { Pipe, PipeTransform } from '@angular/core';
import Fraction from 'fraction.js';

@Pipe({
  name: 'numberToFraction',
  standalone: true,
})
export class NumberToFractionPipe implements PipeTransform {
  transform(value: number): string {
    if (!value.toString().includes('.')) return value.toString();

    const fraction = new Fraction(value);
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value
      ? `${fraction.s < 0 ? '-' : ''}<sup>${fraction.n}</sup>&frasl;<sub>${
          fraction.d
        }</sub>`
      : '';
    return textarea.value;
  }
}
