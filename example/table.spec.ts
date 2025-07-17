import { test, expect } from '@playwright/test';
import { TableInteractor } from '../src/tableInteractor';

test.describe('Tabulon TableInteractor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${__dirname}/table.html`);
  });

  test('should initialize headers correctly', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    await table.initializeHeaders();
    expect(table['headers']).toEqual(['Name', 'Email', 'Status', 'Actions']);
  });

  test('should find row by exact match string', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    await table.initializeHeaders();
    const row = await table.findRowByText('Bob Smith');
    expect(row).not.toBeNull();
  });

  test('should find row by RegExp match', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    await table.initializeHeaders();
    const row = await table.findRowByText(/Alice/);
    expect(row).not.toBeNull();
  });

  test('should get cell by header', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    await table.initializeHeaders();
    const row = await table.findRowByText('Alice Johnson');
    expect(row).not.toBeNull();

    if (row) {
      const emailCell = await table.getCellByHeader(row, 'Email');
      const emailText = await emailCell?.textContent();
      expect(emailText?.trim()).toBe('alice@example.com');
    }
  });

  test('should get cell by index', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    await table.initializeHeaders();
    const row = await table.findRowByText('Bob Smith');
    expect(row).not.toBeNull();

    if (row) {
      const statusCell = table.getCellByIndex(row, 2);
      const statusText = await statusCell.textContent();
      expect(statusText?.trim()).toBe('Inactive');
    }
  });

  test('should extract structured table data', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    const data = await table.extractTableData();

    expect(data.headers).toEqual(['Name', 'Email', 'Status', 'Actions']);
    expect(data.rows).toHaveLength(2);
    expect(data.rows).toContainEqual({
      Name: 'Alice Johnson',
      Email: 'alice@example.com',
      Status: 'Active',
      Actions: 'Edit',
    });
  });

  test('should throw error for unknown header', async ({ page }) => {
    const table = new TableInteractor(page.locator('#usersTable'));
    await table.initializeHeaders();
    const row = await table.findRowByText('Alice Johnson');
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
    expect(data.headers).toContain('Status');
    expect(data.rows[0].Status).toBe('Active');
  });
});
