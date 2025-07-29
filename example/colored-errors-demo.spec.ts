import { test, expect } from '@playwright/test';
import { TableInteractor, TableAssertions, createColoredError, createColoredWarning, createColoredSuccess, createColoredInfo } from '../src';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Colored Error Messages Demo', () => {
  test('should demonstrate colored error messages', async ({ page }) => {
    // Navigate to a page with a table
    await page.goto(`file://${join(__dirname, 'table.html')}`);
    
    // Create table interactor
    const tableLocator = page.locator('table');
    const tableInteractor = new TableInteractor(tableLocator);
    const tableAssertions = new TableAssertions(tableInteractor);
    
    // Demonstrate different colored message types
    console.log(createColoredInfo('Starting table validation...'));
    console.log(createColoredSuccess('Table loaded successfully!'));
    console.log(createColoredWarning('This is a warning message', 'Demo context'));
    
    // This will trigger a colored error message
    try {
      await tableAssertions.assertHeaders(['Wrong', 'Headers', 'Here']);
    } catch (error) {
      console.log('\n' + (error as Error).message);
    }
    
    // Demonstrate another colored error
    try {
      await tableAssertions.assertRowCount(999);
    } catch (error) {
      console.log('\n' + (error as Error).message);
    }
    
    // Demonstrate cell value error
    try {
      await tableAssertions.assertCellValue(0, 'Dish', 'Wrong Value');
    } catch (error) {
      console.log('\n' + (error as Error).message);
    }
    
    // Demonstrate column count error
    try {
      await tableAssertions.assertColumnCount(2);
    } catch (error) {
      console.log('\n' + (error as Error).message);
    }
    
    // Demonstrate custom colored error
    console.log('\n' + createColoredError(
      'This is a custom error message',
      'Custom error context',
      'This is a suggestion for fixing the issue'
    ));
  });
  
  test('should show table structure errors', async ({ page }) => {
    // Create a malformed table to trigger structure errors
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <table id="malformedTable">
            <thead>
              <tr>
                <th>Header1</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Data1</td>
                <td>Data2</td>
                <td>Data3</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    const tableLocator = page.locator('table');
    const tableInteractor = new TableInteractor(tableLocator);
    const tableAssertions = new TableAssertions(tableInteractor);
    
    // This will trigger a structure error due to empty headers
    try {
      await tableAssertions.assertTableStructure();
    } catch (error) {
      console.log('\n' + (error as Error).message);
    }
  });
  
  test('should show row not found errors', async ({ page }) => {
    await page.goto(`file://${join(__dirname, 'table.html')}`);
    
    const tableLocator = page.locator('table');
    const tableInteractor = new TableInteractor(tableLocator);
    const tableAssertions = new TableAssertions(tableInteractor);
    
    // This will trigger a row not found error
    try {
      await tableAssertions.assertRowExists('Non-existent Row Data');
    } catch (error) {
      console.log('\n' + (error as Error).message);
    }
  });
}); 