import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  PenTool,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Users,
  ArrowRight,
} from 'lucide-react';
import { LaporanApelData, AsnAbsen, DokumentasiFoto, RekapKehadiran } from '../types';
import {
  formatFormalApelHeader,
  formatIndonesianDate,
  getDayNameIndo,
  getTodayIso,
} from '../utils/dateHelper';
import { SAMPLE_LAPORAN_APEL_PDF } from '../data/sampleData';
import { SignaturePadModal } from './SignaturePadModal';
import { AttendanceReconciliationModal } from './AttendanceReconciliationModal';
import { MasterPegawaiModal } from './MasterPegawaiModal';

interface FormApelProps {
  data: LaporanApelData;
  onChange: (data: LaporanApelData) => void;
  onLoadSample: () => void;
}

export const FormApel: React.FC<FormApelProps> = ({ data, onChange, onLoadSample }) => {
  const [activeSigField, setActiveSigField] = useState<'mengetahui' | 'pembuat' | null>(null);
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [isMasterOpen, setIsMasterOpen] = useState(false);

  // Sync / update helper
  const updateField = <K extends keyof LaporanApelData>(key: K, value: LaporanApelData[K]) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  // Reconcile apply handler
  const handleReconcileApply = (newRekap: RekapKehadiran, newDaftar: AsnAbsen[]) => {
    const hari = getDayNameIndo(data.tanggal);
    const tglIndo = formatIndonesianDate(data.tanggal, false);
    const newPenutup = `Demikian laporan kehadiran ASN ${data.pokja || 'POKJA SDM'} pada ${data.jenisApel || 'Apel Pagi'} hari ${hari}, tanggal ${tglIndo} ini kami susun dengan sebenar-benarnya sebagai bentuk pertanggungjawaban atas pelaksanaan kegiatan. Laporan ini dibuat sebelum pukul ${data.jamBatasLaporan || '10.00 pagi'} sesuai dengan ketentuan yang berlaku. Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.`;

    onChange({
      ...data,
      rekap: newRekap,
      daftarTidakHadir: newDaftar,
      kalimatPenutup: newPenutup,
    });
  };

  // Rekap field update
  const updateRekap = (field: keyof typeof data.rekap, value: number | string) => {
    const updatedRekap = {
      ...data.rekap,
      [field]: value,
    };
    // Auto calculate if modifying sakit, cuti, dinasLuar, lainLain
    if (typeof value === 'number' && field !== 'jumlahAsn' && field !== 'hadir') {
      const totalTidakHadir =
        (field === 'sakit' ? value : updatedRekap.sakit) +
        (field === 'cuti' ? value : updatedRekap.cuti) +
        (field === 'dinasLuar' ? value : updatedRekap.dinasLuar) +
        (field === 'lainLain' ? value : updatedRekap.lainLain);
      updatedRekap.hadir = Math.max(0, updatedRekap.jumlahAsn - totalTidakHadir);
    }
    updateField('rekap', updatedRekap);
  };

  // Add ASN row
  const handleAddAsn = () => {
    const newAsn: AsnAbsen = {
      id: `asn-${Date.now()}`,
      no: data.daftarTidakHadir.length + 1,
      nip: '',
      nama: '',
      jabatan: 'AUDITOR PERTAMA',
      alasan: 'DINAS LUAR',
    };
    const updatedList = [...data.daftarTidakHadir, newAsn];
    // Also increment dinas luar by 1 if reason is dinas luar
    const updatedRekap = {
      ...data.rekap,
      dinasLuar: data.rekap.dinasLuar + 1,
      hadir: Math.max(0, data.rekap.jumlahAsn - (data.rekap.sakit + data.rekap.cuti + data.rekap.dinasLuar + 1 + data.rekap.lainLain)),
    };
    onChange({
      ...data,
      daftarTidakHadir: updatedList,
      rekap: updatedRekap,
    });
  };

  // Update specific ASN
  const handleUpdateAsn = (id: string, field: keyof AsnAbsen, val: string | number) => {
    const updated = data.daftarTidakHadir.map((item) =>
      item.id === id ? { ...item, [field]: val } : item
    );
    updateField('daftarTidakHadir', updated);
  };

  // Remove ASN row
  const handleRemoveAsn = (id: string) => {
    const updated = data.daftarTidakHadir.filter((item) => item.id !== id);
    updateField('daftarTidakHadir', updated);
  };

  // Sync closing sentence automatically with today's date
  const generateAutoClosingSentence = () => {
    const hari = getDayNameIndo(data.tanggal);
    const tglIndo = formatIndonesianDate(data.tanggal, false);
    const text = `Demikian laporan kehadiran ASN ${data.pokja || 'POKJA SDM'} pada ${data.jenisApel || 'Apel Pagi'} hari ${hari}, tanggal ${tglIndo} ini kami susun dengan sebenar-benarnya sebagai bentuk pertanggungjawaban atas pelaksanaan kegiatan. Laporan ini dibuat sebelum pukul ${data.jamBatasLaporan || '10.00 pagi'} sesuai dengan ketentuan yang berlaku. Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.`;
    updateField('kalimatPenutup', text);
  };

  // Documentation photo upload
  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newPhoto: DokumentasiFoto = {
          id: `foto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          dataUrl,
          keterangan: 'Dokumentasi Pelaksanaan Apel Pagi',
        };
        onChange({
          ...data,
          dokumentasi: [...data.dokumentasi, newPhoto],
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (id: string) => {
    updateField(
      'dokumentasi',
      data.dokumentasi.filter((f) => f.id !== id)
    );
  };

  const handlePhotoCaptionChange = (id: string, caption: string) => {
    updateField(
      'dokumentasi',
      data.dokumentasi.map((f) => (f.id === id ? { ...f, keterangan: caption } : f))
    );
  };

  return (
    <div className="space-y-6 text-sm text-slate-700">
      {/* Fitur Utama: Sandingkan Kehadiran Pegawai Itwil IV */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-blue-700/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm tracking-wide text-white">
                  Penyandingan Kehadiran Otomatis Pegawai
                </h4>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-400/30">
                  Fitur Otomatis
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-1 leading-relaxed">
                Sodorkan / tempel daftar nama pegawai yang hadir, lalu sistem akan menyandingkannya ke <strong>25 data master pegawai Itwil IV</strong> dan secara otomatis menghasilkan <strong>rekap nama pegawai yang TIDAK HADIR</strong> beserta NIP &amp; jabatannya.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-800/60 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsReconcileOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-950/40 transition hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sandingkan Rekap Hadir vs Master 25 Pegawai</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsMasterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-blue-200 hover:text-white border border-blue-400/30 font-medium text-xs rounded-xl transition"
          >
            <Users className="w-3.5 h-3.5 text-blue-300" />
            <span>Lihat Data Master Pegawai (25 ASN)</span>
          </button>

          <button
            type="button"
            onClick={onLoadSample}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 text-slate-200 font-medium text-xs rounded-xl transition ml-auto"
            title="Muat data contoh 26 Oktober 2026"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Contoh Lampiran (26 Okt)</span>
          </button>
        </div>
      </div>

      {/* Bagian 1: Header & Tanggal Pelaksanaan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
          <span>1. Informasi Acara &amp; Tanggal Apel</span>
          <span className="text-xs font-normal text-slate-500">Otomatis / Manual</span>
        </h3>

        {/* Date Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Pelaksanaan Apel:
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={data.tanggal}
                  onChange={(e) => updateField('tanggal', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => updateField('tanggal', getTodayIso())}
                className="px-2.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                title="Gunakan Hari Ini"
              >
                Hari Ini
              </button>
            </div>
            {/* Auto converted text preview */}
            <p className="text-[11px] text-blue-600 font-medium mt-1">
              {formatIndonesianDate(data.tanggal, true)}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Apel / Upacara:
            </label>
            <input
              type="text"
              value={data.jenisApel}
              onChange={(e) => updateField('jenisApel', e.target.value)}
              placeholder="APEL PAGI"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium uppercase"
            />
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              Preview teks: {formatFormalApelHeader(data.jenisApel, data.tanggal)}
            </p>
          </div>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Baris 1:
            </label>
            <input
              type="text"
              value={data.judulBaris1}
              onChange={(e) => updateField('judulBaris1', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Baris 2:
            </label>
            <input
              type="text"
              value={data.judulBaris2}
              onChange={(e) => updateField('judulBaris2', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Satuan Kerja / Instansi:
            </label>
            <input
              type="text"
              value={data.satuanKerja}
              onChange={(e) => updateField('satuanKerja', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* Bagian 2: Tabel I. Rekapitulasi Kehadiran */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-semibold text-slate-900 text-sm">
            2. Bagian I. Rekapitulasi Kehadiran
          </h3>
          <span className="text-xs text-slate-500 font-medium">Tabel Statistik</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Jumlah ASN</label>
            <input
              type="number"
              value={data.rekap.jumlahAsn}
              onChange={(e) => updateRekap('jumlahAsn', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-center text-sm font-bold text-slate-900"
            />
          </div>

          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
            <label className="block text-[11px] font-bold text-emerald-800 mb-1">Hadir</label>
            <input
              type="number"
              value={data.rekap.hadir}
              onChange={(e) => updateRekap('hadir', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded text-center text-sm font-bold text-emerald-700"
            />
          </div>

          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <label className="block text-[11px] font-bold text-amber-800 mb-1">Sakit</label>
            <input
              type="number"
              value={data.rekap.sakit}
              onChange={(e) => updateRekap('sakit', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded text-center text-sm font-bold text-amber-700"
            />
          </div>

          <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
            <label className="block text-[11px] font-bold text-blue-800 mb-1">Cuti</label>
            <input
              type="number"
              value={data.rekap.cuti}
              onChange={(e) => updateRekap('cuti', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 bg-white border border-blue-300 rounded text-center text-sm font-bold text-blue-700"
            />
          </div>

          <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-200">
            <label className="block text-[11px] font-bold text-indigo-800 mb-1">Dinas Luar</label>
            <input
              type="number"
              value={data.rekap.dinasLuar}
              onChange={(e) => updateRekap('dinasLuar', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 bg-white border border-indigo-300 rounded text-center text-sm font-bold text-indigo-700"
            />
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Lain-Lain</label>
            <input
              type="number"
              value={data.rekap.lainLain}
              onChange={(e) => updateRekap('lainLain', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-center text-sm font-bold text-slate-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Keterangan Kolom Terakhir:
          </label>
          <input
            type="text"
            value={data.rekap.keterangan}
            onChange={(e) => updateRekap('keterangan', e.target.value)}
            placeholder="Contoh: KLARIFIKASI PENGADUAN"
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium uppercase"
          />
        </div>
      </div>

      {/* Bagian 3: Tabel II. Daftar ASN Yang Tidak Hadir */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              3. Bagian II. Daftar ASN Yang Tidak Hadir
            </h3>
            <p className="text-xs text-slate-500">
              Total {data.daftarTidakHadir.length} pegawai tercatat tidak hadir
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddAsn}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah ASN</span>
          </button>
        </div>

        {/* ASN List Table in Form */}
        <div className="space-y-3">
          {data.daftarTidakHadir.map((asn, idx) => (
            <div
              key={asn.id}
              className="p-3 bg-slate-50/70 rounded-lg border border-slate-200 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Pegawai #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveAsn(asn.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                  title="Hapus baris ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">NIP:</label>
                  <input
                    type="text"
                    value={asn.nip}
                    onChange={(e) => handleUpdateAsn(asn.id, 'nip', e.target.value)}
                    placeholder="1980..."
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Nama &amp; Gelar:</label>
                  <input
                    type="text"
                    value={asn.nama}
                    onChange={(e) => handleUpdateAsn(asn.id, 'nama', e.target.value)}
                    placeholder="Nama Lengkap, Gelar"
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Jabatan:</label>
                  <input
                    type="text"
                    value={asn.jabatan}
                    onChange={(e) => handleUpdateAsn(asn.id, 'jabatan', e.target.value)}
                    placeholder="AUDITOR MUDA"
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Alasan:</label>
                  <input
                    type="text"
                    value={asn.alasan}
                    onChange={(e) => handleUpdateAsn(asn.id, 'alasan', e.target.value)}
                    placeholder="KLARIFIKASI PENGADUAN"
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          ))}

          {data.daftarTidakHadir.length === 0 && (
            <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
              Belum ada data ASN yang tidak hadir. Klik <strong>Tambah ASN</strong> di atas jika ada yang izin/dinas.
            </div>
          )}
        </div>
      </div>

      {/* Bagian 4: Kalimat Penutup */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-semibold text-slate-900 text-sm">4. Kalimat Penutup Laporan</h3>
          <button
            type="button"
            onClick={generateAutoClosingSentence}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Sinkronkan Otomatis Tanggal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Nama POKJA / Tim:</label>
            <input
              type="text"
              value={data.pokja}
              onChange={(e) => updateField('pokja', e.target.value)}
              placeholder="POKJA SDM"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Batas Jam Pembuatan:</label>
            <input
              type="text"
              value={data.jamBatasLaporan}
              onChange={(e) => updateField('jamBatasLaporan', e.target.value)}
              placeholder="10.00 pagi"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Uraian Teks Penutup (Dapat disesuaikan):
          </label>
          <textarea
            rows={3}
            value={data.kalimatPenutup}
            onChange={(e) => updateField('kalimatPenutup', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Bagian 5: Penandatangan (2 Kolom) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="font-semibold text-slate-900 text-sm">
            5. Penandatangan (2 Kolom Resmi)
          </h3>
          <p className="text-xs text-slate-500">
            Kolom kiri: Pejabat Mengetahui | Kolom kanan: Pembuat Laporan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kolom Kiri: Pejabat Mengetahui */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800">Kolom Kiri (Mengetahui)</span>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                Keterangan Jabatan:
              </label>
              <input
                type="text"
                value={data.pejabatMengetahui.jabatan}
                onChange={(e) =>
                  updateField('pejabatMengetahui', {
                    ...data.pejabatMengetahui,
                    jabatan: e.target.value,
                  })
                }
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                Nama Lengkap &amp; Gelar:
              </label>
              <input
                type="text"
                value={data.pejabatMengetahui.nama}
                onChange={(e) =>
                  updateField('pejabatMengetahui', {
                    ...data.pejabatMengetahui,
                    nama: e.target.value,
                  })
                }
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">NIP:</label>
              <input
                type="text"
                value={data.pejabatMengetahui.nip}
                onChange={(e) =>
                  updateField('pejabatMengetahui', {
                    ...data.pejabatMengetahui,
                    nip: e.target.value,
                  })
                }
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
              />
            </div>

            {/* Signature Box */}
            <div className="pt-1">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Tanda Tangan Digital:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSigField('mengetahui')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-400 rounded-lg text-xs font-medium text-slate-700 shadow-sm transition"
                >
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  <span>{data.pejabatMengetahui.signatureImage ? 'Ubah Tanda Tangan' : 'Buat / Unggah TTD'}</span>
                </button>
                {data.pejabatMengetahui.signatureImage && (
                  <button
                    type="button"
                    onClick={() =>
                      updateField('pejabatMengetahui', {
                        ...data.pejabatMengetahui,
                        signatureImage: undefined,
                      })
                    }
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Hapus
                  </button>
                )}
              </div>
              {data.pejabatMengetahui.signatureImage && (
                <div className="mt-2 p-1 bg-white border border-slate-200 rounded max-w-[130px] h-14 flex items-center justify-center">
                  <img
                    src={data.pejabatMengetahui.signatureImage}
                    alt="Preview TTD"
                    className="max-h-12 object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Pembuat Laporan */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800">Kolom Kanan (Pembuat Laporan)</span>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                Kota Tanda Tangan:
              </label>
              <input
                type="text"
                value={data.kotaTtd}
                onChange={(e) => updateField('kotaTtd', e.target.value)}
                placeholder="Jakarta"
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                Keterangan Jabatan:
              </label>
              <input
                type="text"
                value={data.petugasPembuat.jabatan}
                onChange={(e) =>
                  updateField('petugasPembuat', {
                    ...data.petugasPembuat,
                    jabatan: e.target.value,
                  })
                }
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                Nama Lengkap &amp; Gelar:
              </label>
              <input
                type="text"
                value={data.petugasPembuat.nama}
                onChange={(e) =>
                  updateField('petugasPembuat', {
                    ...data.petugasPembuat,
                    nama: e.target.value,
                  })
                }
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">NIP:</label>
              <input
                type="text"
                value={data.petugasPembuat.nip}
                onChange={(e) =>
                  updateField('petugasPembuat', {
                    ...data.petugasPembuat,
                    nip: e.target.value,
                  })
                }
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
              />
            </div>

            {/* Signature Box */}
            <div className="pt-1">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Tanda Tangan Digital:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSigField('pembuat')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-400 rounded-lg text-xs font-medium text-slate-700 shadow-sm transition"
                >
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  <span>{data.petugasPembuat.signatureImage ? 'Ubah Tanda Tangan' : 'Buat / Unggah TTD'}</span>
                </button>
                {data.petugasPembuat.signatureImage && (
                  <button
                    type="button"
                    onClick={() =>
                      updateField('petugasPembuat', {
                        ...data.petugasPembuat,
                        signatureImage: undefined,
                      })
                    }
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Hapus
                  </button>
                )}
              </div>
              {data.petugasPembuat.signatureImage && (
                <div className="mt-2 p-1 bg-white border border-slate-200 rounded max-w-[130px] h-14 flex items-center justify-center">
                  <img
                    src={data.petugasPembuat.signatureImage}
                    alt="Preview TTD"
                    className="max-h-12 object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bagian 6: Lampiran Foto Dokumentasi */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              6. Lampiran Foto Dokumentasi (Opsional)
            </h3>
            <p className="text-xs text-slate-500">
              Unggah tangkapan layar apel / foto lapangan untuk disematkan di Word &amp; PDF
            </p>
          </div>
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah Foto</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleAddPhoto}
            />
          </label>
        </div>

        {data.dokumentasi.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.dokumentasi.map((foto, idx) => (
              <div key={foto.id} className="p-2 border border-slate-200 rounded-lg bg-slate-50 space-y-1.5">
                <div className="relative">
                  <img
                    src={foto.dataUrl}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(foto.id)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow"
                    title="Hapus foto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={foto.keterangan}
                  onChange={(e) => handlePhotoCaptionChange(foto.id, e.target.value)}
                  placeholder="Keterangan foto..."
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px]"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
            <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
            Belum ada foto dokumentasi. Unggah foto kegiatan jika diperlukan.
          </div>
        )}
      </div>

      {/* Signature Pad Modal */}
      <SignaturePadModal
        isOpen={activeSigField !== null}
        title={
          activeSigField === 'mengetahui'
            ? 'Tanda Tangan Pejabat Mengetahui'
            : 'Tanda Tangan Pembuat Laporan'
        }
        currentSignature={
          activeSigField === 'mengetahui'
            ? data.pejabatMengetahui.signatureImage
            : data.petugasPembuat.signatureImage
        }
        onClose={() => setActiveSigField(null)}
        onSave={(dataUrl) => {
          if (activeSigField === 'mengetahui') {
            updateField('pejabatMengetahui', {
              ...data.pejabatMengetahui,
              signatureImage: dataUrl,
            });
          } else if (activeSigField === 'pembuat') {
            updateField('petugasPembuat', {
              ...data.petugasPembuat,
              signatureImage: dataUrl,
            });
          }
        }}
      />

      {/* Attendance Reconciliation Modal */}
      <AttendanceReconciliationModal
        isOpen={isReconcileOpen}
        onClose={() => setIsReconcileOpen(false)}
        onApply={handleReconcileApply}
      />

      {/* Master Pegawai Modal */}
      <MasterPegawaiModal
        isOpen={isMasterOpen}
        onClose={() => setIsMasterOpen(false)}
      />
    </div>
  );
};
