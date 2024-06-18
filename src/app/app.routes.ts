import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/matrices/matrices.component').then(
        (c) => c.MatricesComponent
      ),
  },
];
