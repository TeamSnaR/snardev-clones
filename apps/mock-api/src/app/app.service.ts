import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  #budget = {
    id: '1',
    date: new Date(2023, 10),
    projected: {
      amount: 0,
      currency: 'GBP',
    },
    actual: {
      amount: 0,
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
          amount: 150,
          currency: 'GBP',
        },
        actual: {
          amount: 120,
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
  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  getBudget() {
    return this.#budget;
  }
}
