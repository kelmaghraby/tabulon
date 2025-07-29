/**
 * Utility functions for creating colored error messages
 */

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

/**
 * Creates a colored error message with clear formatting
 * @param message The error message
 * @param context Optional context information
 * @param suggestion Optional suggestion for fixing the issue
 * @returns Formatted colored error message
 */
export function createColoredError(
  message: string,
  context?: string,
  suggestion?: string
): string {
  const parts: string[] = [];
  
  // Main error message in red
  parts.push(`${colors.bright}${colors.red}❌ ERROR:${colors.reset} ${colors.red}${message}${colors.reset}`);
  
  // Context in blue if provided
  if (context) {
    parts.push(`\n${colors.blue}📋 Context:${colors.reset} ${colors.cyan}${context}${colors.reset}`);
  }
  
  // Suggestion in green if provided
  if (suggestion) {
    parts.push(`\n${colors.green}💡 Suggestion:${colors.reset} ${colors.yellow}${suggestion}${colors.reset}`);
  }
  
  return parts.join('');
}

/**
 * Creates a colored warning message
 * @param message The warning message
 * @param context Optional context information
 * @returns Formatted colored warning message
 */
export function createColoredWarning(message: string, context?: string): string {
  const parts: string[] = [];
  
  // Main warning message in yellow
  parts.push(`${colors.bright}${colors.yellow}⚠️  WARNING:${colors.reset} ${colors.yellow}${message}${colors.reset}`);
  
  // Context in blue if provided
  if (context) {
    parts.push(`\n${colors.blue}📋 Context:${colors.reset} ${colors.cyan}${context}${colors.reset}`);
  }
  
  return parts.join('');
}

/**
 * Creates a colored success message
 * @param message The success message
 * @returns Formatted colored success message
 */
export function createColoredSuccess(message: string): string {
  return `${colors.bright}${colors.green}✅ SUCCESS:${colors.reset} ${colors.green}${message}${colors.reset}`;
}

/**
 * Creates a colored info message
 * @param message The info message
 * @returns Formatted colored info message
 */
export function createColoredInfo(message: string): string {
  return `${colors.bright}${colors.blue}ℹ️  INFO:${colors.reset} ${colors.cyan}${message}${colors.reset}`;
}

/**
 * Formats table-related error messages with specific context
 * @param errorType The type of table error
 * @param details Additional error details
 * @param expected Optional expected value
 * @param actual Optional actual value
 * @returns Formatted colored error message
 */
export function createTableError(
  errorType: 'structure' | 'headers' | 'rows' | 'columns' | 'cell' | 'data',
  details: string,
  expected?: string | number,
  actual?: string | number
): string {
  const context = `Table ${errorType} validation failed`;
  let suggestion = '';
  
  switch (errorType) {
    case 'structure':
      suggestion = 'Ensure the table has proper <thead> and <tbody> structure with valid <th> elements';
      break;
    case 'headers':
      suggestion = expected && actual 
        ? `Expected ${expected} headers but found ${actual}. Check your table header structure.`
        : 'Verify that your table has the expected column headers';
      break;
    case 'rows':
      suggestion = expected && actual
        ? `Expected ${expected} data rows but found ${actual}. Check your table data.`
        : 'Verify that your table has the expected number of data rows';
      break;
    case 'columns':
      suggestion = expected && actual
        ? `Expected ${expected} columns but found ${actual}. Check your table structure.`
        : 'Verify that your table has the expected number of columns';
      break;
    case 'cell':
      suggestion = expected && actual
        ? `Expected cell value "${expected}" but found "${actual}". Check your test data.`
        : 'Verify that the cell contains the expected value';
      break;
    case 'data':
      suggestion = 'Verify that your table data matches the expected structure and values';
      break;
  }
  
  return createColoredError(details, context, suggestion);
}

/**
 * Checks if the current environment supports ANSI colors
 * @returns True if colors are supported
 */
export function supportsColors(): boolean {
  // Check if we're in a Node.js environment that supports colors
  if (typeof process !== 'undefined' && process.stdout && process.stdout.isTTY) {
    return true;
  }
  
  // Check for common CI environments that don't support colors
  const noColor = process.env.NO_COLOR || process.env.CI === 'true';
  return !noColor;
}

/**
 * Creates a colored error message that falls back to plain text if colors aren't supported
 * @param message The error message
 * @param context Optional context information
 * @param suggestion Optional suggestion for fixing the issue
 * @returns Formatted error message (colored or plain)
 */
export function createSmartError(
  message: string,
  context?: string,
  suggestion?: string
): string {
  if (supportsColors()) {
    return createColoredError(message, context, suggestion);
  }
  
  // Fallback to plain text format
  const parts: string[] = [];
  parts.push(`ERROR: ${message}`);
  
  if (context) {
    parts.push(`Context: ${context}`);
  }
  
  if (suggestion) {
    parts.push(`Suggestion: ${suggestion}`);
  }
  
  return parts.join('\n');
} 