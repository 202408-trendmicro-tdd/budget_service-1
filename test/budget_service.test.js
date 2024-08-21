const dayjs = require('dayjs');

class BudgetService {
  totalAmount(start, end) {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    let totalAmount = 0;

    if (endDate.isBefore(startDate)) {
      return 0;
    }

    let currentMonth = startDate.startOf('month');

    while (currentMonth.isBefore(endDate) || currentMonth.isSame(endDate, 'month')) {
      let budget = budgets.find(budget => budget.yearMonth === currentMonth.format('YYYYMM'));

      if (budget !== undefined) {
        if (startDate.format('YYYYMM') === endDate.format('YYYYMM')) {
          // if (currentMonth.isSame(startDate, 'month') && currentMonth.isSame(endDate, 'month')) {
          let day_diff = endDate.diff(startDate, 'day') + 1;
          let days_in_month = currentMonth.daysInMonth();
          totalAmount += (day_diff * budget.amount) / days_in_month;
        } else if (currentMonth.isSame(startDate, 'month')) {
          let startMonthDaysUsed = currentMonth.daysInMonth() - startDate.date() + 1;
          totalAmount += (startMonthDaysUsed * budget.amount) / currentMonth.daysInMonth();
        } else if (currentMonth.isSame(endDate, 'month')) {
          let endMonthDaysUsed = endDate.date();
          totalAmount += (endMonthDaysUsed * budget.amount) / currentMonth.daysInMonth();
        } else {
          totalAmount += budget.amount;
        }
      }

      currentMonth = currentMonth.add(1, 'month');
    }

    return totalAmount;
  }
}

class Budget {
  constructor(yearMonth, amount) {
    this.yearMonth = yearMonth;
    this.amount = amount;
  }
}

const budgets = [new Budget('202312', 310), new Budget('202402', 2900), new Budget('202406', 30000000), new Budget('202407', 3100), new Budget('202408', 31), new Budget('202409', 300000)];
describe('budget_service query', () => {
  it('api test', () => {

    expect(dayjs('20240720').diff(dayjs('20240720'), 'day')).toBe(0);
    expect(dayjs('20240720').diff(dayjs('20240716'), 'day')).toBe(4);
    expect(dayjs('20240716').daysInMonth()).toBe(31);
  });
  let service = new BudgetService();
  it('same month', () => {
    expect(service.totalAmount('20240721', '20240720')).toBe(0);
    expect(service.totalAmount('20240720', '20240720')).toBe(100);
    expect(service.totalAmount('20240720', '20240721')).toBe(200);
    expect(service.totalAmount('20240701', '20240731')).toBe(3100);
    // expect(service.totalAmount('20240720', '20240731')).toBe(0);
  });
  it('cross month', () => {
    expect(service.totalAmount('20240731', '20240801')).toBe(101);
    expect(service.totalAmount('20240701', '20240802')).toBe(3102);
    expect(service.totalAmount('20240701', '20240831')).toBe(3131);
    expect(service.totalAmount('20240701', '20240901')).toBe(13131);
    expect(service.totalAmount('20240601', '20240731')).toBe(30003100);
  });
  it('cross month exist no data', () => {
    expect(service.totalAmount('20240901', '20241030')).toBe(300000);
    expect(service.totalAmount('20240501', '20240630')).toBe(30000000);
    expect(service.totalAmount('20240411', '20240530')).toBe(0);
    expect(service.totalAmount('20241010', '20241111')).toBe(0);
    expect(service.totalAmount('20240101', '20241231')).toBe(30306031);
  });
  it('cross year', () => {
    expect(service.totalAmount('20231201', '20240131')).toBe(310);
    expect(service.totalAmount('20231221', '20240220')).toBe(2110);
  });
});