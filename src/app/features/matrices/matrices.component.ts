import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { combineLatest, startWith } from 'rxjs';
import { OperationType } from './models/matrices.model';
import { ErrorComponent } from '../error/error.component';

@Component({
  selector: 'app-matrices',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, ErrorComponent],
  templateUrl: './matrices.component.html',
  styleUrl: './matrices.component.scss',
})
export class MatricesComponent implements OnInit {
  formSettingMatrixA: FormGroup;
  formSettingMatrixB: FormGroup;
  formMatrixA: FormGroup;
  formMatrixB: FormGroup;
  formOperation: FormGroup;
  result: number[][] = [];
  determinantResult: number[] = [];
  listSelect: number[] = [1, 2, 3, 4, 5, 6];
  listOperation: { label: string; value: string }[] = [
    {
      label: 'A × A',
      value: 'MULTIPLY_A',
    },
    {
      label: '|A|',
      value: 'DET_A',
    },
    {
      label: 'A&#x1D40;',
      value: 'TRANSPOSE_A',
    },
    {
      label: 'A⁻¹',
      value: 'INVERS_A',
    },
    {
      label: 'B × B',
      value: 'MULTIPLY_B',
    },
    {
      label: '|B|',
      value: 'DET_B',
    },
    {
      label: 'B&#x1D40;',
      value: 'TRANSPOSE_B',
    },
    {
      label: 'B⁻¹',
      value: 'INVERS_B',
    },
    {
      label: 'A × B',
      value: 'MULTIPLY_A_B',
    },
    {
      label: 'A + B',
      value: 'ADD_A_B',
    },
    {
      label: 'A - B',
      value: 'REDUCE_A_B',
    },
    {
      label: 'B - A',
      value: 'REDUCE_B_A',
    },
    {
      label: 'A⁻¹ × B',
      value: 'INVERS_A_MULTIPLY_B',
    },
    {
      label: 'B⁻¹ × A',
      value: 'INVERS_B_MULTIPLY_A',
    },
  ];
  operation?: string = '';
  matrixA: number[][] = [];
  matrixB: number[][] = [];
  rowCount: number = 6;
  colCount: number = 6;
  rowsMatrixA: number;
  colsMatrixA: number;
  rowsMatrixB: number;
  colsMatrixB: number;
  isError: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.formSettingMatrixA = this.formBuilder.group({
      rows: [2],
      cols: [2],
    });
    this.formSettingMatrixB = this.formBuilder.group({
      rows: [2],
      cols: [2],
    });
    this.formOperation = this.formBuilder.group({
      operation: [''],
    });

    this.formMatrixA = this.createMatrixForm(this.rowCount, this.colCount);
    this.formMatrixB = this.createMatrixForm(this.rowCount, this.colCount);
    this.setActiveElementMatrix(
      'A',
      this.formSettingMatrixA.get('rows')?.value,
      this.formSettingMatrixA.get('cols')?.value
    );
    this.setActiveElementMatrix(
      'B',
      this.formSettingMatrixB.get('rows')?.value,
      this.formSettingMatrixB.get('cols')?.value
    );

    this.updateElementMatrix();
  }

  createMatrixForm(rows: number, cols: number): FormGroup {
    const formGroup = this.formBuilder.group({});
    for (let i = 1; i <= rows; i++) {
      const rowGroup = this.formBuilder.group({});
      for (let j = 1; j <= cols; j++) {
        rowGroup.addControl(
          `col${j}`,
          this.formBuilder.control({ value: 0, disabled: false })
        );
      }
      formGroup.addControl(`row${i}`, rowGroup);
    }

    return formGroup;
  }

  updateElementMatrix() {
    let fSettingMatrixA = this.formSettingMatrixA.controls;
    let fSettingMatrixB = this.formSettingMatrixB.controls;

    combineLatest(
      fSettingMatrixA['rows'].valueChanges.pipe(startWith('')),
      fSettingMatrixA['cols'].valueChanges.pipe(startWith(''))
    )
      .pipe()
      .subscribe(([fRows, fCols]) => {
        this.rowsMatrixA = fRows
          ? fRows
          : this.formSettingMatrixA.get('rows')?.value;
        this.colsMatrixA = fCols
          ? fCols
          : this.formSettingMatrixA.get('cols')?.value;
        this.setActiveElementMatrix('A', this.rowsMatrixA, this.colsMatrixA);
      });

    combineLatest(
      fSettingMatrixB['rows'].valueChanges.pipe(startWith('')),
      fSettingMatrixB['cols'].valueChanges.pipe(startWith(''))
    )
      .pipe()
      .subscribe(([fRows, fCols]) => {
        this.rowsMatrixB = fRows
          ? fRows
          : this.formSettingMatrixB.get('rows')?.value;
        this.colsMatrixB = fCols
          ? fCols
          : this.formSettingMatrixB.get('cols')?.value;
        this.setActiveElementMatrix('B', this.rowsMatrixB, this.colsMatrixB);
      });
  }

  setActiveElementMatrix(matrix: 'A' | 'B', rows: number, cols: number) {
    switch (matrix) {
      case 'A':
        for (let i = 1; i <= this.rowCount; i++) {
          if (i <= rows) {
            const row = this.formMatrixA.get(`row${i}`) as FormGroup;
            for (let j = 1; j <= this.colCount; j++) {
              if (j <= cols) row.get(`col${j}`)?.enable();
              else {
                row.get(`col${j}`)?.setValue(0);
                row.get(`col${j}`)?.disable();
              }
            }
          } else {
            const row = this.formMatrixA.get(`row${i}`) as FormGroup;
            for (let j = 1; j <= this.colCount; j++) {
              row.get(`col${j}`)?.setValue(0);
              row.get(`col${j}`)?.disable();
            }
          }
        }
        break;
      case 'B':
        for (let i = 1; i <= this.rowCount; i++) {
          if (i <= rows) {
            const row = this.formMatrixB.get(`row${i}`) as FormGroup;
            for (let j = 1; j <= this.colCount; j++) {
              if (j <= cols) row.get(`col${j}`)?.enable();
              else {
                row.get(`col${j}`)?.setValue(0);
                row.get(`col${j}`)?.disable();
              }
            }
          } else {
            const row = this.formMatrixB.get(`row${i}`) as FormGroup;
            for (let j = 1; j <= this.colCount; j++) {
              row.get(`col${j}`)?.setValue(0);
              row.get(`col${j}`)?.disable();
            }
          }
        }
        break;
    }
  }

  decodeHtmlEntity(entity: string = ''): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = entity;
    return textarea.value;
  }

  selectOperation(operation: string) {
    this.setElementMatrix('A', this.rowsMatrixA, this.colsMatrixA);
    this.setElementMatrix('B', this.rowsMatrixB, this.colsMatrixB);
    this.executeOperation(operation as OperationType);
  }

  setElementMatrix(matrix: 'A' | 'B', rows: number, cols: number) {
    switch (matrix) {
      case 'A':
        this.matrixA = [];
        for (let i = 1; i <= rows; i++) {
          const row = this.formMatrixA.get(`row${i}`) as FormGroup;
          const numberElements: number[] = [];
          for (let j = 1; j <= cols; j++) {
            numberElements.push(row.get(`col${j}`)?.value);
          }
          this.matrixA.push(numberElements);
        }
        break;
      case 'B':
        this.matrixB = [];
        for (let i = 1; i <= rows; i++) {
          const row = this.formMatrixB.get(`row${i}`) as FormGroup;
          const numberElements: number[] = [];
          for (let j = 1; j <= cols; j++) {
            numberElements.push(row.get(`col${j}`)?.value);
          }
          this.matrixB.push(numberElements);
        }
        break;
    }
  }

  executeOperation(operation: OperationType) {
    this.isLoading = true;
    this.operation = this.listOperation.find(
      (el) => el.value == operation
    )?.label;
    switch (operation) {
      case 'MULTIPLY_A':
        this.multiply(this.matrixA, this.matrixA);
        break;
      case 'DET_A':
        this.determinan(this.matrixA);
        break;
      case 'TRANSPOSE_A':
        this.transpose(this.matrixA);
        break;
      case 'INVERS_A':
        this.invers(this.matrixA);
        break;
      case 'MULTIPLY_B':
        this.multiply(this.matrixB, this.matrixB);
        break;
      case 'DET_B':
        this.determinan(this.matrixB);
        break;
      case 'TRANSPOSE_B':
        this.transpose(this.matrixB);
        break;
      case 'INVERS_B':
        this.invers(this.matrixB);
        break;
      case 'MULTIPLY_A_B':
        this.multiply(this.matrixA, this.matrixB);
        break;
      case 'ADD_A_B':
        this.add(this.matrixA, this.matrixB);
        break;
      case 'REDUCE_A_B':
        this.reduce(this.matrixA, this.matrixB);
        break;
      case 'REDUCE_B_A':
        this.reduce(this.matrixB, this.matrixA);
        break;
      case 'INVERS_A_MULTIPLY_B':
        this.inversAndMultiply(this.matrixA, this.matrixB);
        break;
      case 'INVERS_B_MULTIPLY_A':
        this.inversAndMultiply(this.matrixB, this.matrixA);
        break;
    }
  }

  multiply(firstElements: number[][], secondElements: number[][]) {
    if (firstElements[0].length != secondElements.length) {
      this.isError = true;
      this.errorMessage = `Tidak dapat melakukan operasi ${this.operation}, jumlah kolom matrix pertama tidak sama dengan jumlah baris matrix kedua`;
    } else {
      this.isError = false;
      this.result = [];
      for (let i = 0; i < firstElements.length; i++) {
        this.result[i] = [];
        for (let j = 0; j < firstElements.length; j++) {
          let tempResAdd: number = 0;
          for (let k = 0; k < firstElements[i].length; k++) {
            tempResAdd += firstElements[i][k] * secondElements[k][j];
          }
          if (Number.isNaN(tempResAdd)) {
            continue;
          }
          this.result[i].push(tempResAdd);
        }
      }
    }
    this.isLoading = false;
  }

  determinan(elements: number[][]): number {
    if (elements.length != elements[0].length) {
      this.isError = true;
      this.errorMessage = `Tidak dapat melakukan operasi ${this.operation}, bukan matrix persegi`;
      return 0;
    } else {
      this.isError = false;
      this.determinantResult = [];

      const n = elements.length;
      let det: number = 1;
      let swapCount = 0;

      const mat = elements.map((row) => row.slice());

      for (let i = 0; i < n; i++) {
        let pivotRow = i;
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(mat[j][i]) > Math.abs(mat[pivotRow][i])) {
            pivotRow = j;
          }
        }

        if (mat[pivotRow][i] === 0) {
          return 0;
        }

        if (pivotRow !== i) {
          [mat[i], mat[pivotRow]] = [mat[pivotRow], mat[i]];
          swapCount++;
        }

        for (let j = i + 1; j < n; j++) {
          const factor = mat[j][i] / mat[i][i];
          for (let k = i; k < n; k++) {
            mat[j][k] -= factor * mat[i][k];
          }
        }
      }

      for (let i = 0; i < n; i++) {
        det *= mat[i][i];
      }

      if (swapCount % 2 !== 0) {
        det = -det;
      }

      this.determinantResult.push(Math.ceil(det));
    }

    this.isLoading = false;
    return this.determinantResult[0];
  }

  transpose(elements: number[][]) {
    this.isError = false;
    this.isLoading = true;

    const rows = elements.length;
    const cols = elements[0].length;

    const transposed: number[][] = Array.from({ length: cols }, () => []);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        transposed[j][i] = elements[i][j];
      }
    }

    this.result = transposed;
    this.isLoading = false;
  }

  invers(elements: number[][]): number[][] {
    this.isError = false;
    return elements;
  }

  add(firstElements: number[][], secondElements: number[][]) {
    if (firstElements.length != secondElements.length) {
      this.isError = true;
      this.errorMessage = `Tidak dapat melakukan operasi ${this.operation}, jumlah baris dan kolom matrix pertama tidak sama dengan matrix kedua`;
    } else {
      this.isError = false;
      this.result = [];
      for (let i = 0; i < firstElements.length; i++) {
        const rows: number[] = [];
        for (let j = 0; j < firstElements[i].length; j++) {
          const tempElementRows: number =
            Number(firstElements[i][j]) + Number(secondElements[i][j]);
          rows.push(tempElementRows);
        }
        this.result.push(rows);
      }
    }
    this.isLoading = false;
  }

  reduce(firstElements: number[][], secondElements: number[][]) {
    if (firstElements.length != secondElements.length) {
      this.isLoading = false;
      this.isError = true;
    } else {
      this.isLoading = false;
      this.isError = false;
      this.result = [];
      for (let i = 0; i < firstElements.length; i++) {
        const rows: number[] = [];
        for (let j = 0; j < firstElements[i].length; j++) {
          const tempElementRows: number =
            Number(firstElements[i][j]) - Number(secondElements[i][j]);
          rows.push(tempElementRows);
        }
        this.result.push(rows);
      }
    }
  }

  inversAndMultiply(firstElements: number[][], secondElements: number[][]) {
    const invers = this.invers(firstElements);
    this.multiply(invers, secondElements);
  }

  handleModalClose(isError: boolean): void {
    this.isError = isError;
  }
}
