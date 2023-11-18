import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'pmb-expense-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './expense-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseListComponent {
  expenses: {
    list: Record<
      string,
      {
        id: string;
        category: string;
        projected: number;
        actual: number;
        difference: number;
      }[]
    >;
    keys: string[];
  } = {
    list: {},
    keys: [],
  };

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input({ required: true, alias: 'expenses' }) set _expenses(
    value: {
      id: string;
      category: string;
      projected: number;
      actual: number;
      difference: number;
    }[]
  ) {
    const expensesByCategory = value.reduce(
      (acc, expense) => {
        if (!acc.list[expense.category]) {
          acc.list[expense.category] = [];
        }

        if (!acc.keys.includes(expense.category)) {
          acc.keys.push(expense.category);
        }
        acc.list[expense.category].push(expense);

        return acc;
      },
      { list: {}, keys: [] } as {
        list: Record<
          string,
          {
            id: string;
            category: string;
            projected: number;
            actual: number;
            difference: number;
          }[]
        >;
        keys: string[];
      }
    );
    this.expenses = expensesByCategory;
  }
  @Output() removeExpense = new EventEmitter<string>();
}
