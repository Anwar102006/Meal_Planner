/**
 * Calendar Date Utilities
 * Helper functions for handling calendar dates in meal planning
 */

/**
 * Get the start of week (Sunday) for a given date
 * @param {Date} date - Input date
 * @returns {Date} Start of the week (Sunday)
 */
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

/**
 * Get the end of week (Saturday) for a given date
 * @param {Date} date - Input date
 * @returns {Date} End of the week (Saturday)
 */
export function getWeekEnd(date = new Date()) {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

/**
 * Get all dates in a week (Sunday to Saturday)
 * @param {Date} date - Any date within the week
 * @returns {Array<Date>} Array of 7 dates representing the week
 */
export function getWeekDates(date = new Date()) {
  const weekStart = getWeekStart(date);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    dates.push(day);
  }
  return dates;
}

/**
 * Format date as YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateString(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Format date for display (e.g., "Dec 25, 2023")
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string for display
 */
export function formatDisplayDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date for display with day of week (e.g., "Mon, Dec 25")
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string with day
 */
export function formatDateWithDay(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get current week data structure
 * @returns {Object} Week data with start, end, and dates
 */
export function getCurrentWeek() {
  const now = new Date();
  const start = getWeekStart(now);
  const end = getWeekEnd(now);
  const dates = getWeekDates(now);
  
  return {
    start,
    end,
    dates,
    startString: formatDateString(start),
    endString: formatDateString(end)
  };
}

/**
 * Get previous week data
 * @param {Date} currentDate - Current date reference
 * @returns {Object} Previous week data
 */
export function getPreviousWeek(currentDate = new Date()) {
  const prevWeekDate = new Date(currentDate);
  prevWeekDate.setDate(currentDate.getDate() - 7);
  
  const start = getWeekStart(prevWeekDate);
  const end = getWeekEnd(prevWeekDate);
  const dates = getWeekDates(prevWeekDate);
  
  return {
    start,
    end,
    dates,
    startString: formatDateString(start),
    endString: formatDateString(end)
  };
}

/**
 * Get next week data
 * @param {Date} currentDate - Current date reference
 * @returns {Object} Next week data
 */
export function getNextWeek(currentDate = new Date()) {
  const nextWeekDate = new Date(currentDate);
  nextWeekDate.setDate(currentDate.getDate() + 7);
  
  const start = getWeekStart(nextWeekDate);
  const end = getWeekEnd(nextWeekDate);
  const dates = getWeekDates(nextWeekDate);
  
  return {
    start,
    end,
    dates,
    startString: formatDateString(start),
    endString: formatDateString(end)
  };
}

/**
 * Get week data for a specific date
 * @param {Date} date - Target date
 * @returns {Object} Week data for the given date
 */
export function getWeekForDate(date) {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  const dates = getWeekDates(date);
  
  return {
    start,
    end,
    dates,
    startString: formatDateString(start),
    endString: formatDateString(end)
  };
}

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
export function isSameDay(date1, date2) {
  return formatDateString(date1) === formatDateString(date2);
}

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  return isSameDay(date, new Date());
}

/**
 * Get day name for a date
 * @param {Date} date - Date
 * @returns {string} Day name (Sunday, Monday, etc.)
 */
export function getDayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Get short day name for a date
 * @param {Date} date - Date
 * @returns {string} Short day name (Sun, Mon, etc.)
 */
export function getShortDayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} Date object
 */
export function parseDate(dateString) {
  return new Date(dateString + 'T00:00:00.000Z');
}

/**
 * Get date range between two dates (inclusive)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array<Date>} Array of dates in the range
 */
export function getDateRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Get weeks between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array<Object>} Array of week objects
 */
export function getWeeksInRange(startDate, endDate) {
  const weeks = [];
  let currentWeekStart = getWeekStart(startDate);
  const rangeEnd = getWeekEnd(endDate);
  
  while (currentWeekStart <= rangeEnd) {
    const week = getWeekForDate(currentWeekStart);
    weeks.push(week);
    currentWeekStart = new Date(currentWeekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  
  return weeks;
}

/**
 * Get week number in year
 * @param {Date} date - Date
 * @returns {number} Week number (1-53)
 */
export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 days")
 * @param {Date} date - Target date
 * @param {Date} referenceDate - Reference date (default: now)
 * @returns {string} Relative time string
 */
export function getRelativeTimeString(date, referenceDate = new Date()) {
  const diffTime = date.getTime() - referenceDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  
  return formatDisplayDate(date);
}

/**
 * Create a date key for storage (YYYY-MM-DD format)
 * @param {Date} date - Date
 * @returns {string} Date key string
 */
export function createDateKey(date) {
  return formatDateString(date);
}

/**
 * Create meal plan date structure for a week
 * @param {Date} weekStartDate - Start of the week
 * @returns {Object} Week meal plan structure with date keys
 */
export function createWeekMealPlanStructure(weekStartDate) {
  const dates = getWeekDates(weekStartDate);
  const mealPlan = {};
  
  dates.forEach(date => {
    const dateKey = createDateKey(date);
    mealPlan[dateKey] = {
      date: date,
      dateString: formatDateString(date),
      dayName: getShortDayName(date),
      displayDate: formatDateWithDay(date),
      isToday: isToday(date),
      meals: {
        Breakfast: null,
        Lunch: null,
        Dinner: null
      }
    };
  });
  
  return mealPlan;
}

export default {
  getWeekStart,
  getWeekEnd,
  getWeekDates,
  formatDateString,
  formatDisplayDate,
  formatDateWithDay,
  getCurrentWeek,
  getPreviousWeek,
  getNextWeek,
  getWeekForDate,
  isSameDay,
  isToday,
  getDayName,
  getShortDayName,
  parseDate,
  getDateRange,
  getWeeksInRange,
  getWeekNumber,
  getRelativeTimeString,
  createDateKey,
  createWeekMealPlanStructure
};