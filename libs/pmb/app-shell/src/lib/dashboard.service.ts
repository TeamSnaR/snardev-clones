import { Injectable } from '@angular/core';
import { Budget } from '@snardev-clones/pmb/shared/models';
import { EMPTY, Observable, of } from 'rxjs';

@Injectable()
export class DashboardService {
  readonly #budget = {
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
    ],
  };
  getBudget(): Observable<Budget> {
    return of(this.#budget);
  }

  saveIncome(): Observable<void> {
    return EMPTY;
  }

  removeIncome(): Observable<void> {
    return EMPTY;
  }

  saveExpense(): Observable<void> {
    return EMPTY;
  }

  removeExpense(): Observable<void> {
    return EMPTY;
  }
}
