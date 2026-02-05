export interface DateRange {
  start: string;
  end: string;
}

export const generateWeekColumns = (startYear: number, endYear: number) => {
  const startDate = new Date(startYear, 0, 1); // Jan 1st
  const endDate = new Date(endYear, 11, 31); // Dec 31st
  const weeks = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const weekNumber = getWeekNumber(currentDate);
    weeks.push({
      field: `W${weekNumber}`,
      headerName: `W${weekNumber}`,
      width: 70,
      editable: true,
      type: 'number',
    });
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
};

const getWeekNumber = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getDate() - start.getDate()) / (1000 * 60 * 60 * 24)
  );
  return Math.ceil((days + 1) / 7);
};

/**
 * Calculate date range based on period filter selection in reports and ai summary
 * Returns dates in YYYY-MM-DD format in local timezone
 */
export const calculateDateRange = (
  period: string,
  customStartDate?: string,
  customEndDate?: string
): DateRange => {
  let StartDate: string | undefined;
  let EndDate: string | undefined;
  const today = new Date();

  // Format as YYYY-MM-DD in local time to avoid timezone shifts
  const toISO = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday as first day
    date.setDate(date.getDate() + diff);
    return date;
  };

  const endOfWeek = (monday: Date) => {
    const e = new Date(monday);
    e.setDate(e.getDate() + 6);
    return e;
  };

  const firstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const lastDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

  const firstDayOfQuarter = (d: Date) => {
    const quarterStartMonth = Math.floor(d.getMonth() / 3) * 3; // 0, 3, 6, 9
    return new Date(d.getFullYear(), quarterStartMonth, 1);
  };

  const lastDayOfQuarter = (d: Date) => {
    const quarterStartMonth = Math.floor(d.getMonth() / 3) * 3;
    const nextQuarterStartMonth = quarterStartMonth + 3;
    // Day 0 of next quarter's first month = last day of current quarter
    return new Date(d.getFullYear(), nextQuarterStartMonth, 0);
  };

  const firstDayOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);
  const lastDayOfYear = (d: Date) => new Date(d.getFullYear(), 11, 31);
  
  switch (period) {
    case 'this_week':
    case 'current_week': {
      const mon = getMonday(today);
      StartDate = toISO(mon);
      EndDate = toISO(endOfWeek(mon));
      break;
    }
    case 'last_week': {
      const mon = getMonday(today);
      mon.setDate(mon.getDate() - 7);
      StartDate = toISO(mon);
      EndDate = toISO(endOfWeek(mon));
      break;
    }
    case 'next_week': {
      const mon = getMonday(today);
      mon.setDate(mon.getDate() + 7);
      StartDate = toISO(mon);
      EndDate = toISO(endOfWeek(mon));
      break;
    }
    case 'this_month':
    case 'current_month': {
      const start = firstDayOfMonth(today);
      const end = lastDayOfMonth(today);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'last_month': {
      const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const start = firstDayOfMonth(prev);
      const end = lastDayOfMonth(prev);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'next_month': {
      const next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const start = firstDayOfMonth(next);
      const end = lastDayOfMonth(next);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'this_quarter': {
      const start = firstDayOfQuarter(today);
      const end = lastDayOfQuarter(today);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'last_quarter': {
      const prevQuarterRef = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      const start = firstDayOfQuarter(prevQuarterRef);
      const end = lastDayOfQuarter(prevQuarterRef);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'this_year': {
      const start = firstDayOfYear(today);
      const end = lastDayOfYear(today);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'last_year': {
      const prevYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const start = firstDayOfYear(prevYear);
      const end = lastDayOfYear(prevYear);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'custom': {
      // Support both plain YYYY-MM-DD and full ISO strings, normalizing to local date
      if (customStartDate) {
        StartDate = customStartDate.length > 10 ? toISO(new Date(customStartDate)) : customStartDate;
      }
      if (customEndDate) {
        EndDate = customEndDate.length > 10 ? toISO(new Date(customEndDate)) : customEndDate;
      }
      break;
    }
    default: {
      // Default to current week if period is not recognized
      const mon = getMonday(today);
      StartDate = toISO(mon);
      EndDate = toISO(endOfWeek(mon));
    }
  }

  return {
    start: StartDate || '',
    end: EndDate || '',
  };
};
