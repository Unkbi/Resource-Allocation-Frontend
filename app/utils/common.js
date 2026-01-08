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
  parseISO,
  differenceInDays,
  isSameWeek,
  differenceInCalendarWeeks,
  endOfWeek,
  endOfISOWeek,
  isValid,
  isBefore,
  // ISO-week helpers
  setISOWeek,
  getISOWeek,
  getISOWeekYear,
} from 'date-fns';
import {
  DATE_FORMAT,
  DEFAULT_PROJECT_WEEK_MINUS,
  DEFAULT_PROJECT_WEEK_PLUS,
  PROJECT_TOTAL_COST_CATEGORIES,
  TOTAL_FUTURE_WEEKS,
  TOTAL_FUTURE_WEEKS_ARROW,
} from '../constants/constants';

// Calculate total effort from weekly columns
export const calculateTotalEffort = row => {
  return Object.keys(row)
    .filter(key => /^W\d+(?:-\d{4})?$/.test(key)) // Filter weekly columns (legacy 'W1' and canonical 'W1-2026')
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
  // Canonical ISO-week key: include ISO week and ISO week-year to avoid
  // collisions across year boundaries (e.g. W1 can belong to previous or next
  // ISO week-year depending on the date). Example: "W1-2026".
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return null;
  const week = getISOWeek(d);
  const year = getISOWeekYear(d);
  return `W${week}-${year}`;
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
  // Accept both legacy 'W1' and canonical 'W1-2026'. If canonical form includes
  // a year, parse directly; otherwise fall back to deriving year from `date`.
  if (isWeekKey(weekNumber) && String(weekNumber).includes('-')) {
    const monday = parseWeekKeyToMonday(weekNumber);
    return monday ? format(monday, DATE_FORMAT) : null;
  }

  // legacy behavior: weekNumber like 'W1' - infer year from `date` argument
  const year = getYear(date);
  const weekN =
    typeof weekNumber !== 'number'
      ? Number(weekNumber.toString().slice(1))
      : weekNumber;
  const firstDayOfYear = new Date(year, 0, 1);
  const dateInWeek = setWeek(firstDayOfYear, weekN);
  return format(startOfISOWeek(dateInWeek, { weekStartsOn: 1 }), DATE_FORMAT);
};

export function generateAllMondays(startDate, endDate) {
  const mondays = [];
  const currentDate = parseISO(startDate);

  // Set to the previous Monday (or stay if already Monday)
  currentDate.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));

  // If no endDate, return just this Monday
  if (!endDate) {
    mondays.push(parseISO(formatDates(currentDate)));
    return mondays;
  }

  const endDateObj = parseISO(endDate);

  // Generate all Mondays in the range
  while (currentDate <= endDateObj) {
    mondays.push(parseISO(formatDates(currentDate)));
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

export const calculateWeekRanges = (
  selectedStart,
  selectedEnd,
  currentDate
) => {
  const current = parseISO(new Date().toISOString());
  const start = parseISO(selectedStart);
  const end = parseISO(selectedEnd);
  const startOfCurrentWeek = startOfISOWeek(current, { weekStartsOn: 1 });
  const startOfStartWeek = startOfISOWeek(start, { weekStartsOn: 1 });
  const startOfEndWeek = startOfISOWeek(end, { weekStartsOn: 1 });
  const weekMinus = Math.floor(
    differenceInDays(startOfCurrentWeek, startOfStartWeek) / 7
  );
  const weekPlus = Math.floor(
    differenceInDays(startOfEndWeek, startOfCurrentWeek) / 7
  );

  return {
    weekMinus: Math.ceil(weekMinus),
    weekPlus: Math.ceil(weekPlus),
  };
};

export const getTotalWeeks = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const isoStart =
    typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const isoEnd = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const weekStart = startOfWeek(isoStart, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(isoEnd, { weekStartsOn: 1 });
  return isSameWeek(weekEnd, weekStart, { weekStartsOn: 1 })
    ? 1
    : differenceInCalendarWeeks(weekEnd, weekStart, { weekStartsOn: 1 }) + 1;
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

export const getMondayOfISO = date => {
  const isoDate = parseISO(date);
  return format(startOfISOWeek(isoDate, { weekStartsOn: 1 }), DATE_FORMAT);
};

export const getSundayOfISO = date => {
  const isoDate = parseISO(date);
  return format(endOfISOWeek(isoDate, { weekStartsOn: 1 }), DATE_FORMAT);
};

export const getFridayOfISO = date => {
  if (!date) return null;
  // Accept either a Date or an ISO string
  const isoDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(isoDate)) return null;

  // ISO week starts on Monday; Friday is Monday + 4 days
  const monday = startOfISOWeek(isoDate, { weekStartsOn: 1 });
  const friday = addDays(monday, 4);
  return format(friday, DATE_FORMAT);
};

// Helper: match keys like 'W1' or 'W1-2026'
export const isWeekKey = key => {
  return typeof key === 'string' && /^W\d+(?:-\d{4})?$/.test(key);
};

// Parse a week key (W{n} or W{n}-{YYYY}) to the Monday Date object of that ISO week-year.
// If the key lacks a year (legacy 'W1'), the provided `fallbackYear` (or current year)
// will be used to resolve the week-year.
export const parseWeekKeyToMonday = (
  weekKey,
  fallbackYear = new Date().getFullYear()
) => {
  if (!isWeekKey(weekKey)) return null;
  const m = weekKey.match(/^W(\d+)(?:-(\d{4}))?$/);
  if (!m) return null;
  const week = Number(m[1]);
  const year = m[2] ? Number(m[2]) : fallbackYear;
  // Anchor on Jan 4th of the ISO-week-year and set ISO week
  const anchor = new Date(year, 0, 4);
  const withWeek = setISOWeek(anchor, week);
  return startOfISOWeek(withWeek, { weekStartsOn: 1 });
};

export const generateTMinusOneStartEndDate = isStartDate => {
  let today = parseISO(new Date().toISOString());
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

export const generateDateWeekMath = (operation, weeks, date = new Date()) => {
  if (weeks === undefined || weeks === null) return null;
  // let today = new Date();
  const isoDate = parseISO(date.toISOString());

  let weeksMonday;
  switch (operation) {
    case 'WEEK_MINUS':
      weeksMonday = startOfWeek(subWeeks(isoDate, weeks), { weekStartsOn: 1 });
      break;
    case 'WEEK_PLUS':
      weeksMonday = startOfWeek(addWeeks(isoDate, weeks), { weekStartsOn: 1 });
      break;
    default:
      weeksMonday = startOfWeek(isoDate, { weekStartsOn: 1 });
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
  if (!Array.isArray(users) || !email) return null;
  const userObj = users.find(user => user?.Email === email);
  return userObj ? userObj.Id : null;
};

export const isObjectEqual = (a, b) => {
  if (a === b) return true;

  if (typeof a !== typeof b || a == null || b == null) return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((el, i) => isObjectEqual(el, b[i]));
  }

  if (typeof a === 'object') {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(key => isObjectEqual(a[key], b[key]));
  }

  return false;
};

export const getTeamsIamAllocationManager = (userEmail, resources, teams) => {
  const userResourcePath =
    Array.isArray(resources) && userEmail
      ? (resources.find(
          r => r?.Email?.toLowerCase() === userEmail.toLowerCase()
        )?.__path__ ?? null)
      : null;

  if (userResourcePath) {
    const managedTeam = teams.filter(
      team =>
        team.AllocationManager && team.AllocationManager === userResourcePath
    );
    return managedTeam;
  }
  return [];
};

export const getResourceFromEmail = (userEmail, resources) => {
  const userResourcePath =
    Array.isArray(resources) && userEmail
      ? (resources.find(r => r.Email?.toLowerCase() === userEmail.toLowerCase())
          ?.__path__ ?? null)
      : null;

  if (userResourcePath) {
    const resourceData = resources.find(
      resource => resource.__path__ === userResourcePath
    );
    return resourceData;
  }
  return null;
};

export const getResourceFromUid = (uid, resources) => {
  return resources.find(resource => resource.Id === uid);
};

export const getUserFromUid = (uid, users) => {
  return users.find(user => user.id === uid);
};

export const getAllocationManagerFromPath = (
  allocationManager_Path,
  resources
) => {
  if (!allocationManager_Path || !Array.isArray(resources)) return null;
  if (/[^$]+\$[^/]+\/.+/.test(allocationManager_Path)) {
    // Check if the path is a valid resource path
    return resources.find(
      resource => resource.__path__ === allocationManager_Path
    );
  }

  return {
    FullName: allocationManager_Path,
  };
};

export const getProjectsIamProjectManager = (uid, projects) => {
  return projects.filter(
    project => project.ProjectManager?.toLowerCase() === uid
  );
};

export const getUpdatedFiltersOnMyTeamsAllTeams = (
  allocationManagerFullName,
  filters,
  myTeam = false
) => {
  const updatedFilters = filters || [];
  if (myTeam) {
    if (
      updatedFilters.find(
        filter =>
          filter.field === 'teamAllocationManager' &&
          filter.operator === 'equals' &&
          filter.value === allocationManagerFullName
      )
    ) {
      return updatedFilters;
    }

    return [
      ...updatedFilters,
      {
        field: 'teamAllocationManager',
        operator: 'equals',
        value: allocationManagerFullName,
        id: 0, // This is hardcoded to avoid Id issues for My Teams filter
      },
    ];
  } else {
    return updatedFilters.filter(
      filter =>
        !(
          filter.field === 'teamAllocationManager' &&
          filter.operator === 'equals' &&
          filter.value === allocationManagerFullName
        )
    );
  }
};

export const getUpdatedFiltersOnMyProjectsAllProjects = (
  projectManagerName,
  filters,
  myProjects = false
) => {
  let updatedFilters = filters || [];

  if (myProjects) {
    if (
      updatedFilters.find(
        filter =>
          filter.field === 'projectManager' &&
          filter.operator === 'equals' &&
          filter.value === projectManagerName
      )
    ) {
      return updatedFilters;
    }

    return [
      ...updatedFilters,
      {
        field: 'projectManager',
        operator: 'equals',
        value: projectManagerName,
        id: 1, // This is hardcoded to avoid Id issues for My Project filter
      },
    ];
  } else {
    return updatedFilters.filter(
      filter =>
        !(
          filter.field === 'projectManager' &&
          filter.operator === 'equals' &&
          filter.value === projectManagerName
        )
    );
  }
};

export const isMyTeamsValid = (allocationManagerName, filters) => {
  return (
    filters?.some(
      filter =>
        filter.field === 'teamAllocationManager' &&
        filter.operator === 'equals' &&
        filter.value === allocationManagerName
    ) || false
  );
};

export const isMyProjectsValid = (projectManagerName, filters) => {
  return (
    filters?.some(
      filter =>
        filter.field === 'projectManager' &&
        filter.operator === 'equals' &&
        filter.value === projectManagerName
    ) || false
  );
};

export const getOnlyFilterSettings = view => {
  return {
    GroupBy: view.GroupBy ?? '',
    MyTeam: view.MyTeam ?? false,
    MyProjects: view.MyProjects ?? false,
    ColumnsVisible: view.ColumnsVisible ?? [],
    StartDate: view.StartDate ?? '',
    EndDate: view.EndDate ?? '',
    isFixedRange: view.isFixedRange ?? false,
    isDynamicRange: view.isDynamicRange ?? false,
    WeekPlus: view.WeekPlus ?? DEFAULT_PROJECT_WEEK_PLUS,
    WeekMinus: view.WeekMinus ?? DEFAULT_PROJECT_WEEK_MINUS,
    Filters: view.Filters ?? [],
  };
};

export const getTotalWeeklyAllocation = (rowState, resourceId, weekKey) => {
  let total = 0;
  const allRows = rowState;
  allRows.forEach(row => {
    if (row.resourceId === resourceId && row[weekKey]?.value) {
      total += parseFloat(row[weekKey]?.value || 0);
    }
  });
  return total;
};

export const getUpdatedTotalWeeklyAllocation = (
  rowState,
  resourceId,
  weekKey,
  newValue,
  projects
) => {
  let total = 0;
  let projectsIds = projects.map(project => project.Id);
  const allRows = rowState;
  allRows.forEach(row => {
    if (row.resourceId === resourceId && row[weekKey]?.value) {
      if (projectsIds.includes(row.projectId)) {
        total += parseFloat(newValue || 0);
        projectsIds = projectsIds.filter(
          projectsId => projectsId !== row.projectId
        );
      } else {
        total += parseFloat(row[weekKey]?.value || 0);
      }
    }
  });
  return total + parseFloat(newValue || 0) * projectsIds.length;
};

export function formatStringToFloat(value, decimalPlaces = 1) {
  const num = parseFloat(value);
  if (isNaN(num)) return '0.0'; // fallback for invalid inputs
  return num.toFixed(decimalPlaces);
}

export function isCurrentWeek(date) {
  const today = new Date();
  const startOfCurrentWeek = startOfISOWeek(today, { weekStartsOn: 1 });
  const startOfDateWeek = startOfISOWeek(date, { weekStartsOn: 1 });
  return isSameWeek(startOfCurrentWeek, startOfDateWeek, { weekStartsOn: 1 });
}

export function isFutureWeek(date) {
  const today = new Date();
  return isBefore(
    startOfISOWeek(today, { weekStartsOn: 1 }),
    startOfISOWeek(date, { weekStartsOn: 1 })
  );
}

export function isCurrentOrPastWeek(date) {
  const today = new Date();
  return (
    isCurrentWeek(date) || isBefore(startOfISOWeek(date), startOfISOWeek(today))
  );
}

export function formateToFloat(value) {
  if (value === undefined || value === null) return 0.0;
  const parsedValue = parseFloat(value);
  if (isNaN(parsedValue)) return 0.0;
  return Math.round(value * 10) / 10;
}

export function getProjectTypeColorLine(projectType) {
  const projectTypeColors = {
    'key initiative': '#3730A3',
    rtb: '#A3A2A4',
    ctb: '#5080DA',
    stb: '#F5B544',
    ongoing: '#4B9F47',
  };
  return projectTypeColors[projectType.toLowerCase()] || '#FF0000';
}

export function getProjectBudgetColor(budgetCategory = 'onBudget') {
  const projectBudgetColors = {
    onBudget: '#1565C0',
    overBudget: '#B91C1C',
    underBudget: '#4B9F47',
  };

  return projectBudgetColors[budgetCategory];
}

export function getProjectBudgetCategory(projectBudget, currentBudget) {
  const projectBudgetCategories = {
    onBudget: 'onBudget',
    overBudget: 'overBudget',
    underBudget: 'underBudget',
  };
  if (currentBudget < projectBudget - projectBudget * 0.1) {
    return projectBudgetCategories['underBudget'];
  }
  if (currentBudget > projectBudget + projectBudget * 0.1) {
    return projectBudgetCategories['overBudget'];
  }
  return projectBudgetCategories['onBudget'];
}

export function getProjectBudgetCategoryDisplayName(budgetCategory) {
  const projectBudgetCategories = {
    onBudget: 'On-Budget',
    overBudget: 'Over-Budget',
    underBudget: 'Under-Budget',
  };
  return projectBudgetCategories[budgetCategory];
}

export function getTeamForResource(resourceId, teams, teamsResources) {
  const team = Object.keys(teamsResources).find(teamId => {
    const teamResources = teamsResources[teamId];
    return teamResources.some(resource => resource.Id === resourceId);
  });
  if (team) {
    return teams.find(t => t.Id === team);
  }
  return null;
}

export function getOrganisationForResource(
  resourceId,
  organisations,
  organisationsResources
) {
  const organisation = Object.keys(organisationsResources).find(
    organisationId => {
      const organisationResources = organisationsResources[organisationId];
      return organisationResources.some(resource => resource.Id === resourceId);
    }
  );
  if (organisation) {
    return organisations.find(o => o.Id === organisation);
  }
  return null;
}

export function isCellEditableUtils(params, type, resources) {
  if (type === 'cost') return false;
  if (params.row.hasButton) return false;
  if (/\_(\d)+/.test(params.row.id)) return true; // Allow Editing for Split View Empty Rows

  const cellData = params.row[params.field];
  const cellPeriod = cellData?.period;
  if (!cellPeriod) return false;

  const parsedCellPeriod = parseISO(cellPeriod);
  if (!isValid(parsedCellPeriod)) return false;

  const cellPeriodStart = startOfWeek(parsedCellPeriod, { weekStartsOn: 1 }); // Monday start
  const cellPeriodEnd = addDays(cellPeriodStart, 6);

  const matchingResource = resources?.find(
    resource => resource.Id === params.row.resourceId
  );
  if (!matchingResource) return false;

  // If not StartDate then allow to edit no checks
  if (!matchingResource.StartDate) return true;

  const resourceStart = parseISO(matchingResource.StartDate);
  const resourceEnd = matchingResource.EndDate
    ? parseISO(matchingResource.EndDate)
    : undefined;

  const isOverlap =
    resourceStart <= cellPeriodEnd &&
    (!resourceEnd || resourceEnd >= cellPeriodStart);
  return isOverlap;
}

export function isResourceWithinDate(resource, monday) {
  if (!resource || !resource.StartDate) return false;

  const resourceStart = parseISO(getMondayOfISO(resource.StartDate));
  const resourceEnd = resource.EndDate ? parseISO(resource.EndDate) : undefined;

  if (resourceEnd) {
    return resourceStart <= monday && resourceEnd >= monday;
  }
  return resourceStart <= monday;
}
