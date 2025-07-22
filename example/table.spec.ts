import { test, expect } from '@playwright/test';
import { TableInteractor } from '../src/tableInteractor';

test.describe('Tabulon TableInteractor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${__dirname}/table.html`);
  });

  test('should get headers correctly', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const headers = await table.getHeaders();
    expect(headers).toEqual(['Dish', 'Chef', 'Category', 'Actions']);
  });

  test('should find row by exact match string', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText('Sushi Roll');
    expect(row).not.toBeNull();
  });

  test('should find row by RegExp match', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText(/Margherita/);
    expect(row).not.toBeNull();
  });

  test('should get cell by header', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText('Margherita Pizza');
    expect(row).not.toBeNull();

    if (row) {
      const chefCell = await table.getCellByHeader(row, 'Chef');
      const chefText = await chefCell?.textContent();
      expect(chefText?.trim()).toBe('Chef Mario');
    }
  });

  test('should get cell by index correctly', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText('Sushi Roll');
    expect(row).not.toBeNull();

    if (row) {
      const categoryCell = await table.getCellByIndex(row, 2);
      const categoryText = await categoryCell.textContent();
      expect(categoryText?.trim()).toBe('Japanese');
    }
  });

  test('should get cell by index with empty first column', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText('Margherita Pizza');
    expect(row).not.toBeNull();

    if (row) {
      const dishCell = await table.getCellByIndex(row, 0);
      const dishText = await dishCell.textContent();
      expect(dishText?.trim()).toBe('Margherita Pizza');

      const chefCell = await table.getCellByIndex(row, 1);
      const chefText = await chefCell.textContent();
      expect(chefText?.trim()).toBe('Chef Mario');

      const categoryCell = await table.getCellByIndex(row, 2);
      const categoryText = await categoryCell.textContent();
      expect(categoryText?.trim()).toBe('Italian');
    }
  });

  test('should return individual cell content, not whole row', async ({
    page,
  }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText('Margherita Pizza');
    expect(row).not.toBeNull();

    if (row) {
      const cell = await table.getCellByIndex(row, 0);
      const cellText = await cell.textContent();
      expect(cellText?.trim()).toBe('Margherita Pizza');
      expect(cellText).not.toContain('Chef Mario');
      expect(cellText).not.toContain('Italian');
      expect(cellText).not.toContain('Edit');
    }
  });

  test('should handle cells with long content correctly', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText('Sushi Roll');
    expect(row).not.toBeNull();

    if (row) {
      // Test that long content in legitimate cells is preserved
      const chefCell = await table.getCellByIndex(row, 1);
      const chefText = await chefCell.textContent();
      expect(chefText?.trim()).toBe('Chef Tanaka');

      // Verify it's not the entire row content
      expect(chefText).not.toContain('Sushi Roll');
      expect(chefText).not.toContain('Japanese');
      expect(chefText).not.toContain('Edit');
    }
  });

  test("should skip cells that contain other cells' content", async ({
    page,
  }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText('Sushi Roll');
    expect(row).not.toBeNull();

    if (row) {
      // The first meaningful cell should be the dish name, not a cell containing all data
      const firstCell = await table.getCellByIndex(row, 0);
      const firstCellText = await firstCell.textContent();
      expect(firstCellText?.trim()).toBe('Sushi Roll');

      // Verify it doesn't contain other cells' content
      expect(firstCellText).not.toContain('Chef Tanaka');
      expect(firstCellText).not.toContain('Japanese');
    }
  });

  test('should work with getCellByIndex for all valid indices', async ({
    page,
  }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText('Sushi Roll');
    expect(row).not.toBeNull();

    if (row) {
      // Test all valid indices
      const cell0 = await table.getCellByIndex(row, 0);
      const cell1 = await table.getCellByIndex(row, 1);
      const cell2 = await table.getCellByIndex(row, 2);
      const cell3 = await table.getCellByIndex(row, 3);

      expect(await cell0.textContent()).toBe('Sushi Roll');
      expect(await cell1.textContent()).toBe('Chef Tanaka');
      expect(await cell2.textContent()).toBe('Japanese');
      expect(await cell3.textContent()).toBe('Edit');
    }
  });

  test('should throw error for out of bounds index', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText('Margherita Pizza');
    expect(row).not.toBeNull();

    if (row) {
      await expect(table.getCellByIndex(row, 10)).rejects.toThrow(
        'Column index 10 is out of bounds'
      );
    }
  });

  test('should throw error for negative index', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText('Margherita Pizza');
    expect(row).not.toBeNull();

    if (row) {
      await expect(table.getCellByIndex(row, -1)).rejects.toThrow(
        'Column index -1 is invalid'
      );
    }
  });

  test('should extract structured table data', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const data = await table.extractTableData();

    expect(data.headers).toEqual(['Dish', 'Chef', 'Category', 'Actions']);
    expect(data.rows).toHaveLength(2);
    expect(data.rows).toContainEqual({
      Dish: 'Margherita Pizza',
      Chef: 'Chef Mario',
      Category: 'Italian',
      Actions: 'Edit',
    });
  });

  test('should throw error for unknown header', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText('Margherita Pizza');
    expect(row).not.toBeNull();

    if (row) {
      await expect(async () => {
        await table.getCellByHeader(row, 'Nonexistent');
      }).rejects.toThrow(/Header "Nonexistent" not found/);
    }
  });

  test('should auto-initialize headers on extractTableData', async ({
    page,
  }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const data = await table.extractTableData(); // No manual init
    expect(data.headers).toContain('Category');
    expect(data.rows[0].Category).toBe('Italian');
  });

  test('should return the correct row count', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const rowCount = await table.getRowCount();
    expect(rowCount).toBe(2); // Assuming there are 2 rows in the example table
  });

  test('should click the Edit button in the Actions column', async ({
    page,
  }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    // Click the Edit button in the first row (rowIndex 0) in the Actions column
    await table.clickCellAction(0, 'Actions', 'button');
    // After clicking, check for a visible change or side effect
    // For example, assume clicking Edit shows an alert or changes a cell value
    // Here, we'll check if an element with id #editMessage appears
    const editMessage = page.locator('#editMessage');
    await expect(editMessage).toBeVisible();
  });

  test('should return headers copy to prevent mutation', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const headers1 = await table.getHeaders();
    const headers2 = await table.getHeaders();

    // Modify the returned array
    headers1.push('Extra Header');

    // Get headers again - should be unchanged
    const headers3 = await table.getHeaders();
    expect(headers3).toEqual(['Dish', 'Chef', 'Category', 'Actions']);
    expect(headers3).not.toEqual(headers1);
  });

  // Additional tests for meaningful cell detection and extractTableData
  test('should extract table data with proper column separation', async ({
    page,
  }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const data = await table.extractTableData();

    // Verify each row has properly separated data
    const pizzaRow = data.rows.find((row) => row.Dish === 'Margherita Pizza');
    expect(pizzaRow).toBeDefined();
    expect(pizzaRow?.Chef).toBe('Chef Mario');
    expect(pizzaRow?.Category).toBe('Italian');
    expect(pizzaRow?.Actions).toBe('Edit');

    const sushiRow = data.rows.find((row) => row.Dish === 'Sushi Roll');
    expect(sushiRow).toBeDefined();
    expect(sushiRow?.Chef).toBe('Chef Tanaka');
    expect(sushiRow?.Category).toBe('Japanese');
    expect(sushiRow?.Actions).toBe('Edit');
  });

  test('should not concatenate all data into first column', async ({
    page,
  }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const data = await table.extractTableData();

    // Verify that the first column doesn't contain all the data concatenated
    const pizzaRow = data.rows.find((row) => row.Dish === 'Margherita Pizza');
    expect(pizzaRow?.Dish).toBe('Margherita Pizza');
    expect(pizzaRow?.Dish).not.toContain('Chef Mario');
    expect(pizzaRow?.Dish).not.toContain('Italian');
    expect(pizzaRow?.Dish).not.toContain('Edit');
  });

  test('should handle empty cells correctly in extractTableData', async ({
    page,
  }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const data = await table.extractTableData();

    // All cells should have proper values, not empty strings
    data.rows.forEach((row) => {
      expect(row.Dish).toBeTruthy();
      expect(row.Chef).toBeTruthy();
      expect(row.Category).toBeTruthy();
      expect(row.Actions).toBeTruthy();
    });
  });

  test('should maintain header-to-cell mapping consistency', async ({
    page,
  }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const data = await table.extractTableData();

    // Verify that getCellByHeader and extractTableData return consistent data
    const row = await table.findRowByText('Margherita Pizza');
    const chefCell = await table.getCellByHeader(row, 'Chef');
    const chefFromCell = await chefCell.textContent();

    const pizzaRow = data.rows.find((row) => row.Dish === 'Margherita Pizza');
    expect(pizzaRow?.Chef).toBe(chefFromCell?.trim());
  });

  test('should handle table with no data rows', async ({ page }) => {
    // Create a table with headers but no data rows
    await page.evaluate(() => {
      const table = document.getElementById('usersTable');
      const tbody = table?.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = '';
      }
    });

    const table = new TableInteractor(page.locator('#usersTable'));
    const data = await table.extractTableData();

    expect(data.headers).toEqual(['Dish', 'Chef', 'Category', 'Actions']);
    expect(data.rows).toHaveLength(0);
  });

  test('should handle table with mixed content types', async ({ page }) => {
    // Add a row with mixed content (text, numbers, special characters)
    await page.evaluate(() => {
      const tbody = document.querySelector('#usersTable tbody');
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>Test Dish</td>
        <td>test@example.com</td>
        <td>123</td>
        <td><button>Delete</button></td>
      `;
      tbody?.appendChild(newRow);
    });

    const table = new TableInteractor(page.locator('#usersTable'));
    const data = await table.extractTableData();

    const testRow = data.rows.find((row) => row.Dish === 'Test Dish');
    expect(testRow).toBeDefined();
    expect(testRow?.Chef).toBe('test@example.com');
    expect(testRow?.Category).toBe('123');
    expect(testRow?.Actions).toBe('Delete');
  });

  test('should handle whitespace in cell content', async ({ page }) => {
    // Add a row with extra whitespace
    await page.evaluate(() => {
      const tbody = document.querySelector('#usersTable tbody');
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>  Whitespace Dish  </td>
        <td>  whitespace@example.com  </td>
        <td>  Pending  </td>
        <td><button>  View  </button></td>
      `;
      tbody?.appendChild(newRow);
    });

    const table = new TableInteractor(page.locator('#usersTable'));
    const data = await table.extractTableData();

    const whitespaceRow = data.rows.find(
      (row) => row.Dish === 'Whitespace Dish'
    );
    expect(whitespaceRow).toBeDefined();
    expect(whitespaceRow?.Chef).toBe('whitespace@example.com');
    expect(whitespaceRow?.Category).toBe('Pending');
    expect(whitespaceRow?.Actions).toBe('View');
  });

  test('should handle table with duplicate headers', async ({ page }) => {
    // Create a table with duplicate headers
    await page.evaluate(() => {
      const table = document.getElementById('usersTable');
      const thead = table?.querySelector('thead tr');
      if (thead) {
        thead.innerHTML =
          '<th>Dish</th><th>Dish</th><th>Category</th><th>Actions</th>';
      }
    });

    const table = new TableInteractor(page.locator('#usersTable'));
    await expect(table.getHeaders()).rejects.toThrow(/duplicate header names/);
  });

  test('should handle table with all empty headers', async ({ page }) => {
    // Create a table with empty headers
    await page.evaluate(() => {
      const table = document.getElementById('usersTable');
      const thead = table?.querySelector('thead tr');
      if (thead) {
        thead.innerHTML = '<th></th><th></th><th></th><th></th>';
      }
    });

    const table = new TableInteractor(page.locator('#usersTable'));
    await expect(table.getHeaders()).rejects.toThrow(/No valid headers found/);
  });

  test('should handle table with no headers', async ({ page }) => {
    // Create a table with no headers
    await page.evaluate(() => {
      const table = document.getElementById('usersTable');
      const thead = table?.querySelector('thead');
      if (thead) {
        thead.innerHTML = '';
      }
    });

    const table = new TableInteractor(page.locator('#usersTable'));
    await expect(table.getHeaders()).rejects.toThrow(
      /Table has no header elements/
    );
  });

  test('should handle table that becomes visible after delay', async ({
    page,
  }) => {
    // Hide the table initially
    await page.evaluate(() => {
      const table = document.getElementById('usersTable');
      if (table) {
        table.style.display = 'none';
      }
    });

    const table = new TableInteractor(page.locator('#usersTable'));

    // Show the table after a delay
    setTimeout(async () => {
      await page.evaluate(() => {
        const table = document.getElementById('usersTable');
        if (table) {
          table.style.display = 'table';
        }
      });
    }, 100);

    // This should wait for the table to become visible
    const headers = await table.getHeaders();
    expect(headers).toEqual(['Dish', 'Chef', 'Category', 'Actions']);
  });

  test('should handle multiple calls to extractTableData consistently', async ({
    page,
  }) => {
    const table = new TableInteractor(page.locator('#usersTable'));

    const data1 = await table.extractTableData();
    const data2 = await table.extractTableData();

    expect(data1).toEqual(data2);
    expect(data1.headers).toEqual(data2.headers);
    expect(data1.rows).toEqual(data2.rows);
  });

  test('should handle getCellByIndex with meaningful cell detection', async ({
    page,
  }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const row = await table.findRowByText('Margherita Pizza');

    // Test that getCellByIndex returns meaningful cells in correct order
    const cell0 = await table.getCellByIndex(row, 0);
    const cell1 = await table.getCellByIndex(row, 1);
    const cell2 = await table.getCellByIndex(row, 2);
    const cell3 = await table.getCellByIndex(row, 3);

    expect(await cell0.textContent()).toBe('Margherita Pizza');
    expect(await cell1.textContent()).toBe('Chef Mario');
    expect(await cell2.textContent()).toBe('Italian');
    expect(await cell3.textContent()).toBe('Edit');

    // Verify each cell contains only its own content
    const cell0Text = await cell0.textContent();
    expect(cell0Text).not.toContain('Chef Mario');
    expect(cell0Text).not.toContain('Italian');
    expect(cell0Text).not.toContain('Edit');
  });
});
