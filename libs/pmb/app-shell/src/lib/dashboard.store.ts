import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Budget, Expense, Income } from '@snardev-clones/pmb/shared/models';
import { concatMap, delay, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { DashboardService } from './dashboard.service';
import { tapResponse } from '@ngrx/operators';

const initialState: Budget = {
  id: '',
  projected: {
    amount: 0,
    currency: '',
  },
  actual: {
    amount: 0,
    currency: '',
  },
  difference: {
    amount: 0,
    currency: '',
  },
  incomes: [],
  expenses: [],
  date: new Date(),
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
  withMethods((store, dashboardService = inject(DashboardService)) => ({
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
    getBudget: rxMethod<void>(
      pipe(
        concatMap(() =>
          dashboardService.getBudget().pipe(
            tapResponse({
              next: (budget) => {
                patchState(store, { ...budget });
              },
              error: (error) => {
                console.warn(error);
              },
              finalize: () => {},
            })
          )
        )
      )
    ),
  })),
  withHooks({
    onInit({ getBudget }) {
      getBudget();
    },
  })
);
