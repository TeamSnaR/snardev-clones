import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('budget')
  getBudget() {
    return this.appService.getBudget();
  }

  @Post('budget/incomes')
  saveIncome(
    @Body()
    saveIncomeDto: {
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
    }
  ) {
    return this.appService.saveIncome(saveIncomeDto);
  }

  @Delete('budget/incomes/:id')
  removeIncome(@Param('id') id: string) {
    return this.appService.removeIncome(id);
  }

  @Post('budget/expenses')
  saveExpense(
    @Body()
    saveExpenseDto: {
      id: string;
      category: string;
      projected: { amount: number; currency: string };
      actual: { amount: number; currency: string };
      difference: { amount: number; currency: string };
      description: string;
    }
  ) {
    return this.appService.saveExpense(saveExpenseDto);
  }

  @Delete('budget/expenses/:id')
  removeExpense(@Param('id') id: string) {
    return this.appService.removeExpense(id);
  }
}
