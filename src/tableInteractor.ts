import { Locator } from '@playwright/test';
import { TableRow, TableCell, TableData } from './types';

/**
 * Provides utilities to interact with HTML tables in Playwright tests.
 */
export class TableInteractor {
  private tableLocator: Locator;
  private headerLocators: Locator[] = [];
  private headers: string[] = [];
  private headerToIndexMap: Map<string, number> = new Map(); // Add this line
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
   * Gets the table headers. Initializes headers if not already done.
   * @returns Promise<string[]> Array of header names
   * @throws {Error} If table has no headers, invalid structure, or all headers are empty
   */
  public async getHeaders(): Promise<string[]> {
    if (this.headers.length === 0) {
      await this.initializeHeaders();
    }
    return [...this.headers]; // Return copy to prevent external mutation
  }

  /**
   * Initializes and stores the table headers.
   * @throws {Error} If table has no headers, invalid structure, or all headers are empty
   */
  private async initializeHeaders(): Promise<void> {
    await this.ensureTableVisible();

    // Check if headers are already initialized
    if (this.headers.length > 0) {
      return;
    }

    // Get header elements with better selector
    const headerElements = this.tableLocator.locator('thead th, thead td');
    const headerCount = await headerElements.count();

    if (headerCount === 0) {
      throw new Error(
        'Table has no header elements. Expected <th> or <td> elements in <thead>.'
      );
    }

    this.headerLocators = await headerElements.all();

    // Extract header text and preserve original column indices
    const extractedHeaders = await Promise.all(
      this.headerLocators.map(async (header, index) => {
        try {
          const text = await header.textContent();
          const trimmedText = text?.trim() || '';
          return { text: trimmedText, originalIndex: index };
        } catch (error) {
          console.warn(
            `Failed to extract header at index ${index}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
          return { text: '', originalIndex: index };
        }
      })
    );

    // Filter out empty headers but preserve the mapping
    const validHeaders = extractedHeaders.filter(
      (header) => header.text.length > 0
    );

    // Build headers array and mapping
    this.headers = validHeaders.map((header) => header.text);
    this.headerToIndexMap.clear();
    validHeaders.forEach((header) => {
      this.headerToIndexMap.set(header.text, header.originalIndex);
    });

    // Ensure we have at least one valid header
    if (this.headers.length === 0) {
      throw new Error(
        'No valid headers found in table. All headers are empty or failed to extract.'
      );
    }

    // Validate header uniqueness
    const uniqueHeaders = new Set(this.headers);
    if (uniqueHeaders.size !== this.headers.length) {
      const duplicates = this.headers.filter(
        (header, index) => this.headers.indexOf(header) !== index
      );
      throw new Error(
        `Table contains duplicate header names: ${duplicates.join(
          ', '
        )}. Headers must be unique.`
      );
    }
  }

  /**
   * Finds the first row where any cell matches the given text or RegExp.
   * @param searchText Text or RegExp to match
   * @throws {Error} If no row matches the search criteria
   */
  public async findRowByText(searchText: string | RegExp): Promise<Locator> {
    await this.ensureTableVisible();
    // Get only direct child tr elements (not nested ones)
    const rows = await this.tableLocator.locator('tbody > tr').all();
    for (const row of rows) {
      // Skip rows that are inside nested tables
      const hasNestedTableParent =
        (await row.locator('xpath=ancestor::table[position()>1]').count()) > 0;
      if (hasNestedTableParent) {
        continue;
      }

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
    throw new Error(
      `No row found matching "${searchText}". Available rows: ${await this.getRowCount()}`
    );
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
    const index = this.headerToIndexMap.get(headerText.trim());
    if (index === undefined) {
      throw new Error(`Header "${headerText}" not found.`);
    }
    return rowLocator.locator('td').nth(index);
  }

  /**
   * Gets a cell from a row by column index (0-based).
   * Automatically skips empty columns at the beginning of the table.
   * @param rowLocator The row to query
   * @param index Column index (0-based, relative to meaningful data columns)
   * @throws {Error} If index is out of bounds
   */
  public async getCellByIndex(
    rowLocator: Locator,
    index: number
  ): Promise<Locator> {
    await this.ensureTableVisible();

    if (index < 0) {
      throw new Error(
        `Column index ${index} is invalid. Index must be 0 or greater.`
      );
    }

    // Get only direct child td elements (not nested ones)
    const allCells = await rowLocator.locator('> td').all();
    const cellTexts = [];

    // Get all cell texts
    for (let i = 0; i < allCells.length; i++) {
      const cellText = await allCells[i].textContent();
      cellTexts.push(cellText || '');
    }

    const meaningfulCells = [];

    for (let i = 0; i < allCells.length; i++) {
      const cell = allCells[i];
      const cellText = cellTexts[i];

      // Layer 1: Check HTML structure - include cells that contain other cells (nested tables)
      const hasNestedCells = (await cell.locator('td').count()) > 0;
      if (hasNestedCells) {
        // For cells with nested tables, include the cell itself
        meaningfulCells.push(cell);
        continue;
      }

      // Layer 2: Check if this cell contains content from other cells
      const containsOtherCellContent = cellTexts
        .slice(i + 1)
        .some(
          (otherCellText) =>
            otherCellText &&
            otherCellText.trim() &&
            cellText.includes(otherCellText.trim())
        );
      if (containsOtherCellContent) {
        continue;
      }

      // Layer 3: Basic empty cell handling
      if (cellText && cellText.trim().length > 0) {
        meaningfulCells.push(cell);
      } else if (meaningfulCells.length > 0) {
        // Include empty cells only after we've found meaningful ones
        meaningfulCells.push(cell);
      }
    }

    if (index >= meaningfulCells.length) {
      throw new Error(
        `Column index ${index} is out of bounds. Row has ${
          meaningfulCells.length
        } meaningful columns (valid range: 0 to ${meaningfulCells.length - 1}).`
      );
    }

    return meaningfulCells[index];
  }

  /**
   * Extracts all data from the table as an array of objects.
   */
  public async extractTableData(): Promise<TableData> {
    await this.ensureTableVisible();
    if (this.headers.length === 0) {
      await this.initializeHeaders();
    }

    // Get only direct child tr elements (not nested ones)
    const allRowLocators = await this.tableLocator.locator('tbody > tr').all();
    const rows: { [key: string]: string }[] = [];

    // Filter out rows that are inside nested tables
    const rowLocators = [];
    for (const rowLocator of allRowLocators) {
      const hasNestedTableParent =
        (await rowLocator
          .locator('xpath=ancestor::table[position()>1]')
          .count()) > 0;
      if (!hasNestedTableParent) {
        rowLocators.push(rowLocator);
      }
    }

    for (const rowLocator of rowLocators) {
      // Get only direct child td elements (not nested ones)
      const allCells = await rowLocator.locator('> td').all();
      const cellTexts = [];

      // Get all cell texts
      for (let i = 0; i < allCells.length; i++) {
        const cellText = await allCells[i].textContent();
        cellTexts.push(cellText || '');
      }

      const meaningfulCells = [];

      for (let i = 0; i < allCells.length; i++) {
        const cell = allCells[i];
        const cellText = cellTexts[i];

        // Layer 1: Check HTML structure - skip cells that contain other cells
        const hasNestedCells = (await cell.locator('td').count()) > 0;
        if (hasNestedCells) {
          // For cells with nested tables, include the entire text content
          meaningfulCells.push(cellText.trim());
          continue;
        }

        // Layer 2: Check if this cell contains content from other cells
        const containsOtherCellContent = cellTexts
          .slice(i + 1)
          .some(
            (otherCellText) =>
              otherCellText &&
              otherCellText.trim() &&
              cellText.includes(otherCellText.trim())
          );
        if (containsOtherCellContent) {
          continue;
        }

        // Layer 3: Basic empty cell handling
        if (cellText && cellText.trim().length > 0) {
          meaningfulCells.push(cellText.trim());
        } else if (meaningfulCells.length > 0) {
          // Include empty cells only after we've found meaningful ones
          meaningfulCells.push(cellText.trim());
        }
      }

      const row: { [key: string]: string } = {};
      for (
        let i = 0;
        i < Math.min(meaningfulCells.length, this.headers.length);
        i++
      ) {
        const header = this.headers[i];
        const cellText = meaningfulCells[i];
        if (header) {
          row[header] = cellText;
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
    // Count only direct child tr elements (not nested ones)
    const allRows = await this.tableLocator.locator('tbody > tr').all();
    let count = 0;
    for (const row of allRows) {
      const hasNestedTableParent =
        (await row.locator('xpath=ancestor::table[position()>1]').count()) > 0;
      if (!hasNestedTableParent) {
        count++;
      }
    }
    return count;
  }

  /**
   * Clicks a button or link in a specific cell by row and header.
   * @param rowIndex Index of the row (0-based)
   * @param headerText Header of the column containing the button/link
   * @param selector CSS selector for the button/link inside the cell
   */
  public async clickCellAction(
    rowIndex: number,
    headerText: string,
    selector: string
  ): Promise<void> {
    await this.ensureTableVisible();
    if (this.headers.length === 0) {
      await this.initializeHeaders();
    }
    // Get only direct child tr elements (not nested ones)
    const allRows = await this.tableLocator.locator('tbody > tr').all();
    const mainTableRows = [];
    for (const row of allRows) {
      const hasNestedTableParent =
        (await row.locator('xpath=ancestor::table[position()>1]').count()) > 0;
      if (!hasNestedTableParent) {
        mainTableRows.push(row);
      }
    }
    const rowLocator = mainTableRows[rowIndex];
    const cellLocator = await this.getCellByHeader(rowLocator, headerText);
    await cellLocator.locator(selector).click();
  }
}
