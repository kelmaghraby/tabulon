# Tabulon

[![npm version](https://img.shields.io/npm/v/tabulon)](https://www.npmjs.com/package/tabulon)
[![npm bundle size](https://img.shields.io/bundlephobia/min/tabulon)](https://bundlephobia.com/package/tabulon)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ⚡ A lightweight utility for interacting with HTML tables in [Playwright](https://playwright.dev) using logical selectors instead of brittle CSS chains.

---

## ✨ Why Tabulon?

HTML tables can be a pain to automate:

- Rows move around
- Column orders change  
- Selectors like `tbody > tr:nth-child(3) > td:nth-child(5)` are fragile

**Tabulon** solves this by treating tables like structured data:

- Access cells by **column headers** or **row content**
- Extract the entire table as structured **JSON**
- Click buttons or fill fields inside any **row/cell**
- Write clean, readable Playwright tests
- **🎨 Beautiful colored error messages** for better debugging

---

## 📦 Installation

```bash
npm install tabulon
# or
pnpm add tabulon
# or
yarn add tabulon
```

---

## 🚀 Quick Start

```typescript
import { test, expect } from '@playwright/test';
import { TableInteractor } from 'tabulon';

test('interact with table data', async ({ page }) => {
  await page.goto('https://example.com/table-page');
  
  // Create table interactor
  const table = new TableInteractor(page.locator('table'));
  
  // Get all headers
  const headers = await table.getHeaders();
  console.log(headers); // ['Name', 'Email', 'Role', 'Actions']
  
  // Find a row by content
  const userRow = await table.findRowByText('john@example.com');
  
  // Get cell by header name
  const nameCell = await table.getCellByHeader(userRow, 'Name');
  const name = await nameCell.textContent();
  expect(name).toBe('John Doe');
  
  // Click a button in the Actions column
  const actionButton = await table.getCellByHeader(userRow, 'Actions');
  await actionButton.click();
});
```

---

## 🎨 Colored Error Messages

Tabulon provides beautiful, colored error messages that make debugging much easier. Error messages include:

- **❌ Error details** in red
- **📋 Context information** in blue  
- **💡 Helpful suggestions** in yellow
- **⚠️ Warnings** in yellow
- **✅ Success messages** in green
- **ℹ️ Info messages** in cyan

### Example Error Messages

```typescript
import { TableAssertions, createColoredError } from 'tabulon';

// Automatic colored errors in assertions
try {
  await tableAssertions.assertHeaders(['Name', 'Email']);
} catch (error) {
  console.log(error.message);
  // Output:
  // ❌ ERROR: Expected 2 headers but found 4. Expected: [Name, Email], Actual: [Dish, Chef, Category, Actions]
  // 📋 Context: Table headers validation failed
  // 💡 Suggestion: Expected 2 headers but found 4. Check your table header structure.
}

// Custom colored messages
console.log(createColoredError(
  'Custom error message',
  'Error context',
  'Helpful suggestion'
));
```

### Available Error Utilities

```typescript
import { 
  createColoredError,
  createColoredWarning, 
  createColoredSuccess,
  createColoredInfo,
  createTableError,
  createSmartError
} from 'tabulon';

// Different message types
createColoredError(message, context?, suggestion?);
createColoredWarning(message, context?);
createColoredSuccess(message);
createColoredInfo(message);

// Table-specific errors
createTableError('headers' | 'rows' | 'columns' | 'cell' | 'data' | 'structure', details, expected?, actual?);

// Smart error that falls back to plain text in CI environments
createSmartError(message, context?, suggestion?);
```

---

## 📋 API Reference

### `TableInteractor`

The main class for interacting with HTML tables.

#### Constructor

```typescript
new TableInteractor(tableLocator: Locator)
```

- `tableLocator`: Playwright locator for the table element

#### Methods

##### `getHeaders(): Promise<string[]>`

Get all column headers from the table.

```typescript
const headers = await table.getHeaders();
// Returns: ['Name', 'Email', 'Role', 'Actions']
```

##### `findRowByText(searchText: string | RegExp): Promise<Locator>`

Find a table row by matching text content.

```typescript
// Find by exact string
const row = await table.findRowByText('john@example.com');

// Find by regex
const row = await table.findRowByText(/john.*@example\.com/);
```

##### `getCellByHeader(rowLocator: Locator, headerText: string): Promise<Locator>`

Get a cell in a specific row by column header name.

```typescript
const userRow = await table.findRowByText('john@example.com');
const emailCell = await table.getCellByHeader(userRow, 'Email');
const email = await emailCell.textContent();
```

##### `getCellByIndex(rowLocator: Locator, index: number): Promise<Locator>`

Get a cell in a specific row by column index (0-based).

```typescript
const userRow = await table.findRowByText('john@example.com');
const nameCell = await table.getCellByIndex(userRow, 0); // First column
const name = await nameCell.textContent();
```

##### `extractTableData(): Promise<TableData>`

Extract the entire table as structured data.

```typescript
const data = await table.extractTableData();
console.log(data);
// Returns:
// {
//   headers: ['Name', 'Email', 'Role'],
//   rows: [
//     { Name: 'John Doe', Email: 'john@example.com', Role: 'Admin' },
//     { Name: 'Jane Smith', Email: 'jane@example.com', Role: 'User' }
//   ]
// }
```

##### `getRowCount(): Promise<number>`

Get the total number of data rows in the table.

```typescript
const count = await table.getRowCount();
console.log(`Table has ${count} rows`);
```

##### `clickCellAction(rowIndex: number, headerText: string, selector: string): Promise<void>`

Click an element within a specific cell.

```typescript
// Click the "Edit" button in the Actions column for the first row
await table.clickCellAction(0, 'Actions', 'button');
```

---

## 📖 Examples

### Example 1: User Management Table

```html
<table id="usersTable">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Role</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td>Admin</td>
      <td><button class="edit-btn">Edit</button></td>
    </tr>
    <tr>
      <td>Jane Smith</td>
      <td>jane@example.com</td>
      <td>User</td>
      <td><button class="edit-btn">Edit</button></td>
    </tr>
  </tbody>
</table>
```

```typescript
import { test, expect } from '@playwright/test';
import { TableInteractor } from 'tabulon';

test('user management table', async ({ page }) => {
  await page.goto('/users');
  
  const table = new TableInteractor(page.locator('#usersTable'));
  
  // Verify headers
  const headers = await table.getHeaders();
  expect(headers).toEqual(['Name', 'Email', 'Role', 'Actions']);
  
  // Find and interact with a specific user
  const johnRow = await table.findRowByText('john@example.com');
  expect(johnRow).toBeTruthy();
  
  // Get user details
  const nameCell = await table.getCellByHeader(johnRow, 'Name');
  const roleCell = await table.getCellByHeader(johnRow, 'Role');
  
  expect(await nameCell.textContent()).toBe('John Doe');
  expect(await roleCell.textContent()).toBe('Admin');
  
  // Click edit button
  const editButton = await table.getCellByHeader(johnRow, 'Actions');
  await editButton.click();
  
  // Verify edit form appears
  await expect(page.locator('#editForm')).toBeVisible();
});
```

### Example 2: Data Extraction

```typescript
test('extract table data', async ({ page }) => {
  await page.goto('/products');
  
  const table = new TableInteractor(page.locator('#productsTable'));
  
  // Extract all data
  const data = await table.extractTableData();
  
  // Verify structure
  expect(data.headers).toEqual(['Product', 'Price', 'Stock', 'Category']);
  expect(data.rows).toHaveLength(3);
  
  // Check specific data
  const firstProduct = data.rows[0];
  expect(firstProduct.Product).toBe('Laptop');
  expect(firstProduct.Price).toBe('$999');
  expect(firstProduct.Stock).toBe('15');
  
  // Process all rows
  const expensiveProducts = data.rows.filter(row => 
    parseFloat(row.Price.replace('$', '')) > 500
  );
  expect(expensiveProducts).toHaveLength(2);
});
```

### Example 3: Dynamic Content

```typescript
test('handle dynamic table content', async ({ page }) => {
  await page.goto('/dashboard');
  
  const table = new TableInteractor(page.locator('#metricsTable'));
  
  // Wait for table to load
  await table.getHeaders();
  
  // Find row by partial match
  const revenueRow = await table.findRowByText(/Revenue/);
  
  // Get current value
  const valueCell = await table.getCellByHeader(revenueRow, 'Value');
  const currentValue = await valueCell.textContent();
  
  // Trigger refresh
  await page.click('#refresh-btn');
  
  // Wait for update and check new value
  await page.waitForTimeout(1000);
  const newValue = await valueCell.textContent();
  expect(newValue).not.toBe(currentValue);
});
```

---

## 🔧 Advanced Usage

### Working with Complex Tables

Tabulon handles various table structures:

- **Empty columns**: Automatically skips empty header cells
- **Nested content**: Extracts text from complex cell content
- **Mixed content**: Handles tables with buttons, forms, and text
- **Dynamic headers**: Re-reads headers when needed

### Error Handling

```typescript
test('handle table errors gracefully', async ({ page }) => {
  const table = new TableInteractor(page.locator('#dynamicTable'));
  
  try {
    const headers = await table.getHeaders();
    console.log('Headers found:', headers);
  } catch (error) {
    console.log('Table not ready yet:', error.message);
    // Wait and retry
    await page.waitForTimeout(1000);
    const headers = await table.getHeaders();
  }
});
```

### Custom Selectors

```typescript
// Use with any table selector
const table = new TableInteractor(page.locator('.data-table'));
const table = new TableInteractor(page.locator('[data-testid="users-table"]'));
const table = new TableInteractor(page.locator('table:has-text("Users")'));
```

---

## 🧪 Testing Best Practices

1. **Use descriptive test names** that explain what you're testing
2. **Extract table data** for assertions instead of checking individual cells
3. **Wait for table content** to load before interacting
4. **Use header names** instead of column indices for better maintainability
5. **Handle dynamic content** with appropriate waits

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with ❤️ for the Playwright community. Special thanks to the Playwright team for creating such an amazing testing framework.
