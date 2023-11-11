import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { concatMap, delay, filter, of, take, tap } from 'rxjs';

export type Expense = {
  id: string;
  category: string;
  projected: number;
  actual: number;
};

export type ExpenseWithDifference = Expense & {
  difference: number;
};
export type Income = {
  id: string;
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
  #dialog = inject(Dialog);
  #budgetService = inject(BudgetService);
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
        // this.incomes.set([
        //   {
        //     id: '1',
        //     category: 'Salary',
        //     projected: 100,
        //     actual: 100,
        //     difference: 0,
        //   },
        // ]);

        this.expenses.set([
          {
            id: '1',
            category: 'Rent',
            projected: 100,
            actual: 100,
            difference: 0,
          },
          {
            id: '2',
            category: 'Food',
            projected: 100,
            actual: 100,
            difference: 0,
          },
          {
            id: '3',
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
    const ref = this.openDialog({
      id: Math.random().toString(36).substring(2, 15),
      category: 'Dividend',
      projected: Math.random() * 100,
      actual: Math.random() * 100,
    });

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((data) => this.#budgetService.addIncome(data as Income))
      )
      .subscribe((data) => {
        const randomIncome = data as Income;
        const randomIncomeWithDifference: IncomeWithDifference = {
          ...randomIncome,
          difference: randomIncome.actual - randomIncome.projected,
        };

        this.incomes.update((incomes) => [
          ...incomes,
          randomIncomeWithDifference,
        ]);
      });
  }

  editIncome(income: IncomeWithDifference) {
    const ref = this.openDialog(income);

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((data) => this.#budgetService.editIncome(data as Income))
      )
      .subscribe((data) => {
        const updatedIncome = data as IncomeWithDifference;
        this.incomes.update((incomes) =>
          incomes.map((i) =>
            i.id === updatedIncome.id
              ? { ...updatedIncome, projected: updatedIncome.projected + 2 }
              : i
          )
        );
      });
  }

  private openDialog(data: unknown) {
    return this.#dialog.open(EditIncomeDialogComponent, {
      data: data,
    });
  }

  addExpense() {
    const randomExpense: Expense = {
      id: Math.random().toString(36).substring(2, 15),
      category: 'Groceries',
      projected: Math.random() * 100,
      actual: Math.random() * 100,
    };

    const ref = this.openDialog(randomExpense);
    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((data) => this.#budgetService.addExpense(data as Expense))
      )
      .subscribe((data) => {
        const randomExpense = data as Expense;
        const randomExpenseWithDifference: ExpenseWithDifference = {
          ...randomExpense,
          difference: randomExpense.actual - randomExpense.projected,
        };

        this.expenses.update((expenses) => [
          ...expenses,
          randomExpenseWithDifference,
        ]);
      });
  }

  editExpense(expense: ExpenseWithDifference) {
    const ref = this.openDialog(expense);
    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((data) => this.#budgetService.editExpense(data as Expense))
      )
      .subscribe((data) => {
        const updatedExpense = data as ExpenseWithDifference;
        this.expenses.update((expenses) =>
          expenses.map((e) =>
            e.id === updatedExpense.id
              ? { ...updatedExpense, projected: updatedExpense.projected + 2 }
              : e
          )
        );
      });
  }

  deleteExpense(id: string) {
    const ref = this.#dialog.open(AlertComponent, {
      data: {
        id,
        message: 'Are you sure you want to delete this expense?',
      },
    });

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((data) => this.#budgetService.removeExpense(data as string))
      )
      .subscribe((id) => {
        this.expenses.update((expenses) =>
          expenses.filter((expense) => expense.id !== id)
        );
      });
  }

  deleteIncome(id: string) {
    const ref = this.#dialog.open(AlertComponent, {
      data: {
        id,
        message: 'Are you sure you want to delete this income?',
      },
    });

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((data) => this.#budgetService.removeIncome(data as string))
      )
      .subscribe((id) => {
        this.incomes.update((incomes) =>
          incomes.filter((income) => income.id !== id)
        );
      });
  }
}

@Component({
  template: `
    <h2>Delete data</h2>
    <p>
      {{ dialogData.message }}
    </p>
    <div class="flex justify-end">
      <div>
        <button
          type="button"
          class="border bg-red-600"
          (click)="dialogRef.close(dialogData.id)"
        >
          Yes
        </button>
        <button type="button" (click)="dialogRef.close()">No</button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      @apply bg-white p-6;
    }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  dialogData = inject(DIALOG_DATA);
  dialogRef = inject(DialogRef);
}

@Component({
  template: `
    <h2>Edit data</h2>
    <p>
      {{ dialogData | json }}
    </p>
    <div class="flex justify-end">
      <div>
        <button
          type="button"
          class="border"
          (click)="dialogRef.close(dialogData)"
        >
          Save
        </button>
        <button type="button" (click)="dialogRef.close()">Cancel</button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      @apply bg-white p-6;
    }
  `,
  standalone: true,
  imports: [JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditIncomeDialogComponent {
  dialogData = inject(DIALOG_DATA);
  dialogRef = inject(DialogRef);
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
  addIncome(income: Income) {
    return this.#saveIncome(income);
  }

  editIncome(income: Income) {
    return this.#saveIncome(income);
  }

  #saveIncome(income: Income) {
    return of(income).pipe(
      tap(() => console.log(JSON.stringify(income), ' saved')),
      delay(1000)
    );
  }

  removeIncome(id: string) {
    return of(id).pipe(
      tap(() => console.log(id, ' removed')),
      delay(1000)
    );
  }

  addExpense(expense: Expense) {
    return this.#saveExpense(expense);
  }

  editExpense(expense: Expense) {
    return this.#saveExpense(expense);
  }

  #saveExpense(expense: Expense) {
    return of(expense).pipe(
      tap(() => console.log(JSON.stringify(expense), ' saved')),
      delay(1000)
    );
  }

  removeExpense(id: string) {
    return of(id).pipe(
      tap(() => console.log(id, ' removed')),
      delay(1000)
    );
  }
}
