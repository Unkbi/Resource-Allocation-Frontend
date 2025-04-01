"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartAndEndDateForView = exports.generateFirstAndLastMonthYear = exports.generateTMinusOneStartEndDate = exports.getMonday = exports.getInitials = exports.generateRandomColor = exports.generateAllWeeks = exports.getInitialsColor = exports.removeDuplicateResources = exports.isResourceInProject = exports.getProjectOrTeamIdByName = exports.isValidUUID = exports.getMondayOfWeek = exports.getMondaysInRange = exports.getWeekNumber = exports.formatDate = exports.addWeeks = exports.getStartOfPreviousWeek = exports.calculateTotalEffort = void 0;
exports.generateAllMondays = generateAllMondays;
const date_fns_1 = require("date-fns");
const constants_1 = require("../constants/constants");
// Calculate total effort from weekly columns
const calculateTotalEffort = row => {
    return Object.keys(row)
        .filter(key => key.startsWith('W')) // Filter weekly columns
        .reduce((sum, weekKey) => {
        const weekValue = row[weekKey];
        const numericValue = typeof weekValue === 'object' && weekValue !== null
            ? parseFloat(weekValue.value || 0)
            : parseFloat(weekValue || 0);
        return sum + numericValue;
    }, 0);
};
exports.calculateTotalEffort = calculateTotalEffort;
const getStartOfPreviousWeek = date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff - 7);
    return d;
};
exports.getStartOfPreviousWeek = getStartOfPreviousWeek;
const addWeeks = (date, weeks) => {
    const result = new Date(date);
    result.setDate(result.getDate() + weeks * 7);
    return result;
};
exports.addWeeks = addWeeks;
const formatDate = (date, dateFormat) => {
    return date.toLocaleDateString('en-US', {
        month: dateFormat.includes('MMM') ? 'short' : 'numeric',
        year: 'numeric',
    });
};
exports.formatDate = formatDate;
/**
 * Calculates the week number for a given date.
 * @param {Date} date - The date for which to calculate the week number.
 * @returns {String} - The calculated week number in the format "W{number}".
 */
const getWeekNumber = date => {
    return `W${(0, date_fns_1.getWeek)(date, { weekStartsOn: 1 })}`;
};
exports.getWeekNumber = getWeekNumber;
const getMondaysInRange = (start, end) => {
    const dates = (0, date_fns_1.eachDayOfInterval)({
        start,
        end,
    });
    const mondays = new Set(dates.map((date) => (0, date_fns_1.format)((0, date_fns_1.startOfISOWeek)(date), constants_1.DATE_FORMAT)));
    return Array.from(mondays);
};
exports.getMondaysInRange = getMondaysInRange;
/**
 * Get the Monday date of a given week number in the current year,
 * where week 1 starts from January 1st.
 * @param {string} weekNumber - A string representing the week number, e.g. "W1".
 * @returns {string} - The Monday date of the given week in YYYY-MM-DD format.
 */
const getMondayOfWeek = (weekNumber, date) => {
    const year = (0, date_fns_1.getYear)(date);
    const firstDayOfYear = new Date(year, 0, 1);
    const weekN = typeof weekNumber !== 'number' ? Number(weekNumber.slice(1)) : weekNumber;
    const dateInWeek = (0, date_fns_1.setWeek)(firstDayOfYear, weekN);
    return (0, date_fns_1.format)((0, date_fns_1.startOfISOWeek)(dateInWeek, { weekStartsOn: 1 }), constants_1.DATE_FORMAT);
};
exports.getMondayOfWeek = getMondayOfWeek;
function generateAllMondays(startDate, endDate) {
    const mondays = [];
    const currentDate = new Date(startDate);
    if (currentDate.getDay() !== 1) {
        currentDate.setDate(currentDate.getDate() + ((1 - currentDate.getDay() + 7) % 7));
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
const isValidUUID = uuid => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
exports.isValidUUID = isValidUUID;
/**
 * Get the project or team Id based on the project or team name.
 * @param {Array} arr - The array of project or teams objects.
 * @param {string} name - The name of the project or team to find.
 * @returns {string|null} - The Id of the project or team if found, otherwise null.
 */
const getProjectOrTeamIdByName = (arr, name) => {
    const projectOrTeam = arr.find(proj => proj.Name === name);
    return projectOrTeam ? projectOrTeam.Id : null;
};
exports.getProjectOrTeamIdByName = getProjectOrTeamIdByName;
/**
 * Checks if a resource is present for a specific project.
 *
 * @param {Array<Object>} data - The array of project-resource objects.
 * @param {string} projectName - The name of the project to check.
 * @param {string} resourceName - The name of the resource to check.
 * @return {boolean} - Returns true if the resource is found in the project, otherwise false.
 */
const isResourceInProject = (data, projectName, resourceName) => {
    return data.some(item => item.project === projectName && item.resource === resourceName);
};
exports.isResourceInProject = isResourceInProject;
/**
 * Removes duplicate resources from an array based on a unique combination of FullName and Id.
 *
 * @param {Array} arr - The array of objects where each object contains `FullName` and `Id`.
 * @returns {Array} A new array with duplicate objects removed.
 */
const removeDuplicateResources = arr => {
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
exports.removeDuplicateResources = removeDuplicateResources;
const getInitialsColor = name => {
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
    const hash = name && name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};
exports.getInitialsColor = getInitialsColor;
const generateAllWeeks = () => {
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
        weeks.push((0, exports.getWeekNumber)(weekDate));
    }
    return weeks;
};
exports.generateAllWeeks = generateAllWeeks;
// Function to generate a random color in hex format
const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
exports.generateRandomColor = generateRandomColor;
const getInitials = (fullName) => {
    if (!fullName)
        return 'MJ';
    // Split the full name by spaces
    const nameParts = fullName?.trim()?.split(' ');
    // Extract the first letter of each part of the name
    const initials = nameParts?.map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
};
exports.getInitials = getInitials;
const getMonday = (date) => {
    return (0, date_fns_1.startOfWeek)(date, { weekStartsOn: 1 });
};
exports.getMonday = getMonday;
const generateTMinusOneStartEndDate = (isStartDate) => {
    let today = new Date();
    const lastWeeksMonday = (0, date_fns_1.startOfWeek)((0, date_fns_1.subWeeks)(today, 1), { weekStartsOn: 1 });
    if (isStartDate) {
        return (0, date_fns_1.format)(lastWeeksMonday, constants_1.DATE_FORMAT);
    }
    else {
        const futureDateMonday = (0, exports.getMonday)((0, date_fns_1.addDays)(lastWeeksMonday, (0, date_fns_1.weeksToDays)(constants_1.TOTAL_FUTURE_WEEKS)));
        return (0, date_fns_1.format)(futureDateMonday, constants_1.DATE_FORMAT);
    }
};
exports.generateTMinusOneStartEndDate = generateTMinusOneStartEndDate;
/**
 * Returns the first and last month/year of the 22-week period.
 * @returns {{first: string, last: string}} - Object containing first and last month/year strings.
 */
const generateFirstAndLastMonthYear = (start, dateFormat, currentDate = false, previousStartDate = false, isArrowClick = false) => {
    let today = start ? new Date(start) : new Date();
    if (currentDate) {
        const currentDateMonday = (0, exports.getMonday)(today);
        return (0, date_fns_1.format)(currentDateMonday, dateFormat);
    }
    if (previousStartDate) {
        const previousMonday = (0, exports.getMonday)((0, date_fns_1.subDays)(today, (0, date_fns_1.weeksToDays)(isArrowClick ? constants_1.TOTAL_FUTURE_WEEKS_ARROW : constants_1.TOTAL_FUTURE_WEEKS)));
        return (0, date_fns_1.format)(previousMonday, dateFormat);
    }
    const futureDateMonday = (0, exports.getMonday)((0, date_fns_1.addDays)(today, (0, date_fns_1.weeksToDays)(isArrowClick ? constants_1.TOTAL_FUTURE_WEEKS_ARROW : constants_1.TOTAL_FUTURE_WEEKS)));
    return (0, date_fns_1.format)(futureDateMonday, dateFormat);
};
exports.generateFirstAndLastMonthYear = generateFirstAndLastMonthYear;
const getStartAndEndDateForView = (view, projectsCalendar, teamsCalendar) => {
    let startDate, endDate;
    if (view === 'Teams') {
        startDate = teamsCalendar.startDate;
        endDate = teamsCalendar.endDate;
    }
    else {
        startDate = projectsCalendar.startDate;
        endDate = projectsCalendar.endDate;
    }
    return { startDate, endDate };
};
exports.getStartAndEndDateForView = getStartAndEndDateForView;
