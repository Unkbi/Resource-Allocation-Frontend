export const generateWeekColumns = (startYear:number, endYear:number) => {
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
        type: "number",
      });
      currentDate.setDate(currentDate.getDate() + 7);
    }
  
    return weeks;
  };
  
  const getWeekNumber = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil((days + 1) / 7);
  };
  