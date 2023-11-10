import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
  standalone: true,
  imports: [NxWelcomeComponent, RouterModule],
  selector: 'pmb-root',
  template: `<pmb-nx-welcome></pmb-nx-welcome> <router-outlet></router-outlet>`,
  styles: [''],
})
export class AppComponent {
  title = 'personal-monthly-budget';
}
