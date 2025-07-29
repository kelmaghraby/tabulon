import { TableInteractor } from './tableInteractor';
import { TableData } from './types';
export declare class TableAssertions {
    private tableInteractor;
    constructor(tableInteractor: TableInteractor);
    assertRowCount(expectedCount: number, message?: string): Promise<void>;
    assertColumnCount(expectedCount: number, message?: string): Promise<void>;
    assertCellValue(rowIndex: number, headerText: string, expectedValue: string, message?: string): Promise<void>;
    assertRowExists(searchText: string | RegExp, message?: string): Promise<void>;
    assertRowDoesNotExist(searchText: string | RegExp, message?: string): Promise<void>;
    assertColumnExists(headerText: string, message?: string): Promise<void>;
    assertHeaders(expectedHeaders: string[], message?: string): Promise<void>;
    assertTableData(expectedData: TableData, message?: string): Promise<void>;
    assertTableIsEmpty(message?: string): Promise<void>;
    assertTableIsNotEmpty(message?: string): Promise<void>;
    assertColumnValues(headerText: string, expectedValues: string[], message?: string): Promise<void>;
    assertCellMatchesRegex(rowIndex: number, headerText: string, regex: RegExp, message?: string): Promise<void>;
    assertTableStructure(message?: string): Promise<void>;
}
//# sourceMappingURL=tableAssertions.d.ts.map