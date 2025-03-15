/**
 * Utility functions for formatting values in the application
 */

/**
 * Format a number as currency with appropriate abbreviations for large values
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  if (!value && value !== 0) return "N/A";
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue)) return "N/A";
  
  // Format based on size
  if (numValue >= 1_000_000_000) {
    return `$${(numValue / 1_000_000_000).toFixed(2)}B`;
  } else if (numValue >= 1_000_000) {
    return `$${(numValue / 1_000_000).toFixed(2)}M`;
  } else if (numValue >= 1_000) {
    return `$${(numValue / 1_000).toFixed(2)}K`;
  } else {
    return `$${numValue.toFixed(2)}`;
  }
};

/**
 * Format a number with commas as thousands separators
 * @param {number} value - The value to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (value) => {
  if (!value && value !== 0) return "N/A";
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue)) return "N/A";
  
  // Format with commas
  return new Intl.NumberFormat('en-US').format(numValue);
};

/**
 * Format a number in compact notation (e.g., 1.2M, 5.3K)
 * @param {number} value - The value to format
 * @returns {string} Formatted compact number string
 */
export const formatCompactNumber = (value) => {
  if (!value && value !== 0) return "N/A";
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue)) return "N/A";
  
  // Format in compact notation
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(numValue);
};

/**
 * Format a percentage value
 * @param {number} value - The value to format (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (!value && value !== 0) return "N/A";
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue)) return "N/A";
  
  // Format as percentage
  return `${numValue.toFixed(decimals)}%`;
}; 