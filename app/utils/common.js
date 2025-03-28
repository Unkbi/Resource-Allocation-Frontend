import { addDays, format, startOfWeek, subDays, weeksToDays } from 'date-fns';
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
export const getStartOfPreviousWeek = date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff - 7);
  return d;
};

export const addWeeks = (date, weeks) => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
};

export const getWeeksDifference = (startDate, endDate) => {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor((endDate - startDate) / msPerWeek);
};

export const formatDate = (date, dateFormat) => {
  return date.toLocaleDateString('en-US', {
    month: dateFormat.includes('MMM') ? 'short' : 'numeric',
    year: 'numeric',
  });
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
export const isWithin20WeeksRange = (date) => {
  const givenDate = new Date(date); // new date object from the given date
  givenDate.setUTCHours(0, 0, 0, 0); // set time to the start of day (UTC) to avoid timezone issues

  // helper to calculate the monday of a given date's week (UTC based)
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getUTCDay(); // get the current day of the week (0 = sunday, 1 = monday, ...)
    const diff = day === 0 ? -6 : 1 - day; // if sunday (0), move back 6 days otherwise move to the most recent monday
    date.setUTCDate(date.getUTCDate() + diff); // adjust to monday
    return date;
  };

  // creates a new date that represents midnight UTC of current local date
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  // determine the monday of the current week
  const startOfCurrentWeek = getMonday(today);

  // determine the monday of the previous week by subtracting 7 days
  const startOfPreviousWeek = new Date(startOfCurrentWeek);
  startOfPreviousWeek.setUTCDate(startOfCurrentWeek.getUTCDate() - 7);

  const endOfNext20Weeks = new Date(startOfCurrentWeek);
  endOfNext20Weeks.setUTCDate(startOfCurrentWeek.getUTCDate() + (TOTAL_FUTURE_WEEKS * 7));

  // convert given date to its week's monday for consistent comparisons
  const givenTime = getMonday(givenDate).getTime();
  const startTime = startOfPreviousWeek.getTime();
  const endTime = endOfNext20Weeks.getTime();
  // true if the given date falls within the range of the previous week, current week, or next 20 weeks
  return givenTime >= startTime && givenTime <= endTime;
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

export function generateAllMondays(startDate, endDate) {
  const mondays = [];
  const currentDate = new Date(startDate);
  if (currentDate.getDay() !== 1) {
    currentDate.setDate(
      currentDate.getDate() + ((1 - currentDate.getDay() + 7) % 7)
    );
  }
  while (currentDate <= new Date(endDate)) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    mondays.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return mondays;
}

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
 * Get the project or team Id based on the project or team name.
 * @param {Array} arr - The array of project or teams objects.
 * @param {string} name - The name of the project or team to find.
 * @returns {string|null} - The Id of the project or team if found, otherwise null.
 */
export const getProjectOrTeamIdByName = (arr, name) => {
  const projectOrTeam = arr.find(proj => proj.Name === name);

  return projectOrTeam ? projectOrTeam.Id : null;
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

/**
 * Removes duplicate resources from an array based on a unique combination of FullName and Id.
 *
 * @param {Array} arr - The array of objects where each object contains `FullName` and `Id`.
 * @returns {Array} A new array with duplicate objects removed.
 */
export const removeDuplicateResources = arr => {
  const seen = new Set();

  return arr.filter(item => {
    const identifier = `${item.FullName}${item.Id}`;
    if (seen.has(identifier)) {
      return false;
    }
    seen.add(identifier);
    return true;
  });
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

export const generateAllWeeks = () => {
  const weeks = [];
  const today = new Date();
  const currentDay = today.getDay();

  // Find current week Monday
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - ((currentDay + 6) % 7));
  startDate.setHours(0, 0, 0, 0);

  // Generate 22 weeks total: previous week + current week + next 20 weeks
  for (let i = -1; i <= 20; i++) {
    const weekDate = new Date(startDate);
    weekDate.setDate(startDate.getDate() + i * 7);
    weeks.push(getWeekNumber(weekDate));
  }

  return weeks;
};

// Function to generate a random color in hex format
export const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const getInitials = (fullName) => {
  if (!fullName) return 'MJ';
  // Split the full name by spaces
  const nameParts = fullName?.trim()?.split(' ');

  // Extract the first letter of each part of the name
  const initials = nameParts?.map(part => part.charAt(0).toUpperCase()).join('');

  return initials;
};

export const getMonday = (date) => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

/**
 * Returns the first and last month/year of the 22-week period.
 * @returns {{first: string, last: string}} - Object containing first and last month/year strings.
 */
export const generateFirstAndLastMonthYear = (start, dateFormat, currentDate = false, previousStartDate = false) => {
  let today = start ? new Date(start) : new Date();
  if (currentDate) {
    const currentDateMonday = getMonday(today);
    return format(currentDateMonday, dateFormat);
  }
  if (previousStartDate) {
    const previousMonday = getMonday(subDays(today, weeksToDays(TOTAL_FUTURE_WEEKS)));
    return format(previousMonday, dateFormat);
  }
  const futureDateMonday = getMonday(addDays(today, weeksToDays(TOTAL_FUTURE_WEEKS)));
  return format(futureDateMonday, dateFormat);
};

export const getStartAndEndDateForView = (view, projectsCalendar, teamsCalendar) => {
  let startDate, endDate;
  if (view === 'Teams') {
    startDate = teamsCalendar.startDate;
    endDate = teamsCalendar.endDate;
  } else {
    startDate = projectsCalendar.startDate;
    endDate = projectsCalendar.endDate;
  }
  return { startDate, endDate };
};