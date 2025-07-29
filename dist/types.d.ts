import { Locator } from '@playwright/test';
export interface TableCell {
    text: string;
    locator: Locator;
    columnIndex: number;
    columnHeader?: string;
}
export interface TableRow {
    locator: Locator;
    cells: TableCell[];
}
export interface TableData {
    headers: string[];
    rows: {
        [key: string]: string;
    }[];
}
//# sourceMappingURL=types.d.ts.map