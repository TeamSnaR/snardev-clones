import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Budget, Expense, Income } from '@snardev-clones/pmb/shared/models';
import { EMPTY, Observable, map } from 'rxjs';

@Injectable()
export class DashboardService {
  httpClient = inject(HttpClient);
  getBudget(): Observable<Budget> {
    return this.httpClient.get<Budget>('api/budget');
  }

  saveIncome(income: Income): Observable<string> {
    return this.httpClient
      .post<{ id: string }>('api/budget/incomes', income)
      .pipe(map((response: { id: string }) => response.id));
  }

  removeIncome(id: string): Observable<void> {
    return this.httpClient.delete<void>(`api/budget/incomes/${id}`);
  }

  saveExpense(expense: Expense): Observable<string> {
    return this.httpClient
      .post<{ id: string }>('api/budget/expenses', expense)
      .pipe(map((response: { id: string }) => response.id));
  }

  removeExpense(): Observable<void> {
    return EMPTY;
  }
}
