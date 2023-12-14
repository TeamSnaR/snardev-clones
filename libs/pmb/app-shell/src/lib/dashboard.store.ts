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
import { concatMap, delay, map, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { DashboardService } from './dashboard.service';
import { tapResponse } from '@ngrx/operators';

type DashboardState = {
  budget: Budget;
  loading: boolean;
};
const DEFAULT_BUDGET: Budget = {
  id: '',
  incomes: [],
  expenses: [],
  date: new Date(),
  projected: {
    amount: 0.0,
    currency: 'GBP',
  },
  actual: {
    amount: 0.0,
    currency: 'GBP',
  },
  difference: {
    amount: 0.0,
    currency: 'GBP',
  },
};
const INITIAL_STATE: DashboardState = {
  budget: DEFAULT_BUDGET,
  loading: true,
};
export const dashboardSignalStore = signalStore(
  withState<DashboardState>(INITIAL_STATE),
  withComputed(({ budget }) => ({
    projection: computed(() => {
      const totalProjectedIncome = budget().incomes.reduce(
        (acc, income) => ({
          ...acc,
          amount: acc.amount + income.projected.amount,
        }),
        {
          amount: 0,
          currency: 'GBP',
        }
      );
      const totalProjectedExpenses = budget().expenses.reduce(
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
      const incomes = budget()?.incomes ?? [];
      const expenses = budget()?.expenses ?? [];
      const totalActualIncome = incomes.reduce(
        (acc, income) => ({
          ...acc,
          amount: acc.amount + income.actual.amount,
        }),
        {
          amount: 0,
          currency: 'GBP',
        }
      );
      const totalActualExpenses = expenses.reduce(
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
      const groupedExpenses = budget().expenses.reduce(
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
        concatMap((income) =>
          dashboardService
            .saveIncome(income)
            .pipe(map((id: string) => ({ ...income, id })))
        ),
        tapResponse({
          next: (income: Income) => {
            const index = store
              .budget()
              .incomes.findIndex((i) => i.id === income.id);
            console.log('index: ', income);
            if (index === -1) {
              patchState(store, {
                budget: {
                  ...store.budget(),
                  incomes: [...store.budget().incomes, income],
                },
              });
            } else {
              store.budget().incomes[index] = income;
              patchState(store, {
                budget: {
                  ...store.budget(),
                  incomes: [...store.budget().incomes],
                },
              });
            }
          },
          error: (error) => {
            console.warn(error);
          },
          finalize: () => {
            patchState(store, { loading: false });
          },
        })
      )
    ),
    removeIncome: rxMethod<string>(
      pipe(
        tap((id) => console.log(id, ' removed')),
        delay(1000),
        tap((id) => {
          const incomes = store.budget().incomes ?? [];

          patchState(store, {
            budget: {
              ...store.budget(),
              incomes: incomes.filter((income) => income.id !== id),
            },
          });
        })
      )
    ),
    saveExpense: rxMethod<Expense>(
      pipe(
        tap((expense) => console.log(JSON.stringify(expense), ' saved')),
        delay(1000),
        tap((expense: Expense) => {
          const index = store
            .budget()
            .expenses.findIndex((e) => e.id === expense.id);

          if (index === -1) {
            patchState(store, {
              budget: {
                ...store.budget(),
                expenses: [...store.budget().expenses, expense],
              },
            });
          } else {
            store.budget().expenses[index] = expense;
            patchState(store, {
              budget: {
                ...store.budget()!,
                expenses: [...store.budget().expenses],
              },
            });
          }
        })
      )
    ),
    removeExpense: rxMethod<string>(
      pipe(
        tap((id) => {
          console.log(id, ' removed');
          patchState(store, { loading: true });
        }),
        delay(1000),
        tapResponse({
          next: (id) => {
            const expenses = store.budget().expenses ?? [];
            patchState(store, {
              budget: {
                ...store.budget()!,
                expenses: expenses.filter((expense) => expense.id !== id),
              },
            });
          },
          error: (error) => {
            console.warn(error);
          },
          finalize: () => {
            patchState(store, { loading: false });
          },
        })
      )
    ),
    getBudget: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        concatMap(() =>
          dashboardService.getBudget().pipe(
            tapResponse({
              next: (budget) => {
                console.log(budget);
                patchState(store, { budget });
              },
              error: (error) => {
                console.warn(error);
              },
              finalize: () => {
                patchState(store, { loading: false });
              },
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
