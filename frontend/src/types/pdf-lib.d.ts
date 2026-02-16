declare module 'pdf-lib' {
  interface PdfDocumentInstance {
    getPages(): Array<{
      getSize(): { width: number; height: number };
      drawText(text: string, options: { x: number; y: number; size: number; font: unknown; color: unknown }): void;
    }>;
    embedFont(font: string): Promise<{ widthOfTextAtSize(text: string, size: number): number }>;
    save(): Promise<Uint8Array>;
  }

  export namespace PDFDocument {
    function load(pdfBytes: ArrayBuffer | Uint8Array): Promise<PdfDocumentInstance>;
  }
  export const StandardFonts: {
    Helvetica: string;
    HelveticaBold: string;
  };
  export function rgb(red: number, green: number, blue: number): unknown;
}
