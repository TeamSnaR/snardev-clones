import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'pmb-app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `<h1 class="text-4xl">Personal monthly budget</h1>
    <router-outlet></router-outlet>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {}
