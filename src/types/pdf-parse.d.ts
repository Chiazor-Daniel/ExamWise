declare module 'pdf-parse' {
    interface PDFData {
        text: string;
        numpages: number;
        numrender: number;
        info: {
            PDFFormatVersion?: string;
            IsAcroFormPresent?: boolean;
            IsXFAPresent?: boolean;
            [key: string]: any;
        };
        metadata: {
            [key: string]: any;
        };
        version: string;
    }

    interface PDFOptions {
        pagerender?: ((pageData: any) => string) | null;
        max?: number;
        version?: string;
    }

    function pdf(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;
    export = pdf;
}

declare module 'pdf-parse/lib/pdf-parse.js' {
    export { pdf as default } from 'pdf-parse';
}
