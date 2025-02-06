export function transformJson(pageType, apiData) {
  const demoRows = [];

  if (pageType === 'role') {
    apiData?.organizations?.forEach(org => {
      org.resources?.forEach(resource => {
        resource.projects?.forEach(project => {
          const weeklyHours = {};
          let totalEffort = 0;

          if (resource.weeklyHours) {
            Object.entries(resource.weeklyHours).forEach(([week, hours]) => {
              const weekKey = week.replace(/\s+/g, '_');
              weeklyHours[weekKey] = hours;
              totalEffort += hours;
            });
          }

          demoRows.push({
            id: crypto.randomUUID(),
            project,
            orgName: org.name,
            resource: resource.name,
            totalEffort,
            ...weeklyHours,
            hasButton: false,
          });
        });
      });
    });
  }

  return demoRows;
}

// Calculate total effort from weekly columns
export const calculateTotalEffort = row => {
  const weeklyEfforts = Object.keys(row)
    .filter(key => key.startsWith('W'))
    .map(key => row[key]);
  return weeklyEfforts.reduce(
    (total, effort) => total + (effort.value || 0),
    0
  );
};

/**
 * Calculates the week number for a given date.
 * @param {Date} date - The date for which to calculate the week number.
 * @returns {String} - The calculated week number in the format "W{number}".
 */
export const getWeekNumber = date => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear + 86400000) / 86400000;
  return `W${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay()) / 7)}`;
};

/**
 * Checks whether the given date falls within the current week or the previous week.
 * @param {Date | string} date - The date to check. Can be a Date object or a string in a date format.
 * @returns {boolean} - Returns true if the date is in the current or previous week, false otherwise.
 */
export const isCurrentOrPreviousWeek = date => {
  const givenDate = new Date(date);
  const today = new Date();

  const startOfCurrentWeek = new Date(
    today.setDate(today.getDate() - today.getDay() + 1)
  );

  const startOfPreviousWeek = new Date(
    new Date(startOfCurrentWeek).setDate(startOfCurrentWeek.getDate() - 7)
  );

  const endOfCurrentWeek = new Date(startOfCurrentWeek);
  endOfCurrentWeek.setDate(endOfCurrentWeek.getDate() + 6);

  return (
    (givenDate >= startOfPreviousWeek && givenDate < startOfCurrentWeek) ||
    (givenDate >= startOfCurrentWeek && givenDate <= endOfCurrentWeek)
  );
};
