import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  VerticalAlign,
  ImageRun,
} from 'docx';
import saveAs from 'file-saver';
import { LaporanApelData, NotulaRapatData } from '../types';
import {
  formatFormalApelHeader,
  formatIndonesianDate,
  formatSignatureDate,
  getDayNameIndo,
} from './dateHelper';

/**
 * Converts any image source (data URL, SVG data URL, blob URL)
 * into a PNG Uint8Array via an offscreen HTML Canvas so Microsoft Word can embed it safely.
 */
export async function imageToPngUint8Array(
  imgSrc: string,
  targetWidth = 300,
  targetHeight = 120
): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const aspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
        const w = targetWidth;
        const h = Math.round(targetWidth / aspect) || targetHeight;

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const buf = await blob.arrayBuffer();
          resolve({
            bytes: new Uint8Array(buf),
            width: Math.min(w, 200),
            height: Math.min(h, 90),
          });
        }, 'image/png');
      };
      img.onerror = () => resolve(null);
      img.src = imgSrc;
    } catch {
      resolve(null);
    }
  });
}

const borderThin = {
  style: BorderStyle.SINGLE,
  size: 4, // 0.5 pt
  color: '000000',
};

const borderNone = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'FFFFFF',
};

const tableBordersAll = {
  top: borderThin,
  bottom: borderThin,
  left: borderThin,
  right: borderThin,
};

const cellMargins = {
  top: 80,
  bottom: 80,
  left: 120,
  right: 120,
};

/**
 * Generates DOCX for Laporan Rekap Kehadiran Apel (Matching attached PDF exactly)
 */
export async function exportLaporanApelToDocx(data: LaporanApelData) {
  // Convert signatures to PNG if present
  let sigMengetahuiBytes: { bytes: Uint8Array; width: number; height: number } | null = null;
  let sigPembuatBytes: { bytes: Uint8Array; width: number; height: number } | null = null;

  if (data.pejabatMengetahui.signatureImage) {
    sigMengetahuiBytes = await imageToPngUint8Array(data.pejabatMengetahui.signatureImage, 180, 80);
  }
  if (data.petugasPembuat.signatureImage) {
    sigPembuatBytes = await imageToPngUint8Array(data.petugasPembuat.signatureImage, 180, 80);
  }

  // Pre-load documentation images
  const docPhotos: { bytes: Uint8Array; width: number; height: number; caption: string }[] = [];
  for (const foto of data.dokumentasi) {
    const res = await imageToPngUint8Array(foto.dataUrl, 450, 300);
    if (res) {
      docPhotos.push({ ...res, caption: foto.keterangan });
    }
  }

  const hariUpper = getDayNameIndo(data.tanggal).toUpperCase();
  const dateFormattedUpper = formatFormalApelHeader(data.jenisApel, data.tanggal);

  // Table I: Rekapitulasi Kehadiran
  // Column widths total 9355 dxa (fits inside 11906 - 1417 - 1134 = 9355 dxa printable area)
  // Jumlah ASN (1200), Hadir (1200), Sakit (1000), Cuti (1000), Dinas Luar (1200), Lain-Lain (1100), Keterangan (2655)
  const colWidths = [1200, 1200, 1000, 1000, 1200, 1100, 2655];

  const rekapRow1 = new TableRow({
    children: [
      new TableCell({
        rowSpan: 2,
        width: { size: colWidths[0], type: WidthType.DXA },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Jumlah', bold: true, font: 'Arial', size: 22 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'ASN', bold: true, font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        rowSpan: 2,
        width: { size: colWidths[1], type: WidthType.DXA },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Hadir', bold: true, font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        columnSpan: 4,
        width: {
          size: colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5],
          type: WidthType.DXA,
        },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Tidak Hadir Karena:', bold: true, font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        rowSpan: 2,
        width: { size: colWidths[6], type: WidthType.DXA },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Keterangan', bold: true, font: 'Arial', size: 22 })],
          }),
        ],
      }),
    ],
  });

  const rekapRow2 = new TableRow({
    children: [
      new TableCell({
        width: { size: colWidths[2], type: WidthType.DXA },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Sakit', bold: true, font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        width: { size: colWidths[3], type: WidthType.DXA },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Cuti', bold: true, font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        width: { size: colWidths[4], type: WidthType.DXA },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Dinas', bold: true, font: 'Arial', size: 22 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Luar', bold: true, font: 'Arial', size: 22 }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: colWidths[5], type: WidthType.DXA },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Lain-Lain', bold: true, font: 'Arial', size: 22 })],
          }),
        ],
      }),
    ],
  });

  const rekapDataRow = new TableRow({
    children: [
      new TableCell({
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: String(data.rekap.jumlahAsn), font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: String(data.rekap.hadir), font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: String(data.rekap.sakit), font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: String(data.rekap.cuti), font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: String(data.rekap.dinasLuar), font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: String(data.rekap.lainLain), font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: data.rekap.keterangan || '-', font: 'Arial', size: 22 })],
          }),
        ],
      }),
    ],
  });

  const tableRekap = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [rekapRow1, rekapRow2, rekapDataRow],
  });

  // Table II: Daftar ASN Yang Tidak Hadir
  // Widths: No (600), NIP (2300), NAMA (2655), JABATAN (1800), ALASAN (2000) = 9355
  const colAsnWidths = [600, 2300, 2655, 1800, 2000];

  const tableAsnHeader = new TableRow({
    children: [
      new TableCell({
        width: { size: colAsnWidths[0], type: WidthType.DXA },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'No', bold: true, font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        width: { size: colAsnWidths[1], type: WidthType.DXA },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'NIP', bold: true, font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        width: { size: colAsnWidths[2], type: WidthType.DXA },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'NAMA', bold: true, font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        width: { size: colAsnWidths[3], type: WidthType.DXA },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'JABATAN', bold: true, font: 'Arial', size: 22 })],
          }),
        ],
      }),
      new TableCell({
        width: { size: colAsnWidths[4], type: WidthType.DXA },
        borders: tableBordersAll,
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'ALASAN', bold: true, font: 'Arial', size: 22 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'KETIDAKHADIRAN', bold: true, font: 'Arial', size: 22 }),
            ],
          }),
        ],
      }),
    ],
  });

  const tableAsnRows: TableRow[] = [tableAsnHeader];

  if (data.daftarTidakHadir.length === 0) {
    tableAsnRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 5,
            borders: tableBordersAll,
            margins: cellMargins,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Nihil (Seluruh ASN Hadir Mengikuti Apel)',
                    italics: true,
                    font: 'Arial', size: 22,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  } else {
    data.daftarTidakHadir.forEach((asn, idx) => {
      tableAsnRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: tableBordersAll,
              margins: cellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `${idx + 1}.`, font: 'Arial', size: 22 })],
                }),
              ],
            }),
            new TableCell({
              borders: tableBordersAll,
              margins: cellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: asn.nip, font: 'Arial', size: 22 })],
                }),
              ],
            }),
            new TableCell({
              borders: tableBordersAll,
              margins: cellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: asn.nama, font: 'Arial', size: 22 })],
                }),
              ],
            }),
            new TableCell({
              borders: tableBordersAll,
              margins: cellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: asn.jabatan, font: 'Arial', size: 22 })],
                }),
              ],
            }),
            new TableCell({
              borders: tableBordersAll,
              margins: cellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: asn.alasan, font: 'Arial', size: 22 })],
                }),
              ],
            }),
          ],
        })
      );
    });
  }

  const tableAsn = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableAsnRows,
  });

  // Kalimat Penutup
  const defaultPenutup = `Demikian laporan kehadiran ASN ${data.pokja || 'POKJA SDM'} pada ${data.jenisApel || 'Apel Pagi'} hari ${getDayNameIndo(data.tanggal)}, tanggal ${formatIndonesianDate(data.tanggal, false)} ini kami susun dengan sebenar-benarnya sebagai bentuk pertanggungjawaban atas pelaksanaan kegiatan. Laporan ini dibuat sebelum pukul ${data.jamBatasLaporan || '10.00 pagi'} sesuai dengan ketentuan yang berlaku. Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.`;
  const penutupText = data.kalimatPenutup.trim() ? data.kalimatPenutup : defaultPenutup;

  // Signature Table (2 Columns, Multi-row for perfect horizontal alignment)
  const cellLeftProps = {
    width: { size: 55, type: WidthType.PERCENTAGE },
    borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
  };
  const cellRightProps = {
    width: { size: 45, type: WidthType.PERCENTAGE },
    borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
  };

  const sigRow1 = new TableRow({
    children: [
      new TableCell({
        ...cellLeftProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: data.pejabatMengetahui.jabatan || 'Mengetahui,',
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        ...cellRightProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: formatSignatureDate(data.kotaTtd, data.tanggal),
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const sigRow2 = new TableRow({
    children: [
      new TableCell({
        ...cellLeftProps,
        children: [new Paragraph({ children: [new TextRun({ text: '', font: 'Arial', size: 22 })] })],
      }),
      new TableCell({
        ...cellRightProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: data.petugasPembuat.jabatan || 'Pembuat Laporan,',
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const sigRow3 = new TableRow({
    children: [
      new TableCell({
        ...cellLeftProps,
        children: sigMengetahuiBytes
          ? [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: sigMengetahuiBytes.bytes,
                    transformation: {
                      width: 140,
                      height: 55,
                    },
                    type: 'png',
                  }),
                ],
              }),
            ]
          : [new Paragraph({ spacing: { before: 800 } })],
      }),
      new TableCell({
        ...cellRightProps,
        children: sigPembuatBytes
          ? [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: sigPembuatBytes.bytes,
                    transformation: {
                      width: 140,
                      height: 55,
                    },
                    type: 'png',
                  }),
                ],
              }),
            ]
          : [new Paragraph({ spacing: { before: 800 } })],
      }),
    ],
  });

  const sigRow4 = new TableRow({
    children: [
      new TableCell({
        ...cellLeftProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: data.pejabatMengetahui.nama,
                bold: true,
                underline: {},
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        ...cellRightProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: data.petugasPembuat.nama,
                bold: true,
                underline: {},
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const sigRow5 = new TableRow({
    children: [
      new TableCell({
        ...cellLeftProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `NIP. ${data.pejabatMengetahui.nip}`,
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        ...cellRightProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `NIP. ${data.petugasPembuat.nip}`,
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const tableSignature = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: borderNone,
      bottom: borderNone,
      left: borderNone,
      right: borderNone,
      insideHorizontal: borderNone,
      insideVertical: borderNone,
    },
    rows: [sigRow1, sigRow2, sigRow3, sigRow4, sigRow5],
  });

  // Section Children
  const docChildren: (Paragraph | Table)[] = [
    // Judul Dokumen (Centered Bold)
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.judulBaris1 || 'SURAT KETERANGAN',
          bold: true,
          font: 'Arial',
          size: 24, // 12pt
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.judulBaris2 || 'LAPORAN KEHADIRAN ASN ITWIL IV',
          bold: true,
          font: 'Arial',
          size: 23,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.satuanKerja || 'INSPEKTORAT JENDERAL KEMENTERIAN HUKUM',
          bold: true,
          font: 'Arial',
          size: 23,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        new TextRun({
          text: dateFormattedUpper,
          bold: true,
          font: 'Arial',
          size: 23,
        }),
      ],
    }),

    // Bagian I
    new Paragraph({
      spacing: { before: 180, after: 100 },
      children: [
        new TextRun({
          text: 'I.  REKAPITULASI KEHADIRAN APEL',
          bold: true,
          font: 'Arial',
          size: 22,
        }),
      ],
    }),
    tableRekap,

    // Bagian II
    new Paragraph({
      spacing: { before: 240, after: 100 },
      children: [
        new TextRun({
          text: 'II. DAFTAR ASN YANG TIDAK HADIR APEL',
          bold: true,
          font: 'Arial',
          size: 22,
        }),
      ],
    }),
    tableAsn,

    // Paragraf Penutup (Justified, Indent 720 dxa = 0.5 inch)
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: 720 },
      spacing: { before: 260, after: 360, line: 280 },
      children: [
        new TextRun({
          text: penutupText,
          font: 'Arial', size: 22,
        }),
      ],
    }),

    // Table Signature
    tableSignature,
  ];

  // If there are photos attached, append documentation section
  if (docPhotos.length > 0) {
    docChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: 'LAMPIRAN DOKUMENTASI KEGIATAN',
            bold: true,
            font: 'Arial',
            size: 24,
          }),
        ],
      })
    );

    for (const foto of docPhotos) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 150, after: 80 },
          children: [
            new ImageRun({
              data: foto.bytes,
              transformation: {
                width: 440,
                height: 240,
              },
              type: 'png',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: foto.caption || 'Dokumentasi Pelaksanaan Kegiatan',
              italics: true,
              font: 'Arial', size: 22,
            }),
          ],
        })
      );
    }
  }

  // Build full Document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 22, // 11 pt
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 Width in twips (210mm)
              height: 16838, // A4 Height in twips (297mm)
            },
            margin: {
              top: 1417, // 2.5 cm
              bottom: 1134, // 2.0 cm
              left: 1417, // 2.5 cm
              right: 1134, // 2.0 cm
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanDate = data.tanggal.replace(/-/g, '_');
  saveAs(blob, `LAPORAN_APEL_${cleanDate}.docx`);
}

/**
 * Generates DOCX for Notula Rapat Koordinasi Kedinasan
 */
export async function exportNotulaRapatToDocx(data: NotulaRapatData) {
  let sigPimpinanBytes: { bytes: Uint8Array; width: number; height: number } | null = null;
  let sigNotulisBytes: { bytes: Uint8Array; width: number; height: number } | null = null;
  let logoBytes: { bytes: Uint8Array; width: number; height: number } | null = null;

  if (data.pimpinanRapat.signatureImage) {
    sigPimpinanBytes = await imageToPngUint8Array(data.pimpinanRapat.signatureImage, 180, 80);
  }
  if (data.notulis.signatureImage) {
    sigNotulisBytes = await imageToPngUint8Array(data.notulis.signatureImage, 180, 80);
  }
  if (data.logoUrl) {
    logoBytes = await imageToPngUint8Array(data.logoUrl, 100, 100);
  }

  // Pre-load documentation images
  const docPhotos: { bytes: Uint8Array; width: number; height: number; caption: string }[] = [];
  for (const foto of data.dokumentasi) {
    const res = await imageToPngUint8Array(foto.dataUrl, 450, 300);
    if (res) {
      docPhotos.push({ ...res, caption: foto.keterangan });
    }
  }

  // Kop surat table (2 columns: logo on left, texts on right, bottom border double)
  const kopChildren: (Paragraph | Table)[] = [];

  const kopRightParagraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.namaInstansiBaris1 || 'KEMENTERIAN HUKUM REPUBLIK INDONESIA',
          bold: true,
          font: 'Arial',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.namaSatker || 'INSPEKTORAT JENDERAL',
          bold: true,
          font: 'Arial',
          size: 26,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text:
            data.alamatKontak ||
            'Jl. H.R. Rasuna Said Kav. X-6 No. 8, Kuningan, Jakarta Selatan | Telp: 021-5252975',
          font: 'Arial',
          size: 16,
        }),
      ],
    }),
  ];

  const kopLeftParagraphs: Paragraph[] = [];
  if (logoBytes) {
    kopLeftParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: logoBytes.bytes,
            transformation: {
              width: 70,
              height: 70,
            },
            type: 'png',
          }),
        ],
      })
    );
  } else {
    kopLeftParagraphs.push(new Paragraph({}));
  }

  const tableKop = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: borderNone,
      left: borderNone,
      right: borderNone,
      bottom: {
        style: BorderStyle.DOUBLE,
        size: 12, // Double line border
        color: '000000',
      },
      insideHorizontal: borderNone,
      insideVertical: borderNone,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: { top: borderNone, left: borderNone, right: borderNone, bottom: borderNone },
            verticalAlign: VerticalAlign.CENTER,
            children: kopLeftParagraphs,
          }),
          new TableCell({
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: { top: borderNone, left: borderNone, right: borderNone, bottom: borderNone },
            verticalAlign: VerticalAlign.CENTER,
            children: kopRightParagraphs,
          }),
        ],
      }),
    ],
  });

  kopChildren.push(tableKop);

  // Metadata Table (Hari/Tanggal, Waktu, Tempat, Peserta, Acara)
  const metaRows = [
    { label: 'Hari / Tanggal', val: formatIndonesianDate(data.tanggal, true) },
    { label: 'Waktu', val: data.waktu || '08.00 s.d. Selesai' },
    { label: 'Tempat', val: data.tempat || 'Ruang Rapat' },
    { label: 'Peserta', val: data.peserta || '-' },
    { label: 'Acara', val: data.acara || '-' },
  ];

  const tableMetadata = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: borderNone,
      bottom: borderNone,
      left: borderNone,
      right: borderNone,
      insideHorizontal: borderNone,
      insideVertical: borderNone,
    },
    rows: metaRows.map(
      (m) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: m.label, bold: true, font: 'Arial', size: 22 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 5, type: WidthType.PERCENTAGE },
              borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: ':', bold: true, font: 'Arial', size: 22 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: m.val, font: 'Arial', size: 22 })],
                }),
              ],
            }),
          ],
        })
    ),
  });

  // Tanda Tangan Table (Multi-row for perfect horizontal alignment)
  const cellNotulaLeftProps = {
    width: { size: 55, type: WidthType.PERCENTAGE },
    borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
  };
  const cellNotulaRightProps = {
    width: { size: 45, type: WidthType.PERCENTAGE },
    borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
  };

  const sigNotulaRow1 = new TableRow({
    children: [
      new TableCell({
        ...cellNotulaLeftProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: data.pimpinanRapat.jabatan || 'Pimpinan Rapat,',
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        ...cellNotulaRightProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: formatSignatureDate(data.kotaTtd, data.tanggal),
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const sigNotulaRow2 = new TableRow({
    children: [
      new TableCell({
        ...cellNotulaLeftProps,
        children: [new Paragraph({ children: [new TextRun({ text: '', font: 'Arial', size: 22 })] })],
      }),
      new TableCell({
        ...cellNotulaRightProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: data.notulis.jabatan || 'Notulis,',
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const sigNotulaRow3 = new TableRow({
    children: [
      new TableCell({
        ...cellNotulaLeftProps,
        children: sigPimpinanBytes
          ? [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: sigPimpinanBytes.bytes,
                    transformation: { width: 140, height: 55 },
                    type: 'png',
                  }),
                ],
              }),
            ]
          : [new Paragraph({ spacing: { before: 800 } })],
      }),
      new TableCell({
        ...cellNotulaRightProps,
        children: sigNotulisBytes
          ? [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: sigNotulisBytes.bytes,
                    transformation: { width: 140, height: 55 },
                    type: 'png',
                  }),
                ],
              }),
            ]
          : [new Paragraph({ spacing: { before: 800 } })],
      }),
    ],
  });

  const sigNotulaRow4 = new TableRow({
    children: [
      new TableCell({
        ...cellNotulaLeftProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: data.pimpinanRapat.nama,
                bold: true,
                underline: {},
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        ...cellNotulaRightProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: data.notulis.nama,
                bold: true,
                underline: {},
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const sigNotulaRow5 = new TableRow({
    children: [
      new TableCell({
        ...cellNotulaLeftProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `NIP. ${data.pimpinanRapat.nip}`,
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        ...cellNotulaRightProps,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `NIP. ${data.notulis.nip}`,
                font: 'Arial',
                size: 22,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const tableSignature = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: borderNone,
      bottom: borderNone,
      left: borderNone,
      right: borderNone,
      insideHorizontal: borderNone,
      insideVertical: borderNone,
    },
    rows: [sigNotulaRow1, sigNotulaRow2, sigNotulaRow3, sigNotulaRow4, sigNotulaRow5],
  });

  const docChildren: (Paragraph | Table)[] = [
    tableKop,
    new Paragraph({ spacing: { before: 240 } }),
    // Judul Notula
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.judulNotula || 'NOTULA RAPAT',
          bold: true,
          font: 'Arial',
          size: 24,
        }),
      ],
    }),
  ];

  if (data.subJudul) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: data.subJudul,
            bold: true,
            font: 'Arial',
            size: 22,
          }),
        ],
      })
    );
  } else {
    docChildren.push(new Paragraph({ spacing: { after: 150 } }));
  }

  docChildren.push(
    tableMetadata,
    new Paragraph({
      spacing: { before: 240, after: 100 },
      children: [
        new TextRun({
          text: 'URAIAN JALANNYA RAPAT & ARAHAN PIMPINAN:',
          bold: true,
          font: 'Arial',
          size: 22,
        }),
      ],
    })
  );

  // Sections
  const addTextSection = (title: string, content: string) => {
    if (!content.trim()) return;
    docChildren.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [new TextRun({ text: title, bold: true, font: 'Arial', size: 22 })],
      })
    );
    const lines = content.split('\n');
    lines.forEach((line) => {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 360 },
          spacing: { line: 280, after: 80 },
          children: [new TextRun({ text: line, font: 'Arial', size: 22 })],
        })
      );
    });
  };

  addTextSection('A. Pembukaan:', data.pembukaan);
  addTextSection('B. Arahan Pimpinan Rapat:', data.arahanPimpinan);
  addTextSection('C. Pembahasan & Masukan Peserta:', data.pembahasan);
  addTextSection('D. Kesimpulan & Rencana Tindak Lanjut:', data.kesimpulanTindakLanjut);
  addTextSection('E. Penutup:', data.penutup);

  docChildren.push(
    new Paragraph({ spacing: { before: 260 } }),
    tableSignature
  );

  // Photos
  if (docPhotos.length > 0) {
    docChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: 'LAMPIRAN DOKUMENTASI KEGIATAN',
            bold: true,
            font: 'Arial',
            size: 24,
          }),
        ],
      })
    );

    for (const foto of docPhotos) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 150, after: 80 },
          children: [
            new ImageRun({
              data: foto.bytes,
              transformation: { width: 440, height: 240 },
              type: 'png',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: foto.caption || 'Dokumentasi Rapat',
              italics: true,
              font: 'Arial', size: 22,
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 22, // 11 pt
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1417, bottom: 1134, left: 1417, right: 1134 },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanDate = data.tanggal.replace(/-/g, '_');
  saveAs(blob, `NOTULA_RAPAT_${cleanDate}.docx`);
}
