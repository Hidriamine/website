// src/types/pdfmake.d.ts
declare module 'pdfmake/build/vfs_fonts' {
  export const vfs: Record<string, string>;
  export const pdfMake: {
    vfs: Record<string, string>;
  };
}