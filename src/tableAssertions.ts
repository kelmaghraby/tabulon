import { TableInteractor } from './tableInteractor';
import { TableData } from './types';
import { createTableError, createSmartError } from './errorUtils';

/**
 * Provides assertion utilities for HTML tables in Playwright tests.
 * Separates validation logic from interaction logic for better maintainability.
 */
export class TableAssertions {
  constructor(private tableInteractor: TableInteractor) {}

  /**
   * Asserts that the table has the expected number of rows.
   * @param expectedCount Expected number of data rows
   * @param message Custom error message
   */
  async assertRowCount(expectedCount: number, message?: string): Promise<void> {
    const actualCount = await this.tableInteractor.getRowCount();
    if (actualCount !== expectedCount) {
      const errorMessage = message || 
        createTableError('rows', `Expected table to have ${expectedCount} rows, but found ${actualCount} rows.`, expectedCount, actualCount);
      throw new Error(errorMessage);
    }
  }

  /**
   * Asserts that the table has the expected number of columns.
   * @param expectedCount Expected number of columns
   * @param message Custom error message
   */
  async assertColumnCount(expectedCount: number, message?: string): Promise<void> {
    const headers = await this.tableInteractor.getHeaders();
    const actualCount = headers.length;
    if (actualCount !== expectedCount) {
      const errorMessage = message || 
        createTableError('columns', `Expected table to have ${expectedCount} columns, but found ${actualCount} columns.`, expectedCount, actualCount);
      throw new Error(errorMessage);
    }
  }

  /**
   * Asserts that a specific cell contains the expected value.
   * @param rowIndex Row index (0-based)
   * @param headerText Column header text
   * @param expectedValue Expected cell value
   * @param message Custom error message
   */
  async assertCellValue(
    rowIndex: number,
    headerText: string,
    expectedValue: string,
    message?: string
  ): Promise<void> {
    const tableData = await this.tableInteractor.extractTableData();
    
    if (rowIndex >= tableData.rows.length) {
      const errorMessage = createTableError('rows', `Row index ${rowIndex} is out of bounds. Table has ${tableData.rows.length} rows.`, undefined, tableData.rows.length);
      throw new Error(errorMessage);
    }

    const row = tableData.rows[rowIndex];
    const actualValue = row[headerText];

    if (actualValue === undefined) {
      const errorMessage = createTableError('headers', `Header "${headerText}" not found in table. Available headers: ${tableData.headers.join(', ')}`);
      throw new Error(errorMessage);
    }

    if (actualValue !== expectedValue) {
      const errorMessage = message || 
        createTableError('cell', `Expected cell value "${expectedValue}" but found "${actualValue}" at row ${rowIndex}, column "${headerText}".`, expectedValue, actualValue);
      throw new Error(errorMessage);
    }
  }

  /**
   * Asserts that a row exists with the specified text content.
   * @param searchText Text to search for in the row
   * @param message Custom error message
   */
  async assertRowExists(searchText: string | RegExp, message?: string): Promise<void> {
    try {
      await this.tableInteractor.findRowByText(searchText);
    } catch (error) {
      const errorMessage = message || 
        createTableError('rows', `Expected to find a row containing "${searchText}", but no such row exists.`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Asserts that a row does NOT exist with the specified text content.
   * @param searchText Text to search for in the row
   * @param message Custom error message
   */
  async assertRowDoesNotExist(searchText: string | RegExp, message?: string): Promise<void> {
    try {
      await this.tableInteractor.findRowByText(searchText);
      const errorMessage = message || 
        createTableError('rows', `Expected no row to contain "${searchText}", but found a matching row.`);
      throw new Error(errorMessage);
    } catch (error) {
      // If findRowByText throws an error, it means no row was found, which is what we want
      if (error instanceof Error && error.message.includes('No row found')) {
        return; // Success - row doesn't exist
      }
      throw error; // Re-throw if it's a different error
    }
  }

  /**
   * Asserts that a specific column exists in the table.
   * @param headerText Expected column header text
   * @param message Custom error message
   */
  async assertColumnExists(headerText: string, message?: string): Promise<void> {
    const headers = await this.tableInteractor.getHeaders();
    if (!headers.includes(headerText)) {
      const errorMessage = message || 
        createTableError('headers', `Expected column "${headerText}" to exist, but it was not found. Available columns: ${headers.join(', ')}`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Asserts that the table has the expected headers.
   * @param expectedHeaders Array of expected header names
   * @param message Custom error message
   */
  async assertHeaders(expectedHeaders: string[], message?: string): Promise<void> {
    const actualHeaders = await this.tableInteractor.getHeaders();
    
    if (actualHeaders.length !== expectedHeaders.length) {
      const errorMessage = message || 
        createTableError('headers', `Expected ${expectedHeaders.length} headers but found ${actualHeaders.length}. Expected: [${expectedHeaders.join(', ')}], Actual: [${actualHeaders.join(', ')}]`, expectedHeaders.length, actualHeaders.length);
      throw new Error(errorMessage);
    }

    for (let i = 0; i < expectedHeaders.length; i++) {
      if (actualHeaders[i] !== expectedHeaders[i]) {
        const errorMessage = message || 
          createTableError('headers', `Header mismatch at position ${i}. Expected "${expectedHeaders[i]}" but found "${actualHeaders[i]}".`, expectedHeaders[i], actualHeaders[i]);
        throw new Error(errorMessage);
      }
    }
  }

  /**
   * Asserts that the table contains the expected data.
   * @param expectedData Expected table data structure
   * @param message Custom error message
   */
  async assertTableData(expectedData: TableData, message?: string): Promise<void> {
    const actualData = await this.tableInteractor.extractTableData();

    // Assert headers
    await this.assertHeaders(expectedData.headers, message);

    // Assert row count
    await this.assertRowCount(expectedData.rows.length, message);

    // Assert each row's data
    for (let rowIndex = 0; rowIndex < expectedData.rows.length; rowIndex++) {
      const expectedRow = expectedData.rows[rowIndex];
      const actualRow = actualData.rows[rowIndex];

      for (const [header, expectedValue] of Object.entries(expectedRow)) {
        const actualValue = actualRow[header];
        if (actualValue !== expectedValue) {
          const errorMessage = message || 
            createTableError('data', `Data mismatch at row ${rowIndex}, column "${header}". Expected "${expectedValue}" but found "${actualValue}".`, expectedValue, actualValue);
          throw new Error(errorMessage);
        }
      }
    }
  }

  /**
   * Asserts that the table is empty (has no data rows).
   * @param message Custom error message
   */
  async assertTableIsEmpty(message?: string): Promise<void> {
    const rowCount = await this.tableInteractor.getRowCount();
    if (rowCount > 0) {
      const errorMessage = message || 
        createTableError('rows', `Expected table to be empty but found ${rowCount} data rows.`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Asserts that the table is not empty (has at least one data row).
   * @param message Custom error message
   */
  async assertTableIsNotEmpty(message?: string): Promise<void> {
    const rowCount = await this.tableInteractor.getRowCount();
    if (rowCount === 0) {
      const errorMessage = message || 
        createTableError('rows', `Expected table to have data rows but table is empty.`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Asserts that a specific column contains the expected values.
   * @param headerText Column header text
   * @param expectedValues Array of expected values in the column
   * @param message Custom error message
   */
  async assertColumnValues(
    headerText: string,
    expectedValues: string[],
    message?: string
  ): Promise<void> {
    const tableData = await this.tableInteractor.extractTableData();
    
    if (!tableData.headers.includes(headerText)) {
      const errorMessage = createTableError('headers', `Column "${headerText}" not found. Available columns: ${tableData.headers.join(', ')}`);
      throw new Error(errorMessage);
    }

    const actualValues = tableData.rows.map(row => row[headerText]);

    if (actualValues.length !== expectedValues.length) {
      const errorMessage = message || 
        createTableError('rows', `Expected ${expectedValues.length} values in column "${headerText}" but found ${actualValues.length}.`, expectedValues.length, actualValues.length);
      throw new Error(errorMessage);
    }

    for (let i = 0; i < expectedValues.length; i++) {
      if (actualValues[i] !== expectedValues[i]) {
        const errorMessage = message || 
          createTableError('cell', `Value mismatch in column "${headerText}" at row ${i}. Expected "${expectedValues[i]}" but found "${actualValues[i]}".`, expectedValues[i], actualValues[i]);
        throw new Error(errorMessage);
      }
    }
  }

  /**
   * Asserts that a cell value matches a regular expression.
   * @param rowIndex Row index (0-based)
   * @param headerText Column header text
   * @param regex Regular expression to match against
   * @param message Custom error message
   */
  async assertCellMatchesRegex(
    rowIndex: number,
    headerText: string,
    regex: RegExp,
    message?: string
  ): Promise<void> {
    const tableData = await this.tableInteractor.extractTableData();
    
    if (rowIndex >= tableData.rows.length) {
      const errorMessage = createTableError('rows', `Row index ${rowIndex} is out of bounds. Table has ${tableData.rows.length} rows.`, undefined, tableData.rows.length);
      throw new Error(errorMessage);
    }

    const row = tableData.rows[rowIndex];
    const cellValue = row[headerText];

    if (cellValue === undefined) {
      const errorMessage = createTableError('headers', `Header "${headerText}" not found in table. Available headers: ${tableData.headers.join(', ')}`);
      throw new Error(errorMessage);
    }

    if (!regex.test(cellValue)) {
      const errorMessage = message || 
        createTableError('cell', `Cell value "${cellValue}" at row ${rowIndex}, column "${headerText}" does not match regex ${regex}.`, regex.toString(), cellValue);
      throw new Error(errorMessage);
    }
  }

  /**
   * Asserts that the table structure is valid (has headers and proper structure).
   * @param message Custom error message
   */
  async assertTableStructure(message?: string): Promise<void> {
    try {
      const headers = await this.tableInteractor.getHeaders();
      if (headers.length === 0) {
        const errorMessage = createTableError('structure', 'Table has no valid headers.');
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = message || 
        createTableError('structure', `Table structure is invalid: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(errorMessage);
    }
  }
} 