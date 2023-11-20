import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  Pipe,
  computed,
  inject,
  signal,
  PipeTransform,
} from '@angular/core';
import { CommonModule, CurrencyPipe, JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { concatMap, delay, filter, of, take, tap } from 'rxjs';
import { IncomeListComponent } from '@snardev-clones/pmb/shared/ui/income-list';
import { ExpenseListComponent } from '@snardev-clones/pmb/shared/ui/expense-list';
import {
  Budget,
  Expense,
  Income,
  Money,
} from '@snardev-clones/pmb/shared/models';
import { FormsModule } from '@angular/forms';
@Pipe({
  name: 'currencyExtended',
  pure: true,
  standalone: true,
})
export class CurrencyExtendedPipe implements PipeTransform {
  currencyPipe = inject(CurrencyPipe);
  transform(value: Money) {
    return this.currencyPipe.transform(value.amount, value.currency);
  }
}
@Injectable()
export class DashboardPresenter {
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
          amount: 100,
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
          amount: 50,
          currency: 'GBP',
        },
        actual: {
          amount: 50,
          currency: 'GBP',
        },
        difference: {
          amount: 0,
          currency: 'GBP',
        },
        description: 'Rent',
      },
      {
        id: '3',
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
        description: 'Council Tax',
      },
      {
        id: '4',
        category: 'Utilities',
        projected: {
          amount: 50,
          currency: 'GBP',
        },
        actual: {
          amount: 40,
          currency: 'GBP',
        },
        difference: {
          amount: 0,
          currency: 'GBP',
        },
        description: 'Electricity',
      },
      {
        id: '5',
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
        description: 'Gas',
      },
      {
        id: '6',
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
        description: 'Water',
      },
    ],
  });

  projection = computed(() => {
    const totalProjectedIncome = this.budget()?.incomes.reduce(
      (acc, income) => ({
        ...acc,
        amount: acc.amount + income.projected.amount,
      }),
      {
        amount: 0,
        currency: 'GBP',
      }
    );
    const totalProjectedExpenses = this.budget()?.expenses.reduce(
      (acc, expense) => ({
        ...acc,
        amount: acc.amount + expense.projected.amount,
      }),
      {
        amount: 0,
        currency: 'GBP',
      }
    );
    const totalProjection = {
      amount: totalProjectedIncome.amount - totalProjectedExpenses.amount,
      currency: 'GBP',
    };
    const badge =
      totalProjection.amount > 0
        ? 'surplus'
        : totalProjection.amount === 0
        ? 'balanced'
        : 'deficit';

    return {
      totalProjectedIncome,
      totalProjectedExpenses,
      totalProjection,
      badge,
    };
  });

  actual = computed(() => {
    const totalActualIncome = this.budget()?.incomes.reduce(
      (acc, income) => ({
        ...acc,
        amount: acc.amount + income.actual.amount,
      }),
      {
        amount: 0,
        currency: 'GBP',
      }
    );
    const totalActualExpenses = this.budget()?.expenses.reduce(
      (acc, expense) => ({
        ...acc,
        amount: acc.amount + expense.actual.amount,
      }),
      {
        amount: 0,
        currency: 'GBP',
      }
    );
    const totalActual = {
      amount: totalActualIncome.amount - totalActualExpenses.amount,
      currency: 'GBP',
    };
    const badge =
      totalActual.amount > 0
        ? 'surplus'
        : totalActual.amount === 0
        ? 'balanced'
        : 'deficit';
    return {
      totalActualIncome,
      totalActualExpenses,
      totalActual,
      badge,
    };
  });

  balanceDifference = computed(() => {
    return {
      total: {
        amount:
          this.actual().totalActual.amount -
          this.projection().totalProjection.amount,
        currency: 'GBP',
      },
    };
  });

  colors = computed(() => {
    return {
      projection:
        this.projection().badge === 'surplus'
          ? 'text-green-600'
          : this.projection().badge === 'balanced'
          ? 'text-gray-700'
          : 'text-red-600',
      actual:
        this.actual().badge === 'surplus'
          ? 'text-green-600'
          : this.actual().badge === 'balanced'
          ? 'text-gray-700'
          : 'text-red-600',
      balance:
        this.balanceDifference().total.amount > 0
          ? 'text-green-600'
          : this.balanceDifference().total.amount > 0
          ? 'text-gray-700'
          : 'text-red-600',
    };
  });

  groupedExpenses = computed(() => {
    const groupedExpenses = this.budget().expenses.reduce(
      (acc, expense) => {
        if (!acc.categories.includes(expense.category)) {
          acc.categories.push(expense.category);
        }

        if (!acc.expenses.has(expense.category)) {
          acc.expenses.set(expense.category, []);
        }

        acc.expenses.get(expense.category)?.push(expense);

        return acc;
      },
      { categories: [] as string[], expenses: new Map<string, Expense[]>() }
    );

    return {
      categories: groupedExpenses.categories,
      expenses: groupedExpenses.expenses,
    };
  });

  viewModel = {
    budget: this.budget,
    groupedExpenses: this.groupedExpenses,
    projection: this.projection,
    actual: this.actual,
    balanceDifference: this.balanceDifference,
    colors: this.colors,
  };

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
        this.budget.update((budget) => {
          const index = budget.incomes.findIndex((i) => i.id === income.id);
          if (index > -1) {
            budget.incomes[index] = income;
          } else {
            budget.incomes = [...budget.incomes, income];
          }
          return {
            ...budget,
          };
        })
      )
    );
  }

  removeIncome(id: string) {
    return of(id).pipe(
      tap(() => console.log(id, ' removed')),
      delay(1000),
      tap((id) =>
        this.budget.update((budget) => ({
          ...budget,
          incomes: budget.incomes.filter((income) => income.id !== id),
        }))
      )
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
    CurrencyExtendedPipe,
  ],
  templateUrl: './app-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [DashboardPresenter, CurrencyPipe],
})
export class AppShellComponent {
  #dialog = inject(Dialog);
  #budgetService = inject(DashboardPresenter);

  viewModel = this.#budgetService.viewModel;

  private openDialog(data: { title: string; payload: Income | Expense }) {
    return this.#dialog.open(ManageIncomeComponent, {
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
      description: 'Dividend',
    };
    const ref = this.openDialog({
      title: 'Add income',
      payload: income,
    });

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((result) => this.#budgetService.addIncome(result as Income))
      )
      .subscribe();
  }

  editIncome(income: Income) {
    const ref = this.openDialog({
      title: 'Edit income',
      payload: income,
    });

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((result) => this.#budgetService.editIncome(result as Income))
      )
      .subscribe();
  }

  addExpense() {
    const expense: Expense = {
      id: Math.random().toString(),
      category: 'Entertainment',
      description: 'Spotify',
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
    };
    const ref = this.openDialog({
      title: 'Add expense',
      payload: expense,
    });

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((result) => this.#budgetService.addExpense(result as Expense))
      )
      .subscribe();
  }

  removeExpense(id: string) {
    console.log(id);
  }
  removeIncome(id: string) {
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
        concatMap((result) =>
          this.#budgetService.removeIncome(result as string)
        )
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
    <h2>{{ dialogData.title }}</h2>
    <div>
      <form #incomeForm="ngForm">
        <div>
          <label for="description">Description</label>
          <input
            type="text"
            name="description"
            [ngModel]="viewModel().description"
          />
        </div>
        <div>
          <label for="projected">Projected</label>
          <input
            type="number"
            name="projectedAmount"
            [ngModel]="viewModel().projectedAmount"
          />
        </div>
        <div>
          <label for="actual">Actual</label>
          <input
            type="number"
            name="actualAmount"
            [ngModel]="viewModel().actualAmount"
          />
        </div>
      </form>
    </div>
    <div class="flex justify-end">
      <div class="space-x-4">
        <button
          type="button"
          class="rounded-md bg-yellow-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
          (click)="saveIncome(incomeForm.value)"
        >
          Save
        </button>
        <button
          type="button"
          (click)="dialogRef.close()"
          class="rounded-md bg-yellow-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
        >
          Cancel
        </button>
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
  imports: [JsonPipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageIncomeComponent {
  dialogData = inject(DIALOG_DATA);
  dialogRef = inject(DialogRef);

  viewModel = signal({
    description: '',
    projectedAmount: 0,
    actualAmount: 0,
  });

  constructor() {
    this.viewModel.update((vm) => ({
      ...vm,
      description: this.dialogData.payload.description,
      projectedAmount: this.dialogData.payload.projected.amount,
      actualAmount: this.dialogData.payload.actual.amount,
    }));
  }

  saveIncome(data: {
    description: string;
    projectedAmount: number;
    actualAmount: number;
  }) {
    // validate here

    const income: Income = {
      ...this.dialogData.payload,
      description: data.description,
      projected: {
        ...this.dialogData.payload.projected,
        amount: data.projectedAmount,
      },
      actual: {
        ...this.dialogData.payload.actual,
        amount: data.actualAmount,
      },
      difference: {
        ...this.dialogData.payload.projected,
        amount: data.projectedAmount - data.actualAmount,
      },
    };

    this.dialogRef.close(income);
  }
}
