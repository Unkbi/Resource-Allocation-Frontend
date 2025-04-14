import {
  addDays,
  eachDayOfInterval,
  format,
  getWeek,
  getYear,
  setWeek,
  startOfISOWeek,
  startOfWeek,
  subDays,
  subWeeks,
  weeksToDays,
} from 'date-fns';
import {
  DATE_FORMAT,
  TOTAL_FUTURE_WEEKS,
  TOTAL_FUTURE_WEEKS_ARROW,
} from '../constants/constants';

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
  return `W${getWeek(date, { weekStartsOn: 1 })}`;
};

export const getMondaysInRange = (start, end) => {
  const dates = eachDayOfInterval({
    start,
    end,
  });

  const mondays = new Set(
    dates.map(date => format(startOfISOWeek(date), DATE_FORMAT))
  );

  return Array.from(mondays);
};

/**
 * Get the Monday date of a given week number in the current year,
 * where week 1 starts from January 1st.
 * @param {string} weekNumber - A string representing the week number, e.g. "W1".
 * @returns {string} - The Monday date of the given week in YYYY-MM-DD format.
 */
export const getMondayOfWeek = (weekNumber, date) => {
  const year = getYear(date);
  const firstDayOfYear = new Date(year, 0, 1);
  const weekN =
    typeof weekNumber !== 'number' ? Number(weekNumber.slice(1)) : weekNumber;
  const dateInWeek = setWeek(firstDayOfYear, weekN);
  return format(startOfISOWeek(dateInWeek, { weekStartsOn: 1 }), DATE_FORMAT);
};

export function generateAllMondays(startDate, endDate) {
  const mondays = [];
  const currentDate = new Date(startDate);

  // Set to the previous Monday (or stay if already Monday)
  currentDate.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));

  // If no endDate, return just this Monday
  if (!endDate) {
    mondays.push(formatDates(currentDate));
    return mondays;
  }

  const endDateObj = new Date(endDate);

  // Generate all Mondays in the range
  while (currentDate <= endDateObj) {
    mondays.push(formatDates(currentDate));
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return mondays;
}

function formatDates(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

export const getInitials = fullName => {
  if (!fullName) return 'MJ';
  // Split the full name by spaces
  const nameParts = fullName?.trim()?.split(' ');

  // Extract the first letter of each part of the name
  const initials = nameParts
    ?.map(part => part.charAt(0).toUpperCase())
    .join('');

  return initials;
};

export const getMonday = date => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

export const generateTMinusOneStartEndDate = isStartDate => {
  let today = new Date();
  const lastWeeksMonday = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
  if (isStartDate) {
    return format(lastWeeksMonday, DATE_FORMAT);
  } else {
    const futureDateMonday = getMonday(
      addDays(lastWeeksMonday, weeksToDays(TOTAL_FUTURE_WEEKS))
    );
    return format(futureDateMonday, DATE_FORMAT);
  }
};

export const generateDateWeekMath = (operation, weeks) => {
  let today = new Date();

  let weeksMonday;
  switch (operation) {
    case 'WEEK_MINUS':
      weeksMonday = startOfWeek(subWeeks(today, weeks), { weekStartsOn: 1 });
      break;
    case 'WEEK_PLUS':
      weeksMonday = startOfWeek(addWeeks(today, weeks), { weekStartsOn: 1 });
      break;
    default:
      weeksMonday = startOfWeek(today, { weekStartsOn: 1 });
  }
  return format(weeksMonday, DATE_FORMAT);
};

/**
 * Returns the first and last month/year of the 22-week period.
 * @returns {{first: string, last: string}} - Object containing first and last month/year strings.
 */
export const generateFirstAndLastMonthYear = (
  start,
  dateFormat,
  currentDate = false,
  previousStartDate = false,
  isArrowClick = false
) => {
  let today = start ? new Date(start) : new Date();
  if (currentDate) {
    const currentDateMonday = getMonday(today);
    return format(currentDateMonday, dateFormat);
  }
  if (previousStartDate) {
    const previousMonday = getMonday(
      subDays(
        today,
        weeksToDays(
          isArrowClick ? TOTAL_FUTURE_WEEKS_ARROW : TOTAL_FUTURE_WEEKS
        )
      )
    );
    return format(previousMonday, dateFormat);
  }
  const futureDateMonday = getMonday(
    addDays(
      today,
      weeksToDays(isArrowClick ? TOTAL_FUTURE_WEEKS_ARROW : TOTAL_FUTURE_WEEKS)
    )
  );
  return format(futureDateMonday, dateFormat);
};

export const getStartAndEndDateForView = (
  view,
  projectsCalendar,
  teamsCalendar
) => {
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

export const getUserIdFromEmail = (users, email) => {
  // Returning a hardcoded value for testing
  return '1513e847-8abe-42b6-8743-497d9b8e0e17';
  const userObj = users.find(user => user.Email === email);
  return userObj ? userObj.Id : null;
};
