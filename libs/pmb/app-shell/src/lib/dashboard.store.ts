import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Budget, Expense, Income } from '@snardev-clones/pmb/shared/models';
import { delay, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

const initialState: Budget = {
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
};
export const dashboardSignalStore = signalStore(
  withState<Budget>(initialState),
  withComputed((state) => ({
    projection: computed(() => {
      const totalProjectedIncome = state.incomes().reduce(
        (acc, income) => ({
          ...acc,
          amount: acc.amount + income.projected.amount,
        }),
        {
          amount: 0,
          currency: 'GBP',
        }
      );
      const totalProjectedExpenses = state.expenses().reduce(
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
    }),
    actual: computed(() => {
      const totalActualIncome = state.incomes().reduce(
        (acc, income) => ({
          ...acc,
          amount: acc.amount + income.actual.amount,
        }),
        {
          amount: 0,
          currency: 'GBP',
        }
      );
      const totalActualExpenses = state.expenses().reduce(
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
    }),
    groupedExpenses: computed(() => {
      const groupedExpenses = state.expenses().reduce(
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
    }),
  })),
  withComputed(({ projection, actual }) => ({
    balanceDifference: computed(() => ({
      total: {
        ...actual().totalActual,
        amount:
          actual().totalActual.amount - projection().totalProjection.amount,
      },
    })),
  })),
  withComputed(({ balanceDifference, projection, actual }) => ({
    colors: computed(() => {
      return {
        projection:
          projection().badge === 'surplus'
            ? 'text-green-600'
            : projection().badge === 'balanced'
            ? 'text-gray-700'
            : 'text-red-600',
        actual:
          actual().badge === 'surplus'
            ? 'text-green-600'
            : actual().badge === 'balanced'
            ? 'text-gray-700'
            : 'text-red-600',
        balance:
          balanceDifference().total.amount > 0
            ? 'text-green-600'
            : balanceDifference().total.amount > 0
            ? 'text-gray-700'
            : 'text-red-600',
      };
    }),
  })),
  withMethods(({ ...store }) => ({
    saveIncome: rxMethod<Income>(
      pipe(
        tap((income) => console.log(JSON.stringify(income), ' saved')),
        delay(1000),
        tap((income: Income) => {
          const index = store.incomes().findIndex((i) => i.id === income.id);

          if (index === -1) {
            patchState(store, { incomes: [...store.incomes(), income] });
          } else {
            const incomes = store.incomes();
            incomes[index] = income;
            patchState(store, { incomes: [...incomes] });
          }
        })
      )
    ),
    removeIncome: rxMethod<string>(
      pipe(
        tap((id) => console.log(id, ' removed')),
        delay(1000),
        tap((id) =>
          patchState(store, {
            incomes: store.incomes().filter((income) => income.id !== id),
          })
        )
      )
    ),
    saveExpense: rxMethod<Expense>(
      pipe(
        tap((expense) => console.log(JSON.stringify(expense), ' saved')),
        delay(1000),
        tap((expense: Expense) => {
          const index = store.expenses().findIndex((e) => e.id === expense.id);

          if (index === -1) {
            patchState(store, {
              expenses: [...store.expenses(), expense],
            });
          } else {
            const expenses = store.expenses();
            expenses[index] = expense;
            patchState(store, { expenses: [...expenses] });
          }
        })
      )
    ),
    removeExpense: rxMethod<string>(
      pipe(
        tap((id) => console.log(id, ' removed')),
        delay(1000),
        tap((id) =>
          patchState(store, {
            expenses: store.expenses().filter((expense) => expense.id !== id),
          })
        )
      )
    ),
  }))
);
