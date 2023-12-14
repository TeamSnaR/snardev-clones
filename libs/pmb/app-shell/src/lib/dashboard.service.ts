import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Budget, Income } from '@snardev-clones/pmb/shared/models';
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
