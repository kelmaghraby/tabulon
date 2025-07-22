import { test, expect } from '@playwright/test';
import { TableInteractor } from '../src/tableInteractor';

test.describe('Tabulon TableInteractor - Complex Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${__dirname}/complex-table.html`);
  });

  test('should handle complex table with proper column separation', async ({
    page,
  }) => {
    const table = new TableInteractor(page.locator('#complexTable'));
    const data = await table.extractTableData();

    expect(data.headers).toEqual([
      'Title',
      'Author',
      'Genre',
      'ISBN',
      'Status',
      'Rating',
    ]);
    expect(data.rows).toHaveLength(2);

    const firstRow = data.rows[0];
    expect(firstRow.Title).toBe('The Great Gatsby');
    expect(firstRow.Author).toBe('F. Scott Fitzgerald');
    expect(firstRow.Genre).toBe('Classic Fiction');
    expect(firstRow.ISBN).toBe('978-0743273565');
    expect(firstRow.Status).toBe('Available');
    expect(firstRow.Rating).toBe('4.5/5');

    // Verify no concatenation of data
    expect(firstRow.Title).not.toContain('F. Scott Fitzgerald');
    expect(firstRow.Title).not.toContain('Classic Fiction');
    expect(firstRow.Title).not.toContain('Available');
  });

  test('should handle table with empty first column', async ({ page }) => {
    const table = new TableInteractor(page.locator('#emptyFirstColumnTable'));
    const data = await table.extractTableData();

    expect(data.headers).toEqual(['Book', 'Author', 'Available']);
    expect(data.rows).toHaveLength(2);

    const firstRow = data.rows[0];
    expect(firstRow.Book).toBe('1984');
    expect(firstRow.Author).toBe('George Orwell');
    expect(firstRow.Available).toBe('Yes');

    // Test getCellByIndex with empty first column
    const row = await table.findRowByText('1984');
    const bookCell = await table.getCellByIndex(row, 0);
    expect(await bookCell.textContent()).toBe('1984');
  });

  test('should handle nested table cells correctly', async ({ page }) => {
    const table = new TableInteractor(page.locator('#nestedTable'));
    const data = await table.extractTableData();

    expect(data.headers).toEqual(['Category', 'Details', 'Actions']);
    expect(data.rows).toHaveLength(2);

    const scienceFictionRow = data.rows[0];
    expect(scienceFictionRow.Category).toBe('Science Fiction');
    expect(scienceFictionRow.Actions).toBe('Edit');

    // The Details cell should contain the nested table content
    expect(scienceFictionRow.Details).toContain('Dune');
    expect(scienceFictionRow.Details).toContain('1984');
    expect(scienceFictionRow.Details).toContain('Frank Herbert');
    expect(scienceFictionRow.Details).toContain('George Orwell');

    const mysteryRow = data.rows[1];
    expect(mysteryRow.Category).toBe('Mystery');
    expect(mysteryRow.Details).toBe('Sherlock Holmes Collection');
    expect(mysteryRow.Actions).toBe('View');
  });

  test('should handle mixed content types', async ({ page }) => {
    const table = new TableInteractor(page.locator('#mixedTable'));
    const data = await table.extractTableData();

    expect(data.headers).toEqual(['ID', 'Description', 'Pages', 'Published']);
    expect(data.rows).toHaveLength(2);

    const firstRow = data.rows[0];
    expect(firstRow.ID).toBe('001');
    expect(firstRow.Description).toBe('Adventure novel');
    expect(firstRow.Pages).toBe('350');
    expect(firstRow.Published).toBe('2020-03-15');

    const secondRow = data.rows[1];
    expect(secondRow.ID).toBe('002');
    expect(secondRow.Description).toBe('Poetry collection');
    expect(secondRow.Pages).toBe('120');
    expect(secondRow.Published).toBe('2021-07-22');
  });

  test('should handle getCellByIndex with complex table', async ({ page }) => {
    const table = new TableInteractor(page.locator('#complexTable'));
    const row = await table.findRowByText('The Great Gatsby');

    const titleCell = await table.getCellByIndex(row, 0);
    const authorCell = await table.getCellByIndex(row, 1);
    const genreCell = await table.getCellByIndex(row, 2);
    const isbnCell = await table.getCellByIndex(row, 3);
    const statusCell = await table.getCellByIndex(row, 4);
    const ratingCell = await table.getCellByIndex(row, 5);

    expect(await titleCell.textContent()).toBe('The Great Gatsby');
    expect(await authorCell.textContent()).toBe('F. Scott Fitzgerald');
    expect(await genreCell.textContent()).toBe('Classic Fiction');
    expect(await isbnCell.textContent()).toBe('978-0743273565');
    expect(await statusCell.textContent()).toBe('Available');
    expect(await ratingCell.textContent()).toBe('4.5/5');
  });

  test('should handle getCellByHeader with complex table', async ({ page }) => {
    const table = new TableInteractor(page.locator('#complexTable'));
    const row = await table.findRowByText('The Great Gatsby');

    const titleCell = await table.getCellByHeader(row, 'Title');
    const authorCell = await table.getCellByHeader(row, 'Author');
    const genreCell = await table.getCellByHeader(row, 'Genre');

    expect(await titleCell.textContent()).toBe('The Great Gatsby');
    expect(await authorCell.textContent()).toBe('F. Scott Fitzgerald');
    expect(await genreCell.textContent()).toBe('Classic Fiction');
  });

  test('should handle clickCellAction with complex table', async ({ page }) => {
    const table = new TableInteractor(page.locator('#complexTable'));

    // Add a button with event listener to the first row
    await page.evaluate(() => {
      const firstRow = document.querySelector('#complexTable tbody tr');
      const actionsCell = firstRow?.querySelector('td:nth-child(6)');
      if (actionsCell) {
        actionsCell.innerHTML = '<button>Edit</button>';
        // Add event listener to the new button
        const button = actionsCell.querySelector('button');
        if (button) {
          button.addEventListener('click', () => {
            const results = document.getElementById('testResults');
            if (results) {
              results.textContent = `Button clicked: ${button.textContent}`;
              results.style.display = 'block';
            }
          });
        }
      }
    });

    await table.clickCellAction(0, 'Rating', 'button');

    const results = page.locator('#testResults');
    await expect(results).toBeVisible();
    await expect(results).toHaveText('Button clicked: Edit');
  });

  test('should handle findRowByText with complex content', async ({ page }) => {
    const table = new TableInteractor(page.locator('#complexTable'));

    // Find row by partial text
    const row1 = await table.findRowByText('The Great Gatsby');
    const row2 = await table.findRowByText('F. Scott Fitzgerald');
    const row3 = await table.findRowByText(/Classic Fiction/);

    expect(row1).not.toBeNull();
    expect(row2).not.toBeNull();
    expect(row3).not.toBeNull();

    // Verify they're the same row
    const row1Text = await row1.textContent();
    const row2Text = await row2.textContent();
    const row3Text = await row3.textContent();

    expect(row1Text).toBe(row2Text);
    expect(row2Text).toBe(row3Text);
  });

  test('should handle table with special characters', async ({ page }) => {
    const table = new TableInteractor(page.locator('#complexTable'));
    const data = await table.extractTableData();

    const firstRow = data.rows[0];
    expect(firstRow.Rating).toBe('4.5/5');
    expect(firstRow.ISBN).toBe('978-0743273565');
  });

  test('should handle multiple tables on same page', async ({ page }) => {
    const complexTable = new TableInteractor(page.locator('#complexTable'));
    const emptyFirstColumnTable = new TableInteractor(
      page.locator('#emptyFirstColumnTable')
    );
    const nestedTable = new TableInteractor(page.locator('#nestedTable'));

    const complexData = await complexTable.extractTableData();
    const emptyFirstData = await emptyFirstColumnTable.extractTableData();
    const nestedData = await nestedTable.extractTableData();

    expect(complexData.headers).toEqual([
      'Title',
      'Author',
      'Genre',
      'ISBN',
      'Status',
      'Rating',
    ]);
    expect(emptyFirstData.headers).toEqual(['Book', 'Author', 'Available']);
    expect(nestedData.headers).toEqual(['Category', 'Details', 'Actions']);

    expect(complexData.rows).toHaveLength(2);
    expect(emptyFirstData.rows).toHaveLength(2);
    expect(nestedData.rows).toHaveLength(2);
  });

  test('should handle row count for complex tables', async ({ page }) => {
    const complexTable = new TableInteractor(page.locator('#complexTable'));
    const emptyFirstColumnTable = new TableInteractor(
      page.locator('#emptyFirstColumnTable')
    );
    const nestedTable = new TableInteractor(page.locator('#nestedTable'));

    expect(await complexTable.getRowCount()).toBe(2);
    expect(await emptyFirstColumnTable.getRowCount()).toBe(2);
    expect(await nestedTable.getRowCount()).toBe(2);
  });

  test('should handle edge case with very long cell content', async ({
    page,
  }) => {
    // Add a row with very long content
    await page.evaluate(() => {
      const tbody = document.querySelector('#complexTable tbody');
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>Pride and Prejudice</td>
        <td>Jane Austen</td>
        <td>This is a very long genre description that might cause issues with cell detection and processing</td>
        <td>978-0141439518</td>
        <td>Available</td>
        <td>4.7/5</td>
      `;
      tbody?.appendChild(newRow);
    });

    const table = new TableInteractor(page.locator('#complexTable'));
    const data = await table.extractTableData();

    const longContentRow = data.rows.find(
      (row) => row.Title === 'Pride and Prejudice'
    );
    expect(longContentRow).toBeDefined();
    expect(longContentRow?.Genre).toBe(
      'This is a very long genre description that might cause issues with cell detection and processing'
    );
    expect(longContentRow?.Rating).toBe('4.7/5');
  });

  test('should handle table with mixed empty and non-empty cells', async ({
    page,
  }) => {
    // Add a row with mixed empty and non-empty cells
    await page.evaluate(() => {
      const tbody = document.querySelector('#complexTable tbody');
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>Anonymous Book</td>
        <td>Anonymous</td>
        <td></td>
        <td>978-0000000000</td>
        <td></td>
        <td>3.2/5</td>
      `;
      tbody?.appendChild(newRow);
    });

    const table = new TableInteractor(page.locator('#complexTable'));
    const data = await table.extractTableData();

    const mixedRow = data.rows.find((row) => row.Title === 'Anonymous');
    expect(mixedRow).toBeDefined();
    expect(mixedRow?.Title).toBe('Anonymous');
    expect(mixedRow?.Author).toBe('');
    expect(mixedRow?.Genre).toBe('978-0000000000');
    expect(mixedRow?.Status).toBe('3.2/5');
  });
});
