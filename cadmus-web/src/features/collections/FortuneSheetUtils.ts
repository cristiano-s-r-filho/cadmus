/**
 * Utilitários para conversão de formatos do FortuneSheet
 * Transforma a matriz densa 'data' em formato esparso 'celldata'
 */

export const FortuneSheetUtils = {
    /**
     * Comprime o workbook para salvamento
     */
    compressWorkbook: (sheets: any[]) => {
        return sheets.map(sheet => {
            const compressedSheet = { ...sheet };
            
            // Se houver a matriz densa 'data', convertemos para 'celldata' e limpamos 'data'
            if (sheet.data && Array.isArray(sheet.data)) {
                const celldata: any[] = [];
                
                sheet.data.forEach((row: any[], r: number) => {
                    if (!row) return;
                    row.forEach((cell: any, c: number) => {
                        // Apenas salvamos se a célula tiver valor ou formatação
                        if (cell && (cell.v !== undefined || cell.f !== undefined || cell.bg || cell.fc)) {
                            celldata.push({ r, c, v: cell });
                        }
                    });
                });
                
                compressedSheet.celldata = celldata;
                delete compressedSheet.data; // Removemos o peso morto
            }
            
            return compressedSheet;
        });
    },

    /**
     * Prepara o workbook vindo do banco para o editor
     */
    decompressWorkbook: (sheets: any[]) => {
        return sheets.map((sheet, index) => {
            const newSheet = { ...sheet };
            
            // Legacy Recovery: Se houver 'data' (matriz densa) e não houver 'celldata' (esparso), convertemos
            if (sheet.data && Array.isArray(sheet.data) && (!sheet.celldata || sheet.celldata.length === 0)) {
                console.warn(`[SheetUtils] Recovering legacy dense data for sheet: ${sheet.name}`);
                const celldata: any[] = [];
                sheet.data.forEach((row: any[], r: number) => {
                    if (!row) return;
                    row.forEach((cell: any, c: number) => {
                        if (cell && (cell.v !== undefined || cell.f !== undefined || cell.bg || cell.fc)) {
                            celldata.push({ r, c, v: cell });
                        }
                    });
                });
                newSheet.celldata = celldata;
                delete newSheet.data;
            }

            return {
                ...newSheet,
                order: newSheet.order ?? index,
                status: index === 0 ? 1 : 0, // Garante uma aba ativa
                celldata: newSheet.celldata || []
            };
        });
    },

    /**
     * Log de auditoria para debug
     */
    auditWorkbook: (sheets: any[]) => {
        let totalCells = 0;
        sheets.forEach(s => {
            if (s.celldata) totalCells += s.celldata.length;
            else if (s.data) {
                s.data.forEach((r: any) => {
                    if (r) r.forEach((c: any) => { if (c) totalCells++; });
                });
            }
        });
        return totalCells;
    }
};
