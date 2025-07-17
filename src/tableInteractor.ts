import { Locator } from '@playwright/test';
import { TableRow, TableCell, TableData } from './types';

/**
 * Provides utilities to interact with HTML tables in Playwright tests.
 */
export class TableInteractor {
  private tableLocator: Locator;
  private headerLocators: Locator[] = [];
  private headers: string[] = [];
  private tableVisible = false;

  constructor(tableLocator: Locator) {
    this.tableLocator = tableLocator;
  }

  /**
   * Ensures the table is visible before performing actions.
   */
  private async ensureTableVisible(): Promise<void> {
    if (!this.tableVisible) {
      await this.tableLocator.waitFor({ state: 'visible' });
      this.tableVisible = true;
    }
  }

  /**
   * Initializes and stores the table headers.
   */
  public async initializeHeaders(): Promise<void> {
    await this.ensureTableVisible();
    this.headerLocators = await this.tableLocator.locator('thead th').all();
    this.headers = await Promise.all(
      this.headerLocators.map(async (header) => {
        const text = await header.textContent();
        return text?.trim() || '';
      })
    );
    this.headers = this.headers.filter(Boolean); // Remove empty headers
  }

  /**
   * Finds the first row where any cell matches the given text or RegExp.
   * @param searchText Text or RegExp to match
   */
  public async findRowByText(
    searchText: string | RegExp
  ): Promise<Locator | null> {
    await this.ensureTableVisible();
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
  public async getCellByHeader(
    rowLocator: Locator,
    headerText: string
  ): Promise<Locator> {
    await this.ensureTableVisible();
    if (this.headers.length === 0) {
      await this.initializeHeaders();
    }
    const index = this.headers.findIndex((h) => h === headerText.trim());
    if (index === -1) {
      throw new Error(`Header "${headerText}" not found.`);
    }
    return rowLocator.locator('td').nth(index);
  }

  /**
   * Gets a cell from a row by column index (0-based).
   * @param rowLocator The row to query
   * @param index Column index (0-based)
   */
  public async getCellByIndex(
    rowLocator: Locator,
    index: number
  ): Promise<Locator> {
    await this.ensureTableVisible();
    return rowLocator.locator('td').nth(index);
  }

  /**
   * Extracts all data from the table as an array of objects.
   */
  public async extractTableData(): Promise<TableData> {
    await this.ensureTableVisible();
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
   * Returns the number of data rows in the table.
   */
  public async getRowCount(): Promise<number> {
    await this.ensureTableVisible();
    return await this.tableLocator.locator('tbody tr').count();
  }

  /**
   * Clicks a button or link in a specific cell by row and header.
   * @param rowIndex Index of the row (0-based)
   * @param headerText Header of the column containing the button/link
   * @param selector CSS selector for the button/link inside the cell
   */
  public async clickCellAction(rowIndex: number, headerText: string, selector: string): Promise<void> {
    await this.ensureTableVisible();
    if (this.headers.length === 0) {
      await this.initializeHeaders();
    }
    const rowLocator = this.tableLocator.locator('tbody tr').nth(rowIndex);
    const cellLocator = await this.getCellByHeader(rowLocator, headerText);
    await cellLocator.locator(selector).click();
  }
}
