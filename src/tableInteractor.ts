import { Locator, expect } from '@playwright/test';
import { TableRow, TableCell, TableData } from './types';

/**
 * Provides utilities to interact with HTML tables in Playwright tests.
 */
export class TableInteractor {
  private tableLocator: Locator;
  private headers: string[] = [];

  constructor(tableLocator: Locator) {
    this.tableLocator = tableLocator;
  }

  /**
   * Initializes and stores the table headers.
   */
  public async initializeHeaders(): Promise<void> {
    const headerLocators = await this.tableLocator.locator('thead th').all();
    this.headers = (await Promise.all(
      headerLocators.map(async (header) => (await header.textContent())?.trim() || '')
    )).filter(Boolean);
  }

  /**
   * Finds the first row where any cell matches the given text or RegExp.
   * @param searchText Text or RegExp to match
   */
  public async findRowByText(
    searchText: string | RegExp
  ): Promise<Locator | null> {
    const rows = await this.tableLocator.locator('tbody tr').all();
    for (const row of rows) {
      const text = await row.textContent();
      if (
        text &&
        (typeof searchText === 'string'
          ? text.includes(searchText)
          : searchText.test(text))
      ) {
        return row;
      }
    }
    return null;
  }

  /**
   * Gets a cell from a row by header name.
   * Requires headers to be initialized first.
   * @param rowLocator The row to query
   * @param headerText Column header text
   */
  public async getCellByHeader(rowLocator: Locator, headerText: string): Promise<Locator> {
    if (this.headers.length === 0) {
      await this.initializeHeaders();
    }
    const index = this.headers.findIndex((h) => h === headerText.trim());
    if (index === -1) throw new Error(`Header "${headerText}" not found.`);
    return rowLocator.locator('td').nth(index);
  }

  /**
   * Gets a cell from a row by column index (0-based).
   * @param rowLocator The row to query
   * @param index Column index (0-based)
   */
  public getCellByIndex(rowLocator: Locator, index: number): Locator {
    return rowLocator.locator('td').nth(index);
  }

  /**
   * Extracts all data from the table as an array of objects.
   */
  public async extractTableData(): Promise<TableData> {
    if (this.headers.length === 0) {
      await this.initializeHeaders();
    }

    const rowLocators = await this.tableLocator.locator('tbody tr').all();
    const rows: { [key: string]: string }[] = [];

    for (const rowLocator of rowLocators) {
      const cellLocators = await rowLocator.locator('td').all();
      const cellTexts = await Promise.all(
        cellLocators.map((cell) => cell.textContent())
      );
      const row: { [key: string]: string } = {};
      for (let i = 0; i < cellTexts.length; i++) {
        const header = this.headers[i];
        const cellText = cellTexts[i];
        if (header && cellText !== null) {
          row[header] = cellText.trim();
        }
      }
      rows.push(row);
    }

    return {
      headers: this.headers,
      rows,
    };
  }

  /**
   * Asserts that the table is visible.
   */
  public async assertTableVisible(): Promise<void> {
    if (!(await this.tableLocator.isVisible())) {
      throw new Error('Table is not visible');
    }
  }

  /**
   * Asserts that at least one row is visible in the table.
   */
  public async assertRowsVisible(): Promise<void> {
    const rowLocators = await this.tableLocator.locator('tbody tr').all();
    const visibleRows = await Promise.all(rowLocators.map(row => row.isVisible()));
    if (!visibleRows.some(Boolean)) {
      throw new Error('No visible rows found in the table');
    }
  }

  /**
   * Asserts that a row containing the given text is visible.
   */
  public async assertRowVisibleByText(searchText: string | RegExp): Promise<void> {
    const row = await this.findRowByText(searchText);
    if (!row) {
      throw new Error(`No row found containing text: ${searchText}`);
    }
    if (!(await row.isVisible())) {
      throw new Error(`Row containing text "${searchText}" is not visible`);
    }
  }

  /**
   * Asserts that the row at the given index is visible.
   */
  public async assertRowVisibleByIndex(index: number): Promise<void> {
    const rowLocators = await this.tableLocator.locator('tbody tr').all();
    if (index < 0 || index >= rowLocators.length) {
      throw new Error(`Row index ${index} is out of bounds`);
    }
    if (!(await rowLocators[index].isVisible())) {
      throw new Error(`Row at index ${index} is not visible`);
    }
  }

  /**
   * Asserts that the cell at the given row index and header is visible.
   */
  public async assertCellVisible(rowIndex: number, headerText: string): Promise<void> {
    if (this.headers.length === 0) {
      await this.initializeHeaders();
    }
    const rowLocators = await this.tableLocator.locator('tbody tr').all();
    if (rowIndex < 0 || rowIndex >= rowLocators.length) {
      throw new Error(`Row index ${rowIndex} is out of bounds`);
    }
    const cellLocator = await this.getCellByHeader(rowLocators[rowIndex], headerText);
    if (!(await cellLocator.isVisible())) {
      throw new Error(`Cell in row ${rowIndex}, column "${headerText}" is not visible`);
    }
  }
}
