import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppShellComponent } from '@snardev-clones/pmb/app-shell';

@Component({
  standalone: true,
  imports: [AppShellComponent, RouterModule],
  selector: 'pmb-root',
  template: ` <pmb-app-shell></pmb-app-shell> `,
  styles: [''],
})
export class AppComponent {
  title = 'personal-monthly-budget';
}
