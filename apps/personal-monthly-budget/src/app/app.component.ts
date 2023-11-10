import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent } from '@snardev-clones/pmb/app-shell';

@Component({
  standalone: true,
  imports: [AppShellComponent, RouterOutlet],
  selector: 'pmb-root',
  template: ` <router-outlet></router-outlet> `,
  styles: [''],
})
export class AppComponent {
  title = 'personal-monthly-budget';
}
