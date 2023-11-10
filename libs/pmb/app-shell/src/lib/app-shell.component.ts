import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export type Expense = {
  category: string;
  projected: number;
  actual: number;
};

export type ExpenseWithDifference = Expense & {
  difference: number;
};
export type Income = {
  category: string;
  projected: number;
  actual: number;
};
export type IncomeWithDifference = Income & {
  difference: number;
};

@Component({
  selector: 'pmb-app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-shell.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  expenses = signal([] as ExpenseWithDifference[]);
  incomes = signal([] as IncomeWithDifference[]);

  projectedIncome = computed(() => {
    return this.incomes().reduce(
      (total, income) => total + income.projected,
      0
    );
  });

  actualIncome = computed(() => {
    return this.incomes().reduce((total, income) => total + income.actual, 0);
  });

  differenceIncome = computed(() => {
    return this.actualIncome() - this.projectedIncome();
  });

  projectedExpenses = computed(() => {
    return this.expenses().reduce(
      (total, expense) => total + expense.projected,
      0
    );
  });

  actualExpenses = computed(() => {
    return this.expenses().reduce(
      (total, expense) => total + expense.actual,
      0
    );
  });

  differenceExpenses = computed(() => {
    return this.actualExpenses() - this.projectedExpenses();
  });

  projectedBalance = computed(() => {
    return this.projectedIncome() - this.projectedExpenses();
  });

  actualBalance = computed(() => {
    return this.actualIncome() - this.actualExpenses();
  });

  actualProjectedBalance = computed(() => {
    return this.actualBalance() - this.projectedBalance();
  });

  constructor() {
    effect(
      () => {
        this.incomes.set([
          {
            category: 'Salary',
            projected: 100,
            actual: 100,
            difference: 0,
          },
        ]);

        this.expenses.set([
          {
            category: 'Rent',
            projected: 100,
            actual: 100,
            difference: 0,
          },
          {
            category: 'Food',
            projected: 100,
            actual: 100,
            difference: 0,
          },
          {
            category: 'Entertainment',
            projected: 100,
            actual: 100,
            difference: 0,
          },
        ]);
      },
      { allowSignalWrites: true }
    );
  }

  addIncome() {
    const randomIncome: Income = {
      category: 'Dividend',
      projected: Math.random() * 100,
      actual: Math.random() * 100,
    };

    const randomIncomeWithDifference: IncomeWithDifference = {
      ...randomIncome,
      difference: randomIncome.actual - randomIncome.projected,
    };

    this.incomes.update((incomes) => [...incomes, randomIncomeWithDifference]);
  }

  addExpense() {
    const randomExpense: Expense = {
      category: 'Groceries',
      projected: Math.random() * 100,
      actual: Math.random() * 100,
    };

    const randomExpenseWithDifference: ExpenseWithDifference = {
      ...randomExpense,
      difference: randomExpense.actual - randomExpense.projected,
    };

    this.expenses.update((expenses) => [
      ...expenses,
      randomExpenseWithDifference,
    ]);
  }
}
