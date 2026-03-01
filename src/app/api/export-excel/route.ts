import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { format, parseISO } from 'date-fns';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { data, dateFrom, dateTo } = body as {
            data: any[];
            dateFrom?: string;
            dateTo?: string;
        };

        const wb = new ExcelJS.Workbook();
        wb.creator = 'AD Equipamiento Automotriz';
        wb.created = new Date();

        const ws = wb.addWorksheet('Reporte de Ventas', {
            pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
        });

        // ── LOGO ──────────────────────────────────────────────────────
        const logoPath = path.join(process.cwd(), 'public', 'logo.webp');
        let logoId: number | null = null;
        if (fs.existsSync(logoPath)) {
            const logoBase64 = fs.readFileSync(logoPath).toString('base64');
            logoId = wb.addImage({ base64: logoBase64, extension: 'png' });
        }

        if (logoId !== null) {
            ws.addImage(logoId, {
                tl: { col: 0, row: 0 },
                ext: { width: 180, height: 72 },
                editAs: 'absolute',
            });
        }

        // ── COLUMN WIDTHS ──────────────────────────────────────────────
        ws.columns = [
            { key: 'num', width: 5 },
            { key: 'fecha', width: 18 },
            { key: 'tipo', width: 18 },
            { key: 'pos', width: 14 },
            { key: 'client', width: 24 },
            { key: 'rut', width: 14 },
            { key: 'dir', width: 32 },
            { key: 'pago', width: 16 },
            { key: 'monto', width: 16 },
        ];

        // Colour palette
        const ORANGE = 'FFFF6B00';
        const BLACK = 'FF1A1A1A';
        const DGRAY = 'FF374151';
        const MGRAY = 'FF9CA3AF';
        const LGRAY = 'FFF3F4F6';
        const WHITE = 'FFFFFFFF';
        const GREEN = 'FF059669';
        const BLUE = 'FF2563EB';
        const PURPLE = 'FF7C3AED';

        // ── SPACER ROWS for logo (rows 1-4) ───────────────────────────
        for (let i = 0; i < 4; i++) ws.addRow([]);

        // ── COMPANY HEADER ─────────────────────────────────────────────
        const titleRow = ws.addRow(['AD EQUIPAMIENTO AUTOMOTRIZ']);
        ws.mergeCells(`A5:I5`);
        titleRow.getCell(1).font = { name: 'Calibri', bold: true, size: 18, color: { argb: BLACK } };
        titleRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
        titleRow.height = 28;

        const subRow = ws.addRow(['Sistema de Gestión de Ventas — Reporte Exportado']);
        ws.mergeCells(`A6:I6`);
        subRow.getCell(1).font = { name: 'Calibri', size: 11, italic: true, color: { argb: DGRAY } };
        subRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

        const reportDate = format(new Date(), "dd/MM/yyyy 'a las' HH:mm");
        const dateRange = dateFrom || dateTo
            ? `${dateFrom ? format(parseISO(dateFrom), 'dd/MM/yyyy') : 'Inicio'} — ${dateTo ? format(parseISO(dateTo), 'dd/MM/yyyy') : 'Hoy'}`
            : 'Todo el historial';

        const metaRow = ws.addRow([`Período: ${dateRange}    ·    Generado: ${reportDate}    ·    Registros: ${data.length}`]);
        ws.mergeCells(`A7:I7`);
        metaRow.getCell(1).font = { name: 'Calibri', size: 9, color: { argb: MGRAY } };
        metaRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

        // Orange accent line
        const accentRow = ws.addRow([]);
        ws.mergeCells(`A8:I8`);
        accentRow.height = 4;
        for (let c = 1; c <= 9; c++) {
            accentRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ORANGE } };
        }

        ws.addRow([]); // spacer

        // ── COLUMN HEADERS ─────────────────────────────────────────────
        const headers = ['#', 'Fecha', 'Tipo de Vidrio', 'Posición', 'Cliente', 'RUT', 'Dirección', 'Método de Pago', 'Monto (CLP)'];
        const headerRow = ws.addRow(headers);
        headerRow.height = 22;
        headerRow.eachCell((cell) => {
            cell.font = { name: 'Calibri', bold: true, size: 9, color: { argb: WHITE } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLACK } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                bottom: { style: 'thin', color: { argb: ORANGE } },
            };
        });

        // ── DATA ROWS ──────────────────────────────────────────────────
        data.forEach((inst, idx) => {
            const row = ws.addRow([
                idx + 1,
                format(new Date(inst.fecha), 'dd/MM/yyyy HH:mm'),
                inst.tipo_vidrio || '',
                inst.posicion || '',
                inst.cliente_nombre || 'Particular',
                inst.cliente_rut || 'N/A',
                inst.cliente_direccion || 'N/A',
                inst.metodo_pago || '',
                Number(inst.monto) || 0,
            ]);

            const isEven = idx % 2 === 0;
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                cell.font = { name: 'Calibri', size: 9, color: { argb: colNumber === 9 ? BLACK : DGRAY } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? WHITE : LGRAY } };
                cell.alignment = {
                    horizontal: colNumber === 9 ? 'right' : colNumber === 1 ? 'center' : 'left',
                    vertical: 'middle',
                };
                cell.border = {
                    bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
                };
            });

            // Bold monto
            const montoCell = row.getCell(9);
            montoCell.font = { name: 'Calibri', bold: true, size: 10, color: { argb: BLACK } };
            montoCell.numFmt = '"$"#,##0';

            row.height = 18;
        });

        // ── TOTALS SECTION ─────────────────────────────────────────────
        ws.addRow([]); // spacer

        const totalAmount = data.reduce((s, i) => s + (Number(i.monto) || 0), 0);
        const efectivo = data.filter(i => i.metodo_pago === 'Efectivo').reduce((s, i) => s + Number(i.monto), 0);
        const tarjeta = data.filter(i => i.metodo_pago === 'Tarjeta').reduce((s, i) => s + Number(i.monto), 0);
        const transferencia = data.filter(i => i.metodo_pago === 'Transferencia').reduce((s, i) => s + Number(i.monto), 0);

        const addSummaryRow = (label: string, value: number, argbColor: string, bold = false) => {
            const r = ws.addRow(['', '', '', '', '', '', '', label, value]);
            r.height = bold ? 22 : 18;
            r.getCell(8).font = { name: 'Calibri', bold, size: bold ? 10 : 9, color: { argb: DGRAY } };
            r.getCell(8).alignment = { horizontal: 'right', vertical: 'middle' };
            r.getCell(9).font = { name: 'Calibri', bold, size: bold ? 11 : 9, color: { argb: bold ? ORANGE : BLACK } };
            r.getCell(9).numFmt = '"$"#,##0';
            r.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
            if (bold) {
                r.getCell(8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLACK } };
                r.getCell(9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLACK } };
                r.getCell(8).font = { ...r.getCell(8).font, color: { argb: WHITE } };
            }
        };

        addSummaryRow('Efectivo', efectivo, GREEN);
        addSummaryRow('Tarjeta', tarjeta, BLUE);
        addSummaryRow('Transferencia', transferencia, PURPLE);
        addSummaryRow('TOTAL GENERAL', totalAmount, ORANGE, true);

        // ── FOOTER ─────────────────────────────────────────────────────
        ws.addRow([]);
        const footerRow = ws.addRow([`AD Equipamiento Automotriz • Reporte generado automáticamente el ${reportDate}`]);
        ws.mergeCells(`A${footerRow.number}:I${footerRow.number}`);
        footerRow.getCell(1).font = { name: 'Calibri', size: 8, italic: true, color: { argb: MGRAY } };
        footerRow.getCell(1).alignment = { horizontal: 'center' };

        // ── WRITE TO BUFFER AND RETURN ─────────────────────────────────
        const buffer = await wb.xlsx.writeBuffer();
        const fileName = `AD_Reporte_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });
    } catch (err: any) {
        console.error('Export error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
