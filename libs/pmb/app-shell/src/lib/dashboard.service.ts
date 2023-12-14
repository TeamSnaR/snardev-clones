import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Budget } from '@snardev-clones/pmb/shared/models';
import { EMPTY, Observable } from 'rxjs';

@Injectable()
export class DashboardService {
  httpClient = inject(HttpClient);
  getBudget(): Observable<Budget> {
    return this.httpClient.get<Budget>('api/budget');
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
