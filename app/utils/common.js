import { TOTAL_FUTURE_WEEKS } from '../constants/constants';

// Calculate total effort from weekly columns
export const calculateTotalEffort = row => {
  return Object.keys(row)
    .filter(key => key.startsWith('W')) // Filter weekly columns
    .reduce((sum, weekKey) => {
      const weekValue = row[weekKey];
      const numericValue =
        typeof weekValue === 'object' && weekValue !== null
          ? parseFloat(weekValue.value || 0)
          : parseFloat(weekValue || 0);
      return sum + numericValue;
    }, 0);
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
 * Checks whether the given date falls within the previous week, current week,
 * or one of the next 20 weeks (making a total of 22 weeks including the previous week).
 * @param {Date | string} date - The date to check. Can be a Date object or a string in a date format.
 * @returns {boolean} - Returns true if the date is in the previous week, current week, or next 20 weeks, false otherwise.
 */
export const isWithin20WeeksRange = date => {
  const givenDate = new Date(date).setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay();
  const startOfCurrentWeek = new Date(today);
  startOfCurrentWeek.setDate(
    today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
  );

  const startOfPreviousWeek = new Date(startOfCurrentWeek);
  startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

  const endOfNext20Weeks = new Date(startOfCurrentWeek);
  endOfNext20Weeks.setDate(
    startOfCurrentWeek.getDate() + TOTAL_FUTURE_WEEKS * 7
  );

  return givenDate >= startOfPreviousWeek && givenDate <= endOfNext20Weeks;
};

/**
 * Get the Monday date of a given week number in the current year,
 * where week 1 starts from January 1st.
 * @param {string} weekStr - A string representing the week number, e.g. "W1".
 * @returns {string} - The Monday date of the given week in YYYY-MM-DD format.
 */
export const getMondayOfWeek = weekStr => {
  const weekNumber = parseInt(weekStr?.replace('W', ''), 10);

  const currentYear = new Date().getFullYear();

  const januaryFirst = new Date(currentYear, 0, 1);

  const weekMonday = new Date(januaryFirst);
  weekMonday.setDate(januaryFirst.getDate() + (weekNumber - 1) * 7);

  const dayOfWeek = weekMonday.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekMonday.setDate(weekMonday.getDate() + diffToMonday);

  return weekMonday.toLocaleDateString('en-CA');
};

/**
 * Checks whether the given string is a valid UUID.
 * @param {string} uuid - UUID string to test.
 * @returns {boolean} - Boolean true or false against the UUID string.
 */
export const isValidUUID = uuid => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Get the project Id based on the project name.
 * @param {Array} projects - The array of project objects.
 * @param {string} projectName - The name of the project to find.
 * @returns {string|null} - The Id of the project if found, otherwise null.
 */
export const getProjectIdByName = (projects, projectName) => {
  const project = projects.find(proj => proj.Name === projectName);

  return project ? project.Id : null;
};

/**
 * Checks if a resource is present for a specific project.
 *
 * @param {Array<Object>} data - The array of project-resource objects.
 * @param {string} projectName - The name of the project to check.
 * @param {string} resourceName - The name of the resource to check.
 * @return {boolean} - Returns true if the resource is found in the project, otherwise false.
 */
export const isResourceInProject = (data, projectName, resourceName) => {
  return data.some(
    item => item.project === projectName && item.resource === resourceName
  );
};

export const isResourceInTeam = (rows, team, resourceName) => {
  return rows.some(row => row.teams === team && row.resource === resourceName);
};

export const getInitialsColor = name => {
  const colors = [
    '#816CB3',
    '#B56A9B',
    '#4779CD',
    '#6BB6B2',
    '#DD5091',
    '#828F95',
    '#7B90DE',
    '#E59D6D',
  ];

  // Generate a hash from the name to pick a color
  const hash =
    name && name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};
