import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private listMatrixOperation: {
    label: string;
    value: string;
    disabled: boolean;
  }[] = [
    {
      label: 'A × A',
      value: 'MULTIPLY_A',
      disabled: false,
    },
    {
      label: '|A|',
      value: 'DET_A',
      disabled: false,
    },
    {
      label: 'A&#x1D40;',
      value: 'TRANSPOSE_A',
      disabled: false,
    },
    {
      label: 'A⁻¹',
      value: 'INVERS_A',
      disabled: true,
    },
    {
      label: 'B × B',
      value: 'MULTIPLY_B',
      disabled: false,
    },
    {
      label: '|B|',
      value: 'DET_B',
      disabled: false,
    },
    {
      label: 'B&#x1D40;',
      value: 'TRANSPOSE_B',
      disabled: false,
    },
    {
      label: 'B⁻¹',
      value: 'INVERS_B',
      disabled: true,
    },
    {
      label: 'A × B',
      value: 'MULTIPLY_A_B',
      disabled: false,
    },
    {
      label: 'A + B',
      value: 'ADD_A_B',
      disabled: false,
    },
    {
      label: 'A - B',
      value: 'REDUCE_A_B',
      disabled: false,
    },
    {
      label: 'B - A',
      value: 'REDUCE_B_A',
      disabled: false,
    },
    {
      label: 'A⁻¹ × B',
      value: 'INVERS_A_MULTIPLY_B',
      disabled: true,
    },
    {
      label: 'B⁻¹ × A',
      value: 'INVERS_B_MULTIPLY_A',
      disabled: true,
    },
  ];

  constructor() {}

  getOperations() {
    return this.listMatrixOperation;
  }

  getLabelByValue(value: string): string {
    const operation = this.listMatrixOperation.find((op) => op.value === value);
    return operation ? operation.label : 'Label tidak ditemukan';
  }
}
