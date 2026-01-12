/**
 * Date Helper Utilities
 * Common date manipulation functions for project planning
 */

/**
 * Add days to a date and return in YYYY-MM-DD format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {number} days - Number of days to add
 * @returns {string} - Date in YYYY-MM-DD format
 */
export function addDays(dateString, days) {
  if (!dateString) return '';
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Add weeks to a date
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {number} weeks - Number of weeks to add
 * @returns {string} - Date in YYYY-MM-DD format
 */
export function addWeeks(dateString, weeks) {
  return addDays(dateString, weeks * 7);
}

/**
 * Add months to a date
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {number} months - Number of months to add
 * @returns {string} - Date in YYYY-MM-DD format
 */
export function addMonths(dateString, months) {
  if (!dateString) return '';
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

/**
 * Get the next workday (skip weekends)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} - Date in YYYY-MM-DD format
 */
export function getNextWorkday(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  if (dayOfWeek === 0) {
    // Sunday → move to Monday
    return addDays(dateString, 1);
  } else if (dayOfWeek === 6) {
    // Saturday → move to Monday
    return addDays(dateString, 2);
  }

  return dateString; // Already a weekday
}

/**
 * Calculate number of business days between two dates
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {number} - Number of business days
 */
export function getBusinessDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;

  let count = 0;
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Format date for display
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} locale - Locale string ('en-US', 'es-MX')
 * @returns {string} - Formatted date string
 */
export function formatDate(dateString, locale = 'en-US') {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} - Today's date
 */
export function getToday() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate phase dates based on project timeline
 * @param {string} startDate - Project start date
 * @param {string} deadline - Project deadline
 * @param {Object} phases - Phase configuration { clarity, implementation, adoption }
 * @returns {Object} - Phase date ranges
 */
export function calculatePhaseDates(startDate, deadline, phases) {
  const dates = {};
  let currentDate = startDate;

  if (phases.clarity?.enabled) {
    dates.clarity = {
      start: currentDate,
      end: addWeeks(currentDate, phases.clarity.weeks)
    };
    currentDate = dates.clarity.end;
  }

  if (phases.implementation?.enabled) {
    dates.implementation = {
      start: getNextWorkday(currentDate),
      end: phases.adoption?.enabled
        ? addWeeks(currentDate, phases.implementation.weeks)
        : deadline
    };
    currentDate = dates.implementation.end;
  }

  if (phases.adoption?.enabled) {
    dates.adoption = {
      start: getNextWorkday(currentDate),
      end: deadline
    };
  }

  return dates;
}

export default {
  addDays,
  addWeeks,
  addMonths,
  getNextWorkday,
  getBusinessDays,
  formatDate,
  getToday,
  calculatePhaseDates
};
