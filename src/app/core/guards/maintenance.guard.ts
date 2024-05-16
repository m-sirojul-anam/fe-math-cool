import { CanActivateFn } from '@angular/router';

export const maintenanceGuard: CanActivateFn = (route, state) => {
  return true;
};
