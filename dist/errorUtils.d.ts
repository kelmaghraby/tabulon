export declare function createColoredError(message: string, context?: string, suggestion?: string): string;
export declare function createColoredWarning(message: string, context?: string): string;
export declare function createColoredSuccess(message: string): string;
export declare function createColoredInfo(message: string): string;
export declare function createTableError(errorType: 'structure' | 'headers' | 'rows' | 'columns' | 'cell' | 'data', details: string, expected?: string | number, actual?: string | number): string;
export declare function supportsColors(): boolean;
export declare function createSmartError(message: string, context?: string, suggestion?: string): string;
//# sourceMappingURL=errorUtils.d.ts.map