export function transformJson(pageType, apiData) {
  const demoRows = [];

  if (pageType === 'role') {
    apiData?.organizations?.forEach((org) => {
      org.resources?.forEach((resource) => {
        resource.projects?.forEach((project) => {
          const weeklyHours = {};
          let totalEffort = 0;

          if (resource.weeklyHours) {
            Object.entries(resource.weeklyHours).forEach(([week, hours]) => {
              const weekKey = week.replace(/\s+/g, "_");
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
export const calculateTotalEffort = (row) => {
  const weeklyEfforts = Object.keys(row)
    .filter(key => key.startsWith('W'))
    .map(key => row[key]);
  return weeklyEfforts.reduce((total, effort) => total + (effort || 0), 0);
};