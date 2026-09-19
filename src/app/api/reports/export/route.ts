import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import ExcelJS from 'exceljs';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get('type') || 'strategic'; 
    const range = searchParams.get('range') || '12m';
    const chapterId = searchParams.get('chapterId') || '';
    const category = searchParams.get('category') || '';
    const regionId = searchParams.get('regionId') || '';

    // Determine current user scoping parameters
    const role = session.user.role;
    const contextId = role === 'REGIONAL_ADMIN' ? session.user.regionId : (role === 'LOCAL_ADMIN' ? session.user.chapterId : null);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CASA UENR System';
    workbook.created = new Date();

    if (exportType === 'strategic') {
      // ==================== 1. STRATEGIC SUMMARY REPORT ====================
      const worksheet = workbook.addWorksheet('Overview Summary');
      worksheet.views = [{ showGridLines: true }];

      // Fetch statistics matching reports range
      const rangeDate = new Date();
      if (range === '6m') rangeDate.setMonth(rangeDate.getMonth() - 6);
      else if (range === '12m') rangeDate.setMonth(rangeDate.getMonth() - 12);
      else rangeDate.setFullYear(rangeDate.getFullYear() - 15); // all historical

      const transactions = await db.transaction.findMany({
        where: {
          AND: [
            { type: 'INCOME' },
            { date: { gte: rangeDate } },
            role === 'LOCAL_ADMIN' ? { chapterId: contextId || 'none' } : {},
            role === 'REGIONAL_ADMIN' ? { chapter: { regionId: contextId || 'none' } } : {},
          ]
        },
        include: { chapter: true, student: true },
        orderBy: { date: 'desc' }
      });

      const membersCount = await db.student.count({
        where: {
          AND: [
            role === 'LOCAL_ADMIN' ? { chapterId: contextId || 'none' } : {},
            role === 'REGIONAL_ADMIN' ? { chapter: { regionId: contextId || 'none' } } : {},
          ]
        }
      });

      const institutionsCount = await db.chapter.count({
        where: {
          AND: [
            role === 'LOCAL_ADMIN' ? { id: contextId || 'none' } : {},
            role === 'REGIONAL_ADMIN' ? { regionId: contextId || 'none' } : {},
          ]
        }
      });

      // Title styling
      worksheet.mergeCells('A1:C1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = '   CASA UENR STRATEGIC REPORT SUMMARY';
      titleCell.font = { name: 'Segoe UI', size: 15, bold: true, color: { argb: 'FF1E67FC' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF2FF' } };
      titleCell.alignment = { vertical: 'middle' };
      worksheet.getRow(1).height = 42;

      // Metadata block
      worksheet.getCell('A3').value = 'Generation Date:';
      worksheet.getCell('B3').value = new Date().toLocaleDateString(undefined, { dateStyle: 'medium' });
      worksheet.getCell('A4').value = 'Report Range:';
      worksheet.getCell('B4').value = range === '12m' ? 'Last 12 Months' : range === '6m' ? 'Last 6 Months' : 'All Historical';
      
      worksheet.getCell('A3').font = { name: 'Segoe UI', bold: true, size: 10 };
      worksheet.getCell('B3').font = { name: 'Segoe UI', size: 10 };
      worksheet.getCell('A4').font = { name: 'Segoe UI', bold: true, size: 10 };
      worksheet.getCell('B4').font = { name: 'Segoe UI', size: 10 };

      // KPI Header
      worksheet.mergeCells('A6:C6');
      const secHeader = worksheet.getCell('A6');
      secHeader.value = '   Key Performance Indicators (KPIs)';
      secHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      secHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      secHeader.alignment = { vertical: 'middle' };
      worksheet.getRow(6).height = 30;

      worksheet.getCell('A7').value = 'Total Received Finance';
      const totalRev = transactions.reduce((a: number, b: { amount: number }) => a + b.amount, 0);
      worksheet.getCell('B7').value = totalRev;
      worksheet.getCell('B7').numFmt = 'GH₵ #,##0.00';

      worksheet.getCell('A8').value = 'Total Chapters';
      worksheet.getCell('B8').value = institutionsCount;

      worksheet.getCell('A9').value = 'Active Strategic Members';
      worksheet.getCell('B9').value = membersCount;

      [7, 8, 9].forEach((r: number) => {
        worksheet.getCell(`A${r}`).font = { name: 'Segoe UI', bold: true, size: 10 };
        worksheet.getCell(`B${r}`).font = { name: 'Segoe UI', color: { argb: 'FF1E67FC' }, bold: true, size: 10 };
        worksheet.getCell(`A${r}`).border = { bottom: { style: 'thin', color: { argb: 'FFF1F5F9' } } };
        worksheet.getCell(`B${r}`).border = { bottom: { style: 'thin', color: { argb: 'FFF1F5F9' } } };
        worksheet.getRow(r).height = 24;
      });

      // Detailed Registry Worksheet
      const detailsSheet = workbook.addWorksheet('Transaction Register');
      detailsSheet.views = [{ showGridLines: true }];

      // Header row
      detailsSheet.mergeCells('A1:G1');
      const mTitleCell = detailsSheet.getCell('A1');
      mTitleCell.value = '   DETAILED FINANCIAL REGISTRATION LEDGER';
      mTitleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      mTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      mTitleCell.alignment = { vertical: 'middle' };
      detailsSheet.getRow(1).height = 40;

      const headers = ['Transaction ID', 'Date', 'Type', 'Category', 'Chapter', 'Contributor', 'Amount'];
      detailsSheet.getRow(3).values = headers;
      detailsSheet.getRow(3).height = 28;
      
      headers.forEach((h: string, index: number) => {
        const colLetter = String.fromCharCode(65 + index);
        const cell = detailsSheet.getCell(`${colLetter}3`);
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E67FC' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Fill detail rows
      transactions.forEach((tx: { id: string; date: Date; type: string; category: string; chapter?: { name: string }; student?: { name: string }; amount: number }, idx: number) => {
        const rowNumber = idx + 4;
        const row = detailsSheet.getRow(rowNumber);
        row.values = [
          tx.id,
          new Date(tx.date).toLocaleDateString(undefined, { dateStyle: 'medium' }),
          tx.type,
          tx.category.replace(/_/g, ' '),
          tx.chapter?.name || 'Unknown',
          tx.student?.name || 'Chapter Contribution',
          tx.amount
        ];
        row.height = 20;

        detailsSheet.getCell(`A${rowNumber}`).alignment = { horizontal: 'center' };
        detailsSheet.getCell(`B${rowNumber}`).alignment = { horizontal: 'center' };
        detailsSheet.getCell(`C${rowNumber}`).alignment = { horizontal: 'center' };
        detailsSheet.getCell(`D${rowNumber}`).alignment = { horizontal: 'left' };
        detailsSheet.getCell(`E${rowNumber}`).alignment = { horizontal: 'left' };
        detailsSheet.getCell(`F${rowNumber}`).alignment = { horizontal: 'left' };
        
        const amtCell = detailsSheet.getCell(`G${rowNumber}`);
        amtCell.numFmt = 'GH₵ #,##0.00';
        amtCell.alignment = { horizontal: 'right' };
        amtCell.font = { name: 'Segoe UI', bold: true };

        // Zebra stripes
        if (rowNumber % 2 === 0) {
          ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((col: string) => {
            detailsSheet.getCell(`${col}${rowNumber}`).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FAFC' }
            };
          });
        }

        ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((col: string) => {
          detailsSheet.getCell(`${col}${rowNumber}`).border = {
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };
        });
      });

      detailsSheet.columns = [
        { width: 18 }, // ID
        { width: 16 }, // Date
        { width: 12 }, // Type
        { width: 18 }, // Category
        { width: 26 }, // Chapter
        { width: 26 }, // Contributor
        { width: 18 }  // Amount
      ];

      worksheet.columns = [
        { width: 32 },
        { width: 22 },
        { width: 22 }
      ];

    } else {
      // ==================== 2. DETAILED FINANCIAL COLLECTIONS LEDGER ====================
      const worksheet = workbook.addWorksheet('Collections Ledger');
      worksheet.views = [{ showGridLines: true }];

      // Fetch dynamic subset based on user choices and role permissions
      const collections = await db.transaction.findMany({
        where: {
          AND: [
            chapterId ? { chapterId } : {},
            category ? { category } : {},
            regionId ? { chapter: { regionId } } : {},
            role === 'LOCAL_ADMIN' ? { chapterId: contextId || 'none' } : {},
            role === 'REGIONAL_ADMIN' ? { chapter: { regionId: contextId || 'none' } } : {},
          ]
        },
        include: { chapter: true, student: true },
        orderBy: { date: 'desc' }
      });

      // Page Title Row
      worksheet.mergeCells('A1:I1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = '   CASA UENR DETAILED FINANCIAL COLLECTIONS LEDGER';
      titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E67FC' } };
      titleCell.alignment = { vertical: 'middle' };
      worksheet.getRow(1).height = 42;

      // Filter summary rows
      worksheet.getCell('A3').value = 'Filter Scope:';
      worksheet.getCell('B3').value = chapterId 
        ? 'Specific Chapter' 
        : (role === 'REGIONAL_ADMIN' ? 'Regional Scope' : (role === 'LOCAL_ADMIN' ? 'Local Chapter Scope' : 'All Chapters / National Network'));
      worksheet.getCell('A4').value = 'Filter Category:';
      worksheet.getCell('B4').value = category || 'All Financial Categories';
      
      worksheet.getCell('A3').font = { name: 'Segoe UI', bold: true, size: 10 };
      worksheet.getCell('B3').font = { name: 'Segoe UI', size: 10 };
      worksheet.getCell('A4').font = { name: 'Segoe UI', bold: true, size: 10 };
      worksheet.getCell('B4').font = { name: 'Segoe UI', size: 10 };

      // Table Headers
      const colHeaders = [
        'Transaction ID', 'Date', 'Chapter', 'Type', 'Category', 
        'Member Name', 'Student ID', 'Amount', 'Description'
      ];
      worksheet.getRow(6).values = colHeaders;
      worksheet.getRow(6).height = 28;

      colHeaders.forEach((h: string, index: number) => {
        const colLetter = String.fromCharCode(65 + index);
        const cell = worksheet.getCell(`${colLetter}6`);
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Data list
      collections.forEach((col: { id: string; date: Date; type: string; category: string; chapter?: { name: string }; student?: { name: string; studentId?: string }; amount: number; description?: string }, idx: number) => {
        const rowNumber = idx + 7;
        const row = worksheet.getRow(rowNumber);
        row.values = [
          col.id,
          new Date(col.date).toLocaleDateString(undefined, { dateStyle: 'medium' }),
          col.chapter?.name || 'Chapter',
          col.type,
          col.category.replace(/_/g, ' '),
          col.student?.name || 'Chapter Contribution',
          col.student?.studentId || 'N/A',
          col.amount,
          col.description || ''
        ];
        row.height = 20;

        worksheet.getCell(`A${rowNumber}`).alignment = { horizontal: 'center' };
        worksheet.getCell(`B${rowNumber}`).alignment = { horizontal: 'center' };
        worksheet.getCell(`C${rowNumber}`).alignment = { horizontal: 'left' };
        worksheet.getCell(`D${rowNumber}`).alignment = { horizontal: 'center' };
        worksheet.getCell(`E${rowNumber}`).alignment = { horizontal: 'left' };
        worksheet.getCell(`F${rowNumber}`).alignment = { horizontal: 'left' };
        worksheet.getCell(`G${rowNumber}`).alignment = { horizontal: 'center' };
        
        const amtCell = worksheet.getCell(`H${rowNumber}`);
        amtCell.numFmt = 'GH₵ #,##0.00';
        amtCell.alignment = { horizontal: 'right' };
        amtCell.font = { name: 'Segoe UI', bold: true };

        worksheet.getCell(`I${rowNumber}`).alignment = { horizontal: 'left' };

        // Zebra striping
        if (rowNumber % 2 === 0) {
          ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach((c: string) => {
            worksheet.getCell(`${c}${rowNumber}`).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FAFC' }
            };
          });
        }

        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach((c: string) => {
          worksheet.getCell(`${c}${rowNumber}`).border = {
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };
        });
      });

      // Bottom balance sum row
      const totalRowNumber = collections.length + 8;
      worksheet.getRow(totalRowNumber).height = 26;
      
      worksheet.getCell(`G${totalRowNumber}`).value = 'Net Balance:';
      worksheet.getCell(`G${totalRowNumber}`).font = { bold: true, name: 'Segoe UI', size: 10 };
      worksheet.getCell(`G${totalRowNumber}`).alignment = { horizontal: 'right', vertical: 'middle' };

      const totalSum = collections.reduce((acc: number, curr: { type: string; amount: number }) => {
        if (curr.type === 'EXPENSE') return acc - curr.amount;
        return acc + curr.amount;
      }, 0);

      const totalSumCell = worksheet.getCell(`H${totalRowNumber}`);
      totalSumCell.value = totalSum;
      totalSumCell.numFmt = 'GH₵ #,##0.00';
      totalSumCell.font = { bold: true, name: 'Segoe UI', size: 10, color: { argb: totalSum >= 0 ? 'FF10B981' : 'FFEF4444' } };
      totalSumCell.alignment = { horizontal: 'right', vertical: 'middle' };
      totalSumCell.border = {
        top: { style: 'thin', color: { argb: 'FF0F172A' } },
        bottom: { style: 'double', color: { argb: 'FF0F172A' } }
      };

      worksheet.columns = [
        { width: 18 }, // ID
        { width: 16 }, // Date
        { width: 24 }, // Chapter
        { width: 12 }, // Type
        { width: 18 }, // Category
        { width: 26 }, // Member Name
        { width: 16 }, // Student ID
        { width: 18 }, // Amount
        { width: 32 }  // Description
      ];
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    responseHeaders.set('Content-Disposition', `attachment; filename="CASA UENR_Excel_Stewardship_${new Date().toISOString().split('T')[0]}.xlsx"`);

    return new NextResponse(buffer, {
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Error generating custom Excel sheet:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
