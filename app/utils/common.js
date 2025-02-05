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
  return weeklyEfforts.reduce((total, effort) => total + (effort || 0), 0);
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
