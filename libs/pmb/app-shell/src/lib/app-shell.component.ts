import {
  ChangeDetectionStrategy,
  Component,
  Pipe,
  inject,
  signal,
  PipeTransform,
  Type,
} from '@angular/core';
import { CommonModule, CurrencyPipe, JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { EMPTY, concatMap, filter, take } from 'rxjs';
import { IncomeListComponent } from '@snardev-clones/pmb/shared/ui/income-list';
import { ExpenseListComponent } from '@snardev-clones/pmb/shared/ui/expense-list';
import {
  Expense,
  Income,
  Money,
  ExpenseCategories,
  expenseCategories,
} from '@snardev-clones/pmb/shared/models';
import { FormsModule } from '@angular/forms';
import { dashboardSignalStore } from './dashboard.store';
import { DashboardService } from './dashboard.service';
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
  viewProviders: [CurrencyPipe, dashboardSignalStore, DashboardService],
})
export class AppShellComponent {
  #dialog = inject(Dialog);
  store = inject(dashboardSignalStore);

  private openDialog(
    component: Type<unknown>,
    data: {
      title: string;
      payload: Income | (Expense & { categories: ExpenseCategories[] });
    }
  ) {
    return this.#dialog.open(component, {
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
    const ref = this.openDialog(ManageIncomeComponent, {
      title: 'Add income',
      payload: income,
    });

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((result) => {
          this.store.saveIncome(result as Income);
          return EMPTY;
        })
      )
      .subscribe();
  }

  editIncome(income: Income) {
    const ref = this.openDialog(ManageIncomeComponent, {
      title: 'Edit income',
      payload: income,
    });

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((result) => {
          this.store.saveIncome(result as Income);
          return EMPTY;
        })
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
    const ref = this.openDialog(ManageExpenseComponent, {
      title: 'Add expense',
      payload: {
        ...expense,
        categories: expenseCategories,
      },
    });

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((result) => {
          this.store.saveExpense(result as Expense);
          return EMPTY;
        })
      )
      .subscribe();
  }

  editExpense(expense: Expense) {
    const ref = this.openDialog(ManageExpenseComponent, {
      title: 'Edit expense',
      payload: {
        ...expense,
        categories: expenseCategories,
      },
    });

    ref.closed
      .pipe(
        take(1),
        filter(Boolean),
        concatMap((result) => {
          this.store.saveExpense(result as Expense);
          return EMPTY;
        })
      )
      .subscribe();
  }

  removeExpense(id: string) {
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
        concatMap((result) => {
          this.store.removeExpense(result as string);
          return EMPTY;
        })
      )
      .subscribe();
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
        concatMap((result) => {
          this.store.removeIncome(result as string);
          return EMPTY;
        })
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

@Component({
  template: `
    <h2>{{ dialogData.title }}</h2>
    <div>
      <form #expenseForm="ngForm">
        <div>
          <label for="category">Category</label>
          <select name="category" [ngModel]="viewModel().category">
            @for(category of viewModel().categories; track category) {
            <option [value]="category">
              {{ category }}
            </option>

            }
          </select>
        </div>
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
          (click)="saveExpense(expenseForm.value)"
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, JsonPipe],
})
export class ManageExpenseComponent {
  dialogData = inject(DIALOG_DATA);
  dialogRef = inject(DialogRef);

  viewModel = signal({
    categories: [] as ExpenseCategories[],
    category: '',
    description: '',
    projectedAmount: 0,
    actualAmount: 0,
  });

  constructor() {
    this.viewModel.update((vm) => ({
      ...vm,
      categories: this.dialogData.payload.categories,
      category: this.dialogData.payload.category,
      description: this.dialogData.payload.description,
      projectedAmount: this.dialogData.payload.projected.amount,
      actualAmount: this.dialogData.payload.actual.amount,
    }));
  }

  saveExpense(expenseFormData: {
    category: string;
    description: string;
    projectedAmount: number;
    actualAmount: number;
  }) {
    // validate here

    const expense: Expense = {
      ...this.dialogData.payload,
      category: expenseFormData.category,
      description: expenseFormData.description,
      projected: {
        ...this.dialogData.payload.projected,
        amount: expenseFormData.projectedAmount,
      },
      actual: {
        ...this.dialogData.payload.actual,
        amount: expenseFormData.actualAmount,
      },
      difference: {
        ...this.dialogData.payload.projected,
        amount: expenseFormData.projectedAmount - expenseFormData.actualAmount,
      },
    };

    this.dialogRef.close(expense);
  }
}
