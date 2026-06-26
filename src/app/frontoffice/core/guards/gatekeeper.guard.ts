import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GatekeeperService } from '../services/gatekeeper.service';

export const gatekeeperGuard: CanActivateFn = (route, state) => {
  const gatekeeper = inject(GatekeeperService);
  const router = inject(Router);

  if (gatekeeper.hasValidToken()) {
    return true;
  }

  return router.createUrlTree(['/acceso'], {
    queryParams: { returnUrl: state.url },
  });
};
