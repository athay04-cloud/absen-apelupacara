const NAMA_HARI = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function getTodayIso(): string {
  // Use local time
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateSafe(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

export function getDayNameIndo(dateStr?: string): string {
  const d = parseDateSafe(dateStr);
  return NAMA_HARI[d.getDay()] || '';
}

export function formatIndonesianDate(
  dateStr?: string,
  includeDay: boolean = true
): string {
  const d = parseDateSafe(dateStr);
  const hari = NAMA_HARI[d.getDay()];
  const tgl = d.getDate();
  const bulan = NAMA_BULAN[d.getMonth()];
  const thn = d.getFullYear();

  if (includeDay) {
    return `${hari}, ${tgl} ${bulan} ${thn}`;
  }
  return `${tgl} ${bulan} ${thn}`;
}

export function formatFormalApelHeader(
  jenisApel: string = 'APEL PAGI',
  dateStr?: string
): string {
  const d = parseDateSafe(dateStr);
  const hariUpper = (NAMA_HARI[d.getDay()] || '').toUpperCase();
  const tgl = d.getDate();
  const bulanUpper = (NAMA_BULAN[d.getMonth()] || '').toUpperCase();
  const thn = d.getFullYear();

  return `PADA ${jenisApel.toUpperCase()} HARI ${hariUpper} TANGGAL ${tgl} ${bulanUpper} ${thn}`;
}

export function formatSignatureDate(kota: string = 'Jakarta', dateStr?: string): string {
  const d = parseDateSafe(dateStr);
  const tgl = d.getDate();
  const bulan = NAMA_BULAN[d.getMonth()];
  const thn = d.getFullYear();
  return `${kota}, ${tgl} ${bulan} ${thn}`;
}
