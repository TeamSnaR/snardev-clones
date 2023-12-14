import { Body, Controller, Get, Post } from '@nestjs/common';

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
}
