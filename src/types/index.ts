export interface AsnAbsen {
  id: string;
  no: number;
  nip: string;
  nama: string;
  jabatan: string;
  alasan: string;
}

export interface RekapKehadiran {
  jumlahAsn: number;
  hadir: number;
  sakit: number;
  cuti: number;
  dinasLuar: number;
  lainLain: number;
  keterangan: string;
}

export interface Penandatangan {
  jabatan: string;
  nama: string;
  nip: string;
  signatureImage?: string; // base64 / data url
}

export interface DokumentasiFoto {
  id: string;
  dataUrl: string;
  keterangan: string;
}

export interface LaporanApelData {
  judulBaris1: string; // e.g. "SURAT KETERANGAN"
  judulBaris2: string; // e.g. "LAPORAN KEHADIRAN ASN ITWIL IV"
  satuanKerja: string; // e.g. "INSPEKTORAT JENDERAL KEMENTERIAN HUKUM"
  jenisApel: string; // e.g. "APEL PAGI"
  tanggal: string; // YYYY-MM-DD
  pokja: string; // e.g. "POKJA SDM"
  jamBatasLaporan: string; // e.g. "10.00 pagi"
  rekap: RekapKehadiran;
  daftarTidakHadir: AsnAbsen[];
  kalimatPenutup: string;
  pejabatMengetahui: Penandatangan;
  petugasPembuat: Penandatangan;
  kotaTtd: string; // e.g. "Jakarta"
  dokumentasi: DokumentasiFoto[];
  tampilkanKop: boolean;
}

export interface NotulaRapatData {
  namaInstansiBaris1: string;
  namaSatker: string;
  alamatKontak: string;
  logoUrl?: string;
  judulNotula: string;
  subJudul?: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string;
  tempat: string;
  peserta: string;
  acara: string;
  pembukaan: string;
  arahanPimpinan: string;
  pembahasan: string;
  kesimpulanTindakLanjut: string;
  penutup: string;
  pimpinanRapat: Penandatangan;
  notulis: Penandatangan;
  kotaTtd: string;
  dokumentasi: DokumentasiFoto[];
}

export type DocumentMode = 'apel' | 'notula';
