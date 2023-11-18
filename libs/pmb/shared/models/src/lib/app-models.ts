export type Money = {
  amount: number;
  currency: string;
};
export type Expense = {
  id: string;
  category: string;
  projected: Money;
  actual: Money;
  difference: Money;
  description: string;
};
export type Income = {
  id: string;
  projected: Money;
  actual: Money;
  difference: Money;
  description: string;
};
export type Budget = {
  id: string;
  projected: Money;
  actual: Money;
  difference: Money;
  incomes: Income[];
  expenses: Expense[];
  date: Date;
};
