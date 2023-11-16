import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pmb-income-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-list.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeListComponent {
  @Input({ required: true }) incomes: {
    id: string;
    category: string;
    projected: number;
    actual: number;
    difference: number;
  }[] = [];
  @Output() removeIncome = new EventEmitter<string>();
}
