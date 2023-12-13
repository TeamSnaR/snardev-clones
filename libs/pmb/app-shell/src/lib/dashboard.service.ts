import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable()
export class DashboardService {
  getBudget() {
    return of({
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
    });
  }
}
