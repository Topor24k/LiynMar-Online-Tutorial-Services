// Utility functions for the application

/**
 * Generate avatar URL for a user or teacher
 * @param {string} name - The name to generate avatar for
 * @param {number} size - Size of the avatar (default: 40)
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (name, size = 40) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B7355&color=fff${size !== 40 ? `&size=${size}` : ''}`;
};

/**
 * Get data from localStorage with JSON parsing
 * @param {string} key - localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed data or default value
 */
export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Set data to localStorage with JSON stringification
 * @param {string} key - localStorage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Format time to 12-hour format
 * @param {string} time - Time string (HH:mm)
 * @returns {string} Formatted time
 */
export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHour = h % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

/**
 * Calculate inactive duration for teacher
 * @param {string} lastBookingDate - Last booking date
 * @returns {object} Inactive status and duration
 */
export const calculateInactiveDuration = (lastBookingDate) => {
  if (!lastBookingDate) {
    return { isInactive: false, duration: '' };
  }

  const now = new Date();
  const lastDate = new Date(lastBookingDate);
  const diffMs = now - lastDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // If more than 7 days (1 week), mark as inactive
  if (diffDays >= 7) {
    const years = Math.floor(diffDays / 365);
    const remainingDaysAfterYears = diffDays % 365;
    const weeks = Math.floor(remainingDaysAfterYears / 7);
    const days = remainingDaysAfterYears % 7;

    let duration = '';
    if (years > 0) duration += `${years} year${years > 1 ? 's' : ''} `;
    if (weeks > 0) duration += `${weeks} week${weeks > 1 ? 's' : ''} `;
    if (days > 0) duration += `${days} day${days > 1 ? 's' : ''}`;

    return {
      isInactive: true,
      duration: duration.trim() || '0 days',
      totalDays: diffDays
    };
  }

  return { isInactive: false, duration: '' };
};

/**
 * Get last booking date for a teacher
 * @param {string} teacherId - Teacher ID
 * @returns {string|null} Last booking date
 */
export const getLastBookingDate = (teacherId) => {
  const bookings = getLocalStorage('teacherBookings', {});
  const teacherBookings = bookings[teacherId] || [];
  
  if (teacherBookings.length === 0) return null;

  // Find the most recent booking
  const sortedBookings = [...teacherBookings].sort((a, b) => {
    return new Date(b.startDate) - new Date(a.startDate);
  });

  return sortedBookings[0]?.startDate || null;
};
