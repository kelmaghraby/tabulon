import { Locator } from '@playwright/test';
import { TableData } from './types';
export declare class TableInteractor {
    private tableLocator;
    private headers;
    private headerLocators;
    private headerToIndexMap;
    private tableVisible;
    constructor(tableLocator: Locator);
    private ensureTableVisible;
    getHeaders(): Promise<string[]>;
    private initializeHeaders;
    findRowByText(searchText: string | RegExp): Promise<Locator>;
    getCellByHeader(rowLocator: Locator, headerText: string): Promise<Locator>;
    getCellByIndex(rowLocator: Locator, index: number): Promise<Locator>;
    extractTableData(): Promise<TableData>;
    getRowCount(): Promise<number>;
    clickCellAction(rowIndex: number, headerText: string, actionSelector: string): Promise<void>;
}
//# sourceMappingURL=tableInteractor.d.ts.map