import { LaporanApelData, NotulaRapatData } from '../types';
import { getTodayIso } from '../utils/dateHelper';

// Vector inline data URLs for realistic official signatures
export const SAMPLE_SIGNATURE_MENGETAHUI = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="70" viewBox="0 0 160 70"><path d="M20,45 C25,25 35,15 42,35 C48,50 35,55 30,35 C28,25 35,20 48,22 C60,25 50,45 65,40 C75,35 85,25 95,30 C98,32 88,48 78,50 C70,52 92,30 115,28 C125,28 135,32 145,35" fill="none" stroke="%23111827" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const SAMPLE_SIGNATURE_PEMBUAT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="70" viewBox="0 0 160 70"><path d="M25,50 L28,20 L40,48 L52,22 L55,45 C65,30 75,25 82,32 C88,38 80,48 72,42 C68,38 75,25 90,26 L135,26" fill="none" stroke="%23111827" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Official Ministry Logo SVG (Garuda / Pengayoman emblem style)
export const LOGO_KEMENKUM_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="%23f8fafc" stroke="%231e3a8a" stroke-width="3"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="%23b45309" stroke-width="1.5" stroke-dasharray="3,2"/>
  <path d="M50,18 L53,28 L63,28 L55,34 L58,44 L50,38 L42,44 L45,34 L37,28 L47,28 Z" fill="%23d97706"/>
  <path d="M30,48 C30,68 50,78 50,78 C50,78 70,68 70,48 C70,42 50,40 50,40 C50,40 30,42 30,48 Z" fill="%231e3a8a" stroke="%23b45309" stroke-width="1.5"/>
  <path d="M42,56 L47,61 L58,50" fill="none" stroke="%23ffffff" stroke-width="2.5" stroke-linecap="round"/>
  <text x="50" y="90" font-size="6.5" font-weight="bold" fill="%231e3a8a" text-anchor="middle" font-family="Arial, sans-serif">PENGAYOMAN</text>
</svg>`;

export const SAMPLE_LAPORAN_APEL_PDF: LaporanApelData = {
  judulBaris1: 'SURAT KETERANGAN',
  judulBaris2: 'LAPORAN KEHADIRAN ASN ITWIL IV',
  satuanKerja: 'INSPEKTORAT JENDERAL KEMENTERIAN HUKUM',
  jenisApel: 'APEL PAGI',
  tanggal: '2026-10-26', // Hari Senin, 26 Oktober 2026 sesuai lampiran
  pokja: 'POKJA SDM',
  jamBatasLaporan: '10.00 pagi',
  tampilkanKop: false, // Lampiran PDF dimulai langsung dengan SURAT KETERANGAN tanpa kop surat ganda
  rekap: {
    jumlahAsn: 25,
    hadir: 17,
    sakit: 0,
    cuti: 0,
    dinasLuar: 8,
    lainLain: 0,
    keterangan: 'KLARIFIKASI PENGADUAN',
  },
  daftarTidakHadir: [
    {
      id: 'asn-1',
      no: 1,
      nip: '197904302009121002',
      nama: 'HELMY AHIRUL APRIANDI, SH., M.H',
      jabatan: 'AUDITOR MUDA',
      alasan: 'KLARIFIKASI PENGADUAN',
    },
    {
      id: 'asn-2',
      no: 2,
      nip: '199305232015031001',
      nama: 'FAISAL AFIFI, S.H.',
      jabatan: 'AUDITOR MUDA',
      alasan: 'KLARIFIKASI PENGADUAN',
    },
    {
      id: 'asn-3',
      no: 3,
      nip: '199207242020122001',
      nama: 'HENNI MARIA MARPAUNG, S.Psi.',
      jabatan: 'AUDITOR PERTAMA',
      alasan: 'KLARIFIKASI PENGADUAN',
    },
    {
      id: 'asn-4',
      no: 4,
      nip: '199209152020121002',
      nama: 'Y.ADITYA ANGGARA P., SH',
      jabatan: 'AUDITOR PERTAMA',
      alasan: 'KLARIFIKASI PENGADUAN',
    },
    {
      id: 'asn-5',
      no: 5,
      nip: '199404062020122001',
      nama: 'SAADIA SANTI, S.E.',
      jabatan: 'AUDITOR PERTAMA',
      alasan: 'KLARIFIKASI PENGADUAN',
    },
    {
      id: 'asn-6',
      no: 6,
      nip: '199603172020122001',
      nama: 'MONICA RONAULI SARASWATY SINAGA, S.E.',
      jabatan: 'AUDITOR PERTAMA',
      alasan: 'KLARIFIKASI PENGADUAN',
    },
    {
      id: 'asn-7',
      no: 7,
      nip: '200010292025062018',
      nama: 'SYEFARDIRTA FASCANTI QOBA, S.H.',
      jabatan: 'AUDITOR PERTAMA',
      alasan: 'KLARIFIKASI PENGADUAN',
    },
    {
      id: 'asn-8',
      no: 8,
      nip: '196908132001121001',
      nama: 'SYAHRIZAL LUBIS, S.H., M.H.',
      jabatan: 'KEPALA SUBBAG TATA USAHA',
      alasan: 'KLARIFIKASI PENGADUAN',
    },
  ],
  kalimatPenutup:
    'Demikian laporan kehadiran ASN POKJA SDM pada Apel Pagi hari Senin, tanggal 26 Oktober 2026 ini kami susun dengan sebenar-benarnya sebagai bentuk pertanggungjawaban atas pelaksanaan kegiatan. Laporan ini dibuat sebelum pukul 10.00 pagi sesuai dengan ketentuan yang berlaku. Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.',
  pejabatMengetahui: {
    jabatan: 'Mengetahui,',
    nama: 'Syahrizal Lubis',
    nip: '196908132001121001',
    signatureImage: SAMPLE_SIGNATURE_MENGETAHUI,
  },
  petugasPembuat: {
    jabatan: 'Pembuat Laporan',
    nama: 'Naufal Enji Athaya',
    nip: '2002043020506103',
    signatureImage: SAMPLE_SIGNATURE_PEMBUAT,
  },
  kotaTtd: 'Jakarta',
  dokumentasi: [],
};

export function getDefaultLaporanApelToday(): LaporanApelData {
  const today = getTodayIso();
  return {
    ...SAMPLE_LAPORAN_APEL_PDF,
    tanggal: today,
    kalimatPenutup: '', // Will be dynamically generated or kept synced with today's date
  };
}

export const SAMPLE_NOTULA_RAPAT: NotulaRapatData = {
  namaInstansiBaris1: 'KEMENTERIAN HUKUM REPUBLIK INDONESIA',
  namaSatker: 'INSPEKTORAT JENDERAL',
  alamatKontak:
    'Jl. H.R. Rasuna Said Kav. X-6 No. 8, Kuningan, Jakarta Selatan | Telp: 021-5252975 | Laman: http://www.itjen.kemenkum.go.id | Surel: itjen@kemenkum.go.id',
  logoUrl: LOGO_KEMENKUM_SVG,
  judulNotula: 'NOTULA RAPAT KOORDINASI WFA INSPEKTORAT WILAYAH IV',
  subJudul: 'EVALUASI CAPAIAN KINERJA DAN TINDAK LANJUT PENGAWASAN',
  tanggal: getTodayIso(),
  waktu: '08.00 s.d. 09.30 WIB',
  tempat: 'Zoom Cloud Meeting / Ruang Rapat Itwil IV Lt. 5',
  peserta: 'Inspektur Wilayah IV, Auditor, dan Tim Tata Usaha (25 Orang)',
  acara: 'Rapat Koordinasi Mingguan dan Rekapitulasi Kehadiran serta Penugasan Tim',
  pembukaan:
    'Rapat dibuka pada pukul 08.00 WIB oleh Kepala Subbagian Tata Usaha selaku moderator, dilanjutkan sambutan dan pengantar oleh Inspektur Wilayah IV.',
  arahanPimpinan:
    '1. Seluruh pegawai ASN di lingkungan Inspektorat Wilayah IV wajib meningkatkan kedisiplinan kehadiran apel pagi dan kepatuhan jam kerja kedinasan.\n2. Tim Auditor yang ditugaskan dalam klarifikasi pengaduan masyarakat agar segera menyelesaikan laporan hasil pemeriksaan (LHP) sesuai target waktu.\n3. Tindak lanjut pengawasan internal triwulan berjalan harus dipantau secara real-time melalui sistem digitalisasi pengawasan.',
  pembahasan:
    '1. Pembahasan terkait 8 (delapan) orang auditor yang sedang melaksanakan tugas dinas luar dalam rangka klarifikasi pengaduan di lapangan.\n2. Progres penyusunan matriks manajemen risiko dan laporan berkala kepatuhan LHKPN.\n3. Evaluasi pemanfaatan anggaran perjalanan dinas dan kesiapan audit tematik.',
  kesimpulanTindakLanjut:
    '1. Laporan rekapitulasi kehadiran apel pagi agar dikirimkan ke Biro Kepegawaian sebelum pukul 10.00 WIB.\n2. Tim audit lapangan agar menyampaikan update perkembangan investigasi setiap hari kerja.\n3. Rapat evaluasi teknis berikutnya dijadwalkan pada hari Senin pekan depan.',
  penutup:
    'Rapat ditutup pada pukul 09.30 WIB dengan pembacaan doa bersama. Notula ini dibuat untuk dipergunakan sebagaimana mestinya.',
  pimpinanRapat: {
    jabatan: 'Inspektur Wilayah IV',
    nama: 'Dr. Bambang Setyabudi, S.H., M.H., CGRE.',
    nip: '196911281997031001',
    signatureImage: SAMPLE_SIGNATURE_MENGETAHUI,
  },
  notulis: {
    jabatan: 'Notulis Rapat',
    nama: 'Naufal Enji Athaya',
    nip: '200204302025061013',
    signatureImage: SAMPLE_SIGNATURE_PEMBUAT,
  },
  kotaTtd: 'Jakarta',
  dokumentasi: [],
};
