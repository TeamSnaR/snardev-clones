import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { concatMap, delay, filter, of, take, tap } from 'rxjs';
import { IncomeListComponent } from '@snardev-clones/pmb/shared/ui/income-list';
import { ExpenseListComponent } from '@snardev-clones/pmb/shared/ui/expense-list';
import { Budget, Expense, Income } from '@snardev-clones/pmb/shared/models';

@Injectable()
export class BudgetService {
  budget = signal<Budget>({
    id: '1',
    date: new Date(2023, 10),
    projected: {
      amount: 100,
      currency: 'GBP',
    },
    actual: {
      amount: 100,
      currency: 'GBP',
    },
    difference: {
      amount: 0,
      currency: 'GBP',
    },
    incomes: [
      {
        id: '1',
        projected: {
          amount: 100,
          currency: 'GBP',
        },
        actual: {
          amount: 80,
          currency: 'GBP',
        },
        difference: {
          amount: 20,
          currency: 'GBP',
        },
        description: 'Salary',
      },
    ],
    expenses: [
      {
        id: '1',
        category: 'Housing',
        projected: {
          amount: 100,
          currency: 'GBP',
        },
        actual: {
          amount: 90,
          currency: 'GBP',
        },
        difference: {
          amount: 0,
          currency: 'GBP',
        },
        description: 'Rent',
      },
      // {
      //   id: '2',
      //   category: 'Housing',
      //   projected: {
      //     amount: 100,
      //     currency: 'GBP',
      //   },
      //   actual: {
      //     amount: 90,
      //     currency: 'GBP',
      //   },
      //   difference: {
      //     amount: 0,
      //     currency: 'GBP',
      //   },
      //   description: 'Mortgage',
      // },
      // {
      //   id: '3',
      //   category: 'Housing',
      //   projected: {
      //     amount: 100,
      //     currency: 'GBP',
      //   },
      //   actual: {
      //     amount: 90,
      //     currency: 'GBP',
      //   },
      //   difference: {
      //     amount: 0,
      //     currency: 'GBP',
      //   },
      //   description: 'Council Tax',
      // },
      {
        id: '4',
        category: 'Utilities',
        projected: {
          amount: 100,
          currency: 'GBP',
        },
        actual: {
          amount: 90,
          currency: 'GBP',
        },
        difference: {
          amount: 0,
          currency: 'GBP',
        },
        description: 'Electricity',
      },
      // {
      //   id: '5',
      //   category: 'Utilities',
      //   projected: {
      //     amount: 100,
      //     currency: 'GBP',
      //   },
      //   actual: {
      //     amount: 90,
      //     currency: 'GBP',
      //   },
      //   difference: {
      //     amount: 0,
      //     currency: 'GBP',
      //   },
      //   description: 'Gas',
      // },
      // {
      //   id: '6',
      //   category: 'Utilities',
      //   projected: {
      //     amount: 100,
      //     currency: 'GBP',
      //   },
      //   actual: {
      //     amount: 90,
      //     currency: 'GBP',
      //   },
      //   difference: {
      //     amount: 0,
      //     currency: 'GBP',
      //   },
      //   description: 'Water',
      // },
      // {
      //   id: '7',
      //   category: 'Utilities',
      //   projected: {
      //     amount: 100,
      //     currency: 'GBP',
      //   },
      //   actual: {
      //     amount: 90,
      //     currency: 'GBP',
      //   },
      //   difference: {
      //     amount: 0,
      //     currency: 'GBP',
      //   },
      //   description: 'Internet',
      // },
    ],
  });

  projection = computed(() => {
    const totalProjectedIncome =
      this.budget()?.incomes.reduce(
        (acc, income) => acc + income.projected.amount,
        0
      ) ?? 0;
    const totalProjectedExpenses =
      this.budget()?.expenses.reduce(
        (acc, expense) => acc + expense.projected.amount,
        0
      ) ?? 0;
    const totalProjection = totalProjectedIncome - totalProjectedExpenses;
    const badge = totalProjection > 0 ? 'surplus' : 'deficit';

    return {
      totalProjectedIncome,
      totalProjectedExpenses,
      totalProjection,
      badge,
    };
  });

  actual = computed(() => {
    const totalActualIncome =
      this.budget()?.incomes.reduce(
        (acc, income) => acc + income.actual.amount,
        0
      ) ?? 0;
    const totalActualExpenses =
      this.budget()?.expenses.reduce(
        (acc, expense) => acc + expense.actual.amount,
        0
      ) ?? 0;
    const totalActual = totalActualIncome - totalActualExpenses;
    const badge = totalActual > 0 ? 'surplus' : 'deficit';
    return {
      totalActualIncome,
      totalActualExpenses,
      totalActual,
      badge,
    };
  });

  balanceDifference = computed(() => {
    return {
      total: this.actual().totalActual - this.projection().totalProjection,
    };
  });

  addIncome(income: Income) {
    return this.#saveIncome(income);
  }

  editIncome(income: Income) {
    return this.#saveIncome(income);
  }

  #saveIncome(income: Income) {
    return of(income).pipe(
      tap(() => console.log(JSON.stringify(income), ' saved')),
      delay(1000),
      tap((income) =>
        this.budget.update((budget) => ({
          ...budget,
          incomes: [...budget.incomes, income],
        }))
      )
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
      delay(1000),
      tap((expense) => {
        this.budget.update((budget) => ({
          ...budget,
          expenses: [...budget.expenses, expense],
        }));
      })
    );
  }

  removeExpense(id: string) {
    return of(id).pipe(
      tap(() => console.log(id, ' removed')),
      delay(1000)
    );
  }
}

@Component({
  selector: 'pmb-app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IncomeListComponent,
    ExpenseListComponent,
  ],
  templateUrl: './app-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [BudgetService],
})
export class AppShellComponent {
  #dialog = inject(Dialog);
  #budgetService = inject(BudgetService);

  viewModel = {
    budget: this.#budgetService.budget,
    projection: this.#budgetService.projection,
    actual: this.#budgetService.actual,
    balanceDifference: this.#budgetService.balanceDifference,
  };

  private openDialog(data: Income | Expense) {
    return this.#dialog.open(EditDialogComponent, {
      data: data,
    });
  }

  addIncome() {
    const income: Income = {
      id: Math.random().toString(),
      projected: {
        amount: Math.floor(Math.random() * 100) + 1,
        currency: 'GBP',
      },
      actual: {
        amount: Math.floor(Math.random() * 100) + 1,
        currency: 'GBP',
      },
      difference: {
        amount: 0,
        currency: 'GBP',
      },
      description: '',
    };
    const ref = this.openDialog(income);

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((result) => this.#budgetService.addIncome(result as Income))
      )
      .subscribe();
  }

  addExpense() {
    const expense: Expense = {
      id: Math.random().toString(),
      category: '',
      projected: {
        amount: Math.floor(Math.random() * 100) + 1,
        currency: 'GBP',
      },
      actual: {
        amount: Math.floor(Math.random() * 100) + 1,
        currency: 'GBP',
      },
      difference: {
        amount: 0,
        currency: 'GBP',
      },
      description: '',
    };
    const ref = this.openDialog(expense);

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((result) => this.#budgetService.addExpense(result as Expense))
      )
      .subscribe();
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
export class EditDialogComponent {
  dialogData = inject(DIALOG_DATA);
  dialogRef = inject(DialogRef);
}
