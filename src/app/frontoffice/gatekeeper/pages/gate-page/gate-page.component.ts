import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';
import { GatekeeperService } from '../../../core/services/gatekeeper.service';

@Component({
  selector: 'app-gate-page',
  standalone: true,
  imports: [CommonModule, RegisterFormComponent],
  templateUrl: './gate-page.component.html',
  styleUrls: ['./gate-page.component.scss'],
})
export class GatePageComponent implements OnInit {
  private returnUrl = '/';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gatekeeper: GatekeeperService,
  ) {}

  currentYear: number = new Date().getFullYear();

  ngOnInit(): void {
    if (this.gatekeeper.hasValidToken()) {
      this.redirect();
      return;
    }

    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
  }

  onRegistered(): void {
    this.redirect();
  }

  private redirect(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
}
