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
                // Convert week format if necessary (e.g., "Jan W1" -> "W1")
                const weekKey = week.replace(/\s+/g, "_"); // Standardize week key format
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