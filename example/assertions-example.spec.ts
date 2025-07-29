import { test, expect } from '@playwright/test';
import { TableInteractor, TableAssertions } from '../src';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Table Assertions Example', () => {
  test('should validate table structure and data', async ({ page }) => {
    // Navigate to a page with a table
    await page.goto(`file://${join(__dirname, 'table.html')}`);
    
    // Create table interactor
    const tableLocator = page.locator('table');
    const tableInteractor = new TableInteractor(tableLocator);
    
    // Create table assertions
    const tableAssertions = new TableAssertions(tableInteractor);
    
    // Assert table structure
    await tableAssertions.assertTableStructure();
    
    // Assert expected headers
    await tableAssertions.assertHeaders(['Dish', 'Chef', 'Category', 'Actions']);
    
    // Assert column count
    await tableAssertions.assertColumnCount(4);
    
    // Assert row count
    await tableAssertions.assertRowCount(2);
    
    // Assert specific cell values
    await tableAssertions.assertCellValue(0, 'Dish', 'Margherita Pizza');
    await tableAssertions.assertCellValue(0, 'Chef', 'Chef Mario');
    await tableAssertions.assertCellValue(0, 'Category', 'Italian');
    
    // Assert row exists
    await tableAssertions.assertRowExists('Margherita Pizza');
    
    // Assert row doesn't exist
    await tableAssertions.assertRowDoesNotExist('Non-existent Dish');
    
    // Assert column exists
    await tableAssertions.assertColumnExists('Dish');
    
    // Assert cell matches regex
    await tableAssertions.assertCellMatchesRegex(0, 'Category', /^[A-Za-z]+$/);
  });
  
  test('should validate complete table data', async ({ page }) => {
    await page.goto(`file://${join(__dirname, 'table.html')}`);
    
    const tableLocator = page.locator('table');
    const tableInteractor = new TableInteractor(tableLocator);
    const tableAssertions = new TableAssertions(tableInteractor);
    
    // Define expected table data
    const expectedData = {
      headers: ['Dish', 'Chef', 'Category', 'Actions'],
      rows: [
        { Dish: 'Margherita Pizza', Chef: 'Chef Mario', Category: 'Italian', Actions: 'Edit' },
        { Dish: 'Sushi Roll', Chef: 'Chef Tanaka', Category: 'Japanese', Actions: 'Edit' }
      ]
    };
    
    // Assert complete table data
    await tableAssertions.assertTableData(expectedData);
  });
  
  test('should validate column values', async ({ page }) => {
    await page.goto(`file://${join(__dirname, 'table.html')}`);
    
    const tableLocator = page.locator('table');
    const tableInteractor = new TableInteractor(tableLocator);
    const tableAssertions = new TableAssertions(tableInteractor);
    
    // Assert specific column values
    await tableAssertions.assertColumnValues('Dish', ['Margherita Pizza', 'Sushi Roll']);
    await tableAssertions.assertColumnValues('Chef', ['Chef Mario', 'Chef Tanaka']);
  });
  
  test('should handle empty table assertions', async ({ page }) => {
    // Create a simple HTML with an empty table for testing
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <table id="emptyTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    const tableLocator = page.locator('table');
    const tableInteractor = new TableInteractor(tableLocator);
    const tableAssertions = new TableAssertions(tableInteractor);
    
    // Assert table is empty
    await tableAssertions.assertTableIsEmpty();
    
    // This would throw an error:
    // await tableAssertions.assertTableIsNotEmpty();
  });
}); 