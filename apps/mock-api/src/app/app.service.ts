import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  #budget = {
    id: '1abc',
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
        id: '1xyz',
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
        id: '1dde',
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

  saveIncome(saveIncomeDto: {
    id: string;
    projected: {
      amount: number;
      currency: string;
    };
    actual: {
      amount: number;
      currency: string;
    };
    difference: {
      amount: number;
      currency: string;
    };
    description: string;
  }) {
    const existingIndex = this.#budget.incomes.findIndex(
      (f) => f.id === saveIncomeDto.id
    );

    if (existingIndex > -1) {
      this.#budget.incomes[existingIndex] = saveIncomeDto;
    } else {
      this.#budget.incomes.push(saveIncomeDto);
    }
    return { id: saveIncomeDto.id };
  }

  removeIncome(id: string) {
    this.#budget.incomes = this.#budget.incomes.filter((f) => f.id !== id);
  }

  saveExpense(saveExpenseDto: {
    id: string;
    category: string;
    projected: { amount: number; currency: string };
    actual: { amount: number; currency: string };
    difference: { amount: number; currency: string };
    description: string;
  }) {
    const existingIndex = this.#budget.expenses.findIndex(
      (expense) => expense.id === saveExpenseDto.id
    );

    if (existingIndex > -1) {
      this.#budget.expenses[existingIndex] = saveExpenseDto;
    } else {
      this.#budget.expenses.push(saveExpenseDto);
    }

    return { id: saveExpenseDto.id };
  }
}
