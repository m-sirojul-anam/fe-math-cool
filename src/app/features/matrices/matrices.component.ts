import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { combineLatest, startWith } from 'rxjs';
import { MatrixOperationType } from '@features/matrices/models/matrices.model';
import { ErrorComponent } from '@features/error/error.component';
import { DecodeHtmlPipe } from '@shared/utils/decode-html.pipe';
import { StepsComponent } from '@shared/components/steps/steps.component';
import { ProblemsComponent } from '@shared/components/problems/problems.component';
import { UnaryOperators } from '@shared/enums/unary-operators';
import Fraction from 'fraction.js';
import { NumberToFractionPipe } from '@shared/utils/number-to-fraction.pipe';
import { HtmlSanitizerService } from '@shared/services/html-sanitizer.service';
import { NumberToFractionService } from '@shared/services/number-to-fraction.service';
import { ConfigService } from '@shared/services/config.service';

@Component({
  selector: 'app-matrices',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ErrorComponent,
    DecodeHtmlPipe,
    NumberToFractionPipe,
    ProblemsComponent,
    StepsComponent,
  ],
  templateUrl: './matrices.component.html',
  styleUrl: './matrices.component.scss',
})
export class MatricesComponent implements OnInit {
  @ViewChild('resultSection') resultSection: ElementRef;

  formSettingMatrixA: FormGroup;
  formSettingMatrixB: FormGroup;
  formMatrixA: FormGroup;
  formMatrixB: FormGroup;
  formMatrixOperation: FormGroup;
  result: number[][] = [];
  steps: string[][] = [];
  determinantResult: number[] = [];
  determinantSteps: string[] = [];
  listSelect: number[] = [1, 2, 3, 4, 5, 6];
  operator: UnaryOperators;
  listMatrixOperation: {
    label: string;
    value: string;
    disabled: boolean;
  }[];
  matrixOperation: string = '';
  matrixA: number[][] = [];
  matrixB: number[][] = [];
  matrix1: number[][] = [];
  matrix2: number[][] = [];
  rowCount: number = 6;
  colCount: number = 6;
  rowsMatrixA: number;
  colsMatrixA: number;
  rowsMatrixB: number;
  colsMatrixB: number;
  isError: boolean = false;
  isShowResult: boolean = false;
  isDisabled: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  isHideSteps: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private htmlSanitizerService: HtmlSanitizerService,
    private numberToFractionServcie: NumberToFractionService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.formSettingMatrixA = this.formBuilder.group({
      rows: [2],
      cols: [2],
    });
    this.formSettingMatrixB = this.formBuilder.group({
      rows: [2],
      cols: [2],
    });
    this.formMatrixOperation = this.formBuilder.group({
      matrixOperation: [''],
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

    this.listMatrixOperation = this.configService.getOperations();

    this.updateElementMatrix();
    this.addRealTimeSanitization(this.formMatrixA);
    this.addRealTimeSanitization(this.formMatrixB);
  }

  addRealTimeSanitization(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((rowKey) => {
      const rowGroup = formGroup.get(rowKey) as FormGroup;
      Object.keys(rowGroup.controls).forEach((colKey) => {
        const control = rowGroup.get(colKey) as AbstractControl;
        control.valueChanges.subscribe((value: any) => {
          if (value) {
            // Remove invalid characters
            let sanitizedValue = value.replace(/[^0-9\/.-]/g, '');

            // Handle '-' at the beginning and remove any subsequent '-'
            if (sanitizedValue.startsWith('-')) {
              sanitizedValue = '-' + sanitizedValue.slice(1).replace(/-/g, '');
            } else {
              sanitizedValue = sanitizedValue.replace(/-/g, '');
            }

            // Ensure only one instance of '/', '.', or '-'
            sanitizedValue = sanitizedValue.replace(
              /[\/.-]+/g,
              (match: string) => match.charAt(0)
            );

            // Set the sanitized value
            control.setValue(sanitizedValue, { emitEvent: false });
          }
        });
      });
    });
  }

  resetMatrixValue(): void {
    this.isShowResult = false;
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

  selectmatrixOperation(matrixOperation: string) {
    this.setElementMatrix('A', this.rowsMatrixA, this.colsMatrixA);
    this.setElementMatrix('B', this.rowsMatrixB, this.colsMatrixB);
    this.executematrixOperation(matrixOperation as MatrixOperationType);
    this.scrollToSection();
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

  executematrixOperation(matrixOperation: MatrixOperationType) {
    this.isLoading = true;
    this.matrixOperation = matrixOperation;
    switch (matrixOperation) {
      case 'MULTIPLY_A':
        this.isHideSteps = false;
        this.operator = UnaryOperators.Multiply;
        this.multiply(this.matrixA, this.matrixA);
        break;
      case 'DET_A':
        this.isHideSteps = false;
        this.operator = UnaryOperators.Empty;
        this.determinan(this.matrixA);
        break;
      case 'TRANSPOSE_A':
        this.isHideSteps = false;
        this.operator = UnaryOperators.Empty;
        this.transpose(this.matrixA);
        break;
      case 'INVERS_A':
        this.invers(this.matrixA);
        break;
      case 'MULTIPLY_B':
        this.isHideSteps = false;
        this.operator = UnaryOperators.Multiply;
        this.multiply(this.matrixB, this.matrixB);
        break;
      case 'DET_B':
        this.isHideSteps = false;
        this.operator = UnaryOperators.Empty;
        this.determinan(this.matrixB);
        break;
      case 'TRANSPOSE_B':
        this.isHideSteps = false;
        this.operator = UnaryOperators.Empty;
        this.transpose(this.matrixB);
        break;
      case 'INVERS_B':
        this.invers(this.matrixB);
        break;
      case 'MULTIPLY_A_B':
        this.isHideSteps = false;
        this.operator = UnaryOperators.Multiply;
        this.multiply(this.matrixA, this.matrixB);
        break;
      case 'ADD_A_B':
        this.operator = UnaryOperators.Plus;
        this.isHideSteps = false;
        this.add(this.matrixA, this.matrixB);
        break;
      case 'REDUCE_A_B':
        this.operator = UnaryOperators.Minus;
        this.isHideSteps = false;
        this.reduce(this.matrixA, this.matrixB);
        break;
      case 'REDUCE_B_A':
        this.operator = UnaryOperators.Minus;
        this.isHideSteps = false;
        this.reduce(this.matrixB, this.matrixA);
        break;
      case 'INVERS_A_MULTIPLY_B':
        this.operator = UnaryOperators.Multiply;
        this.inversAndMultiply(this.matrixA, this.matrixB);
        break;
      case 'INVERS_B_MULTIPLY_A':
        this.operator = UnaryOperators.Multiply;
        this.inversAndMultiply(this.matrixB, this.matrixA);
        break;
    }
  }

  multiply(matrix1: number[][], matrix2: number[][]) {
    if (matrix1[0].length != matrix2.length) {
      this.isError = true;
      this.errorMessage = `Tidak dapat melakukan operasi ${this.matrixOperation}, jumlah kolom matrix pertama tidak sama dengan jumlah baris matrix kedua`;
    } else {
      this.isError = false;
      this.validateEmptyElement(matrix1);
      this.validateEmptyElement(matrix2);
      this.matrix1 = matrix1.map((rowValue) =>
        rowValue.map((colValue) =>
          this.convertFractionToNumber(colValue.toString())
        )
      );
      this.matrix2 = matrix2.map((rowValue) =>
        rowValue.map((colValue) =>
          this.convertFractionToNumber(colValue.toString())
        )
      );
      this.result = [];
      this.steps = [];
      this.determinantResult = [];
      this.determinantSteps = [];
      for (let i = 0; i < matrix1.length; i++) {
        this.result[i] = [];
        this.steps[i] = [];
        for (let j = 0; j < matrix1.length; j++) {
          let tempResAdd: number = 0;
          const tempSteps: string[] = [];
          for (let k = 0; k < matrix1[i].length; k++) {
            matrix1[i][k] = this.convertFractionToNumber(
              matrix1[i][k].toString()
            );
            matrix2[k][j] = this.convertFractionToNumber(
              matrix2[k][j].toString()
            );
            tempResAdd += matrix1[i][k] * matrix2[k][j];

            const tempConvertNumToFract1 =
              this.numberToFractionServcie.numberToFraction(matrix1[i][k]);
            const tempConvertNumToFract2 =
              this.numberToFractionServcie.numberToFraction(matrix2[k][j]);
            tempSteps.push(
              `(${tempConvertNumToFract1} * ${tempConvertNumToFract2})`
            );
          }
          if (Number.isNaN(tempResAdd)) {
            continue;
          }
          this.result[i].push(tempResAdd);
          this.steps[i].push(`(${tempSteps.join(' + ')})`);
        }
      }
    }
    this.isShowResult = true;
    this.isLoading = false;
  }

  determinan(matrix: number[][]): number {
    if (matrix.length != matrix[0].length) {
      this.isError = true;
      this.errorMessage = `Tidak dapat melakukan operasi ${this.matrixOperation}, bukan matrix persegi`;
      return 0;
    } else {
      this.isError = false;
      this.validateEmptyElement(matrix);
      this.matrix1 = matrix.map((rowValue) =>
        rowValue.map((colValue) =>
          this.convertFractionToNumber(colValue.toString())
        )
      );

      this.matrix2 = [];
      this.result = [];
      this.steps = [];
      this.determinantResult = [];
      this.determinantSteps = [];

      if (matrix.length <= 3) {
        this.determinantSarrus(matrix);
      } else {
        this.determinantResult = [];

        const n = matrix.length;
        let det: number = 1;
        let swapCount = 0;

        const mat = matrix.map((row) => row.slice());

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
    }

    this.isShowResult = true;
    this.isLoading = false;
    return this.determinantResult[0];
  }

  transpose(matrix: number[][]) {
    this.isError = false;

    const rows = matrix.length;
    const cols = matrix[0].length;

    this.validateEmptyElement(matrix);

    this.matrix1 = matrix.map((rowValue) =>
      rowValue.map((colValue) =>
        this.convertFractionToNumber(colValue.toString())
      )
    );
    this.matrix2 = [];
    this.result = [];
    this.steps = [];
    this.determinantResult = [];
    this.determinantSteps = [];

    const transposed: number[][] = Array.from({ length: cols }, () => []);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        transposed[j][i] = matrix[i][j];
      }
    }

    this.steps = transposed.map((rowsValue) =>
      rowsValue.map((colValue) => colValue.toString())
    );
    this.result = transposed;
    this.isShowResult = true;
    this.isLoading = false;
  }

  invers(matrix: number[][]): number[][] {
    this.isError = false;
    return matrix;
  }

  add(matrix1: number[][], matrix2: number[][]) {
    if (matrix1.length != matrix2.length) {
      this.isError = true;
      this.errorMessage = `Tidak dapat melakukan operasi ${this.matrixOperation}, jumlah baris dan kolom matrix pertama tidak sama dengan matrix kedua`;
    } else {
      this.isError = false;
      this.validateEmptyElement(matrix1);
      this.validateEmptyElement(matrix2);
      this.matrix1 = matrix1.map((rowValue) =>
        rowValue.map((colValue) =>
          this.convertFractionToNumber(colValue.toString())
        )
      );
      this.matrix2 = matrix2.map((rowValue) =>
        rowValue.map((colValue) =>
          this.convertFractionToNumber(colValue.toString())
        )
      );
      this.result = [];
      this.steps = [];
      this.determinantResult = [];
      this.determinantSteps = [];
      for (let i = 0; i < matrix1.length; i++) {
        const rows: number[] = [];
        const tempSteps: string[] = [];
        for (let j = 0; j < matrix1[i].length; j++) {
          matrix1[i][j] = this.convertFractionToNumber(
            matrix1[i][j].toString()
          );
          matrix2[i][j] = this.convertFractionToNumber(
            matrix2[i][j].toString()
          );

          const tempElementRows: number =
            Number(matrix1[i][j]) + Number(matrix2[i][j]);

          const tempConvertNumToFract1 =
            this.numberToFractionServcie.numberToFraction(matrix1[i][j]);
          const tempConvertNumToFract2 =
            this.numberToFractionServcie.numberToFraction(matrix2[i][j]);
          tempSteps.push(
            `(${tempConvertNumToFract1} + ${tempConvertNumToFract2})`
          );
          rows.push(tempElementRows);
        }
        this.result.push(rows);
        this.steps.push(tempSteps);
      }
    }

    this.isShowResult = true;
    this.isLoading = false;
  }

  reduce(matrix1: number[][], matrix2: number[][]) {
    if (matrix1.length != matrix2.length) {
      this.isError = true;
      this.errorMessage = `Tidak dapat melakukan operasi ${this.matrixOperation}, jumlah baris dan kolom matrix pertama tidak sama dengan matrix kedua`;
    } else {
      this.isError = false;
      this.validateEmptyElement(matrix1);
      this.validateEmptyElement(matrix2);
      this.matrix1 = matrix1.map((rowValue) =>
        rowValue.map((colValue) =>
          this.convertFractionToNumber(colValue.toString())
        )
      );
      this.matrix2 = matrix2.map((rowValue) =>
        rowValue.map((colValue) =>
          this.convertFractionToNumber(colValue.toString())
        )
      );
      this.result = [];
      this.steps = [];
      this.determinantResult = [];
      this.determinantSteps = [];
      for (let i = 0; i < matrix1.length; i++) {
        const rows: number[] = [];
        const tempSteps: string[] = [];
        for (let j = 0; j < matrix1[i].length; j++) {
          matrix1[i][j] = this.convertFractionToNumber(
            matrix1[i][j].toString()
          );
          matrix2[i][j] = this.convertFractionToNumber(
            matrix2[i][j].toString()
          );

          const tempElementRows: number =
            Number(matrix1[i][j]) - Number(matrix2[i][j]);

          const tempConvertNumToFract1 =
            this.numberToFractionServcie.numberToFraction(matrix1[i][j]);
          const tempConvertNumToFract2 =
            this.numberToFractionServcie.numberToFraction(matrix2[i][j]);
          tempSteps.push(
            `(${tempConvertNumToFract1} - ${tempConvertNumToFract2})`
          );
          rows.push(tempElementRows);
        }
        this.result.push(rows);
        this.steps.push(tempSteps);
      }
    }
    this.isShowResult = true;
    this.isLoading = false;
  }

  inversAndMultiply(matrix1: number[][], matrix2: number[][]) {
    const invers = this.invers(matrix1);
    this.multiply(invers, matrix2);
  }

  determinantSarrus(matrix: number[][]) {
    this.determinantResult = [];
    this.determinantSteps = [];

    // for matrix 2x2
    if (matrix.length === 2 && matrix[0].length === 2) {
      let firstDiagonal = 1;
      let secondDiagonal = 1;
      let tempFirstDiagonal: string[] = [];
      let tempSecondDiagonal: string[] = [];
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          matrix[i][j] = this.convertFractionToNumber(matrix[i][j].toString());

          if (i == j) {
            const tempConvertNumToFract =
              this.numberToFractionServcie.numberToFraction(matrix[i][j]);
            tempFirstDiagonal.push(tempConvertNumToFract);
            firstDiagonal *= matrix[i][j];
          }
          if (i != j) {
            const tempConvertNumToFract =
              this.numberToFractionServcie.numberToFraction(matrix[i][j]);
            tempSecondDiagonal.push(tempConvertNumToFract);
            secondDiagonal *= matrix[i][j];
          }
        }
      }
      const tempStepsFirstDiagonal = `(${tempFirstDiagonal.join(' * ')})`;
      const tempStepsSecondDiagonal = `(${tempSecondDiagonal.join(' * ')})`;

      const tempConvertNumToFractFirstDiagonal =
        this.numberToFractionServcie.numberToFraction(firstDiagonal);
      const tempConvertNumToFractSecondDiagonal =
        this.numberToFractionServcie.numberToFraction(secondDiagonal);

      this.determinantSteps.push(
        `${tempStepsFirstDiagonal} - ${tempStepsSecondDiagonal} = ${tempConvertNumToFractFirstDiagonal} - ${tempConvertNumToFractSecondDiagonal}`
      );
      this.determinantResult.push(firstDiagonal - secondDiagonal);
    }

    // for matrix 3x3
    if (matrix.length === 3 && matrix[0].length === 3) {
      let tempFirstDiagonal: string[] = [];
      let tempSecondDiagonal: string[] = [];
      let determinant = 0;
      let tempCalculateFirstDiagonal = 0;
      let tempCalculateSecondDiagonal = 0;

      for (let i = 0; i < 3; i++) {
        const tempConvertNumToFract1 =
          this.numberToFractionServcie.numberToFraction(matrix[0][i]);
        const tempConvertNumToFract2 =
          this.numberToFractionServcie.numberToFraction(matrix[1][(i + 1) % 3]);
        const tempConvertNumToFract3 =
          this.numberToFractionServcie.numberToFraction(matrix[2][(i + 2) % 3]);

        const tempStepsFirstDiagonal = `(${tempConvertNumToFract1} * ${tempConvertNumToFract2} * ${tempConvertNumToFract3})`;

        tempFirstDiagonal.push(tempStepsFirstDiagonal);

        determinant +=
          matrix[0][i] * matrix[1][(i + 1) % 3] * matrix[2][(i + 2) % 3];
        tempCalculateFirstDiagonal +=
          matrix[0][i] * matrix[1][(i + 1) % 3] * matrix[2][(i + 2) % 3];
      }

      for (let i = 0; i < 3; i++) {
        const tempConvertNumToFract1 =
          this.numberToFractionServcie.numberToFraction(matrix[0][i]);
        const tempConvertNumToFract2 =
          this.numberToFractionServcie.numberToFraction(matrix[1][(i + 2) % 3]);
        const tempConvertNumToFract3 =
          this.numberToFractionServcie.numberToFraction(matrix[2][(i + 1) % 3]);

        const tempStepsSecondDiagonal = `(${tempConvertNumToFract1} * ${tempConvertNumToFract2} * ${tempConvertNumToFract3})`;

        tempSecondDiagonal.push(tempStepsSecondDiagonal);

        determinant -=
          matrix[0][i] * matrix[1][(i + 2) % 3] * matrix[2][(i + 1) % 3];

        const tempResultMultiply =
          matrix[0][i] * matrix[1][(i + 2) % 3] * matrix[2][(i + 1) % 3];

        tempCalculateSecondDiagonal += tempResultMultiply;
      }

      const tempConvertNumToFractFirstDiagonal =
        this.numberToFractionServcie.numberToFraction(
          tempCalculateFirstDiagonal
        );
      const tempConvertNumToFractSecondDiagonal =
        this.numberToFractionServcie.numberToFraction(
          tempCalculateSecondDiagonal
        );

      const tempDeterminantSteps = `(${tempFirstDiagonal.join(
        ' + '
      )}) - (${tempSecondDiagonal.join(
        ' + '
      )}) = ${tempConvertNumToFractFirstDiagonal} - ${tempConvertNumToFractSecondDiagonal}`;

      this.determinantSteps.push(tempDeterminantSteps);
      this.determinantResult.push(determinant);
    }

    this.isShowResult = true;
    this.isLoading = false;
  }

  handleModalClose(isError: boolean): void {
    this.isError = isError;
    this.resetMatrixValue();
    this.scrollToTop();
  }

  scrollToSection() {
    this.resultSection.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  convertFractionToNumber(value: string): number {
    let result: number = 0;
    if (value.includes('/')) {
      const fractionValue = new Fraction(value);
      result = (fractionValue.s * fractionValue.n) / fractionValue.d;
    }
    return result ? result : Number(value);
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.htmlSanitizerService.sanitizeHtml(html);
  }

  validateEmptyElement(matrix: number[][]): void {
    const flatMatrix = matrix.flat();
    const emptyElements = flatMatrix.filter(
      (element) => element.toString() === ''
    );

    if (emptyElements.length > 0) {
      this.isError = true;
      this.errorMessage = `Elemen tidak boleh kosong`;
    }
  }

  getLabelByValue(value: string): string {
    return this.configService.getLabelByValue(value);
  }
}
