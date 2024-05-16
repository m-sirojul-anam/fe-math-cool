import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription, combineLatest, startWith } from 'rxjs';
import { OperationType } from './models/matrices.model';

@Component({
  selector: 'app-matrices',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './matrices.component.html',
  styleUrl: './matrices.component.scss',
})
export class MatricesComponent implements OnInit {
  formSettingMatrixA: FormGroup;
  formSettingMatrixB: FormGroup;
  formMatrixA: FormGroup;
  formMatrixB: FormGroup;
  formOperation: FormGroup;
  result: any;
  listSelect: number[] = [1, 2, 3, 4, 5, 6];
  listOperation: { label: string; value: string }[] = [
    {
      label: 'Find',
      value: '',
    },
    {
      label: 'A × A',
      value: 'MULTIPLY_A',
    },
    {
      label: '|A| (Determinan A)',
      value: 'DET_A',
    },
    {
      label: 'A&#x1D40; (Transpose A)',
      value: 'TRANSPOSE_A',
    },
    {
      label: 'A⁻¹ (Invers A)',
      value: 'INVERS_A',
    },
    {
      label: 'B × B',
      value: 'MULTIPLY_B',
    },
    {
      label: '|B| (Determinan B)',
      value: 'DET_B',
    },
    {
      label: 'B&#x1D40; (Transpose B)',
      value: 'TRANSPOSE_B',
    },
    {
      label: 'B⁻¹ (Invers B)',
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
  matrixA: number[][] = [];
  matrixB: number[][] = [];
  rowCount: number = 6;
  colCount: number = 6;
  rowsMatrixA: number;
  colsMatrixA: number;
  rowsMatrixB: number;
  colsMatrixB: number;

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
    this.selectOperation();
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
        this.setActiveElementMatrix('B', this.colsMatrixB, this.colsMatrixB);
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
              else row.get(`col${j}`)?.disable();
            }
          } else {
            const row = this.formMatrixA.get(`row${i}`) as FormGroup;
            for (let j = 1; j <= this.colCount; j++) {
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
              else row.get(`col${j}`)?.disable();
            }
          } else {
            const row = this.formMatrixB.get(`row${i}`) as FormGroup;
            for (let j = 1; j <= this.colCount; j++) {
              row.get(`col${j}`)?.disable();
            }
          }
        }
        break;
    }
  }

  decodeHtmlEntity(entity: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = entity;
    return textarea.value;
  }

  selectOperation() {
    let fOperation = this.formOperation.controls;

    combineLatest(fOperation['operation'].valueChanges.pipe(startWith('')))
      .pipe()
      .subscribe(([value]) => {
        if (value) {
          this.setElementMatrix('A', this.rowsMatrixA, this.colsMatrixA);
          this.setElementMatrix('B', this.rowsMatrixB, this.colsMatrixB);
          this.executeOperation(value);
        }
      });
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
        console.log(this.matrixA);
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
        console.log(this.matrixB);
        break;
    }
  }

  executeOperation(operation: OperationType) {
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
    console.log('FIRST ELEMENTS => ', firstElements);
    console.log('SECOND ELEMENTS => ', secondElements);
  }

  determinan(elements: number[][]) {}

  transpose(elements: number[][]) {}

  invers(elements: number[][]): number[][] {
    return elements;
  }

  add(firstElements: number[][], secondElements: number[][]) {}

  reduce(firstElements: number[][], secondElements: number[][]) {}

  inversAndMultiply(firstElements: number[][], secondElements: number[][]) {
    const invers = this.invers(firstElements);
    this.multiply(invers, secondElements);
  }
}
