export interface MatricesModel {}

export type OperationType =
  | 'MULTIPLY_A'
  | 'DET_A'
  | 'DET_A'
  | 'TRANSPOSE_A'
  | 'INVERS_A'
  | 'MULTIPLY_B'
  | 'DET_B'
  | 'TRANSPOSE_B'
  | 'INVERS_B'
  | 'MULTIPLY_A_B'
  | 'ADD_A_B'
  | 'REDUCE_A_B'
  | 'REDUCE_B_A'
  | 'INVERS_A_MULTIPLY_B'
  | 'INVERS_B_MULTIPLY_A';
