import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  UserX,
  FileText,
  CheckCircle,
  AlertCircle,
  Copy,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react';
import { MASTER_PEGAWAI_ITWIL_IV, PegawaiMaster } from '../data/masterPegawaiItwilIV';
import {
  matchAttendanceFromText,
  SAMPLE_TEXT_PRESENSI_HADIR_26_OKT,
} from '../utils/attendanceMatcher';
import { AsnAbsen, RekapKehadiran } from '../types';

interface AttendanceReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (rekap: RekapKehadiran, daftarTidakHadir: AsnAbsen[]) => void;
}

export const AttendanceReconciliationModal: React.FC<AttendanceReconciliationModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'checklist'>('paste');
  const [pastedText, setPastedText] = useState(SAMPLE_TEXT_PRESENSI_HADIR_26_OKT);
  
  // Set of employee numbers who are PRESENT
  const [presentNumbers, setPresentNumbers] = useState<Set<number>>(new Set());
  
  // Reason config per absent employee
  const [absentReasons, setAbsentReasons] = useState<
    Record<number, { tipe: 'sakit' | 'cuti' | 'dinasLuar' | 'lainLain'; keterangan: string }>
  >({});

  // Global default reason
  const [defaultReasonType, setDefaultReasonType] = useState<'sakit' | 'cuti' | 'dinasLuar' | 'lainLain'>('dinasLuar');
  const [defaultReasonText, setDefaultReasonText] = useState('KLARIFIKASI PENGADUAN');

  // Trigger match when pastedText changes in 'paste' mode
  useEffect(() => {
    if (activeTab === 'paste') {
      const result = matchAttendanceFromText(pastedText);
      const newPresent = new Set(result.hadirList.map((p) => p.no));
      setPresentNumbers(newPresent);
    }
  }, [pastedText, activeTab]);

  // Initial setup on open
  useEffect(() => {
    if (isOpen) {
      const result = matchAttendanceFromText(pastedText);
      const newPresent = new Set(result.hadirList.map((p) => p.no));
      setPresentNumbers(newPresent);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Derive absent employees based on presentNumbers
  const presentEmployees = MASTER_PEGAWAI_ITWIL_IV.filter((p) => presentNumbers.has(p.no));
  const absentEmployees = MASTER_PEGAWAI_ITWIL_IV.filter((p) => !presentNumbers.has(p.no));

  // Toggle present status for an employee
  const toggleEmployee = (no: number) => {
    setPresentNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(no)) {
        next.delete(no);
      } else {
        next.add(no);
      }
      return next;
    });
  };

  const handleSelectAllPresent = () => {
    setPresentNumbers(new Set(MASTER_PEGAWAI_ITWIL_IV.map((p) => p.no)));
  };

  const handleClearAll = () => {
    setPresentNumbers(new Set());
  };

  const handleInvert = () => {
    setPresentNumbers((prev) => {
      const next = new Set<number>();
      MASTER_PEGAWAI_ITWIL_IV.forEach((p) => {
        if (!prev.has(p.no)) {
          next.add(p.no);
        }
      });
      return next;
    });
  };

  // Bulk apply reason to all absent employees
  const handleApplyBulkReason = () => {
    const updated: Record<
      number,
      { tipe: 'sakit' | 'cuti' | 'dinasLuar' | 'lainLain'; keterangan: string }
    > = {};
    absentEmployees.forEach((p) => {
      updated[p.no] = {
        tipe: defaultReasonType,
        keterangan: defaultReasonText.toUpperCase(),
      };
    });
    setAbsentReasons(updated);
  };

  // Set individual absent reason
  const handleSetReason = (
    no: number,
    tipe: 'sakit' | 'cuti' | 'dinasLuar' | 'lainLain',
    keterangan: string
  ) => {
    setAbsentReasons((prev) => ({
      ...prev,
      [no]: {
        tipe,
        keterangan: keterangan.toUpperCase(),
      },
    }));
  };

  // Execute apply to document
  const handleApplyToDocument = () => {
    // Calculate breakdown
    let sakitCount = 0;
    let cutiCount = 0;
    let dinasLuarCount = 0;
    let lainLainCount = 0;

    const daftarTidakHadir: AsnAbsen[] = absentEmployees.map((p, idx) => {
      const reasonObj = absentReasons[p.no] || {
        tipe: defaultReasonType,
        keterangan: defaultReasonText,
      };

      if (reasonObj.tipe === 'sakit') sakitCount++;
      else if (reasonObj.tipe === 'cuti') cutiCount++;
      else if (reasonObj.tipe === 'dinasLuar') dinasLuarCount++;
      else lainLainCount++;

      return {
        id: `asn-${p.no}-${Date.now()}`,
        no: idx + 1,
        nip: p.nip,
        nama: p.nama.toUpperCase(),
        jabatan: p.jabatan.toUpperCase(),
        alasan: (reasonObj.keterangan || defaultReasonText).toUpperCase(),
      };
    });

    const newRekap: RekapKehadiran = {
      jumlahAsn: MASTER_PEGAWAI_ITWIL_IV.length, // 25
      hadir: presentEmployees.length,
      sakit: sakitCount,
      cuti: cutiCount,
      dinasLuar: dinasLuarCount,
      lainLain: lainLainCount,
      keterangan: defaultReasonText.toUpperCase() || 'KLARIFIKASI PENGADUAN',
    };

    onApply(newRekap, daftarTidakHadir);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Penyandingan Kehadiran Otomatis (Reconciliation)</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                  Master 25 Pegawai
                </span>
              </h3>
              <p className="text-xs text-blue-200/80">
                Sodorkan rekap nama yang hadir &rarr; Sistem otomatis menyandingkan dan menyaring daftar pegawai yang TIDAK HADIR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Mode Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'paste'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tempel Teks Rekap Hadir (WA / Chat / List)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'checklist'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Checklist Langsung (25 Pegawai)</span>
            </button>
          </div>

          {/* Quick preset helpers */}
          <div className="flex items-center gap-2 text-xs">
            {activeTab === 'paste' ? (
              <>
                <button
                  type="button"
                  onClick={() => setPastedText(SAMPLE_TEXT_PRESENSI_HADIR_26_OKT)}
                  className="px-2.5 py-1 text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 rounded-md font-medium transition"
                >
                  Contoh: Hadir 17 ASN (26 Okt)
                </button>
                <button
                  type="button"
                  onClick={() => setPastedText('')}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-md font-medium transition"
                >
                  Kosongkan
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSelectAllPresent}
                  className="px-2.5 py-1 text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md font-medium transition"
                >
                  Semua Hadir (25)
                </button>
                <button
                  type="button"
                  onClick={handleInvert}
                  className="px-2.5 py-1 text-indigo-700 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-md font-medium transition"
                >
                  Balikkan Status
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-md font-medium transition"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Input Pane */}
          {activeTab === 'paste' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sodorkan / Tempel Rekap Daftar Nama Pegawai Yang Hadir:</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Mendukung format nama, nomor urut, NIP, atau pesan grup WhatsApp
                </span>
              </div>
              <textarea
                rows={5}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Contoh:&#10;1. Bambang Setyabudi&#10;2. Dwi Ari Wibowo&#10;3. Fandyla Wahyu Sasongko..."
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Klik pegawai di bawah untuk mengubah status kehadiran:
                </label>
                <span className="text-[11px] text-slate-500">
                  Hijau = Hadir &bull; Abu/Merah = Tidak Hadir
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                {MASTER_PEGAWAI_ITWIL_IV.map((p) => {
                  const isPresent = presentNumbers.has(p.no);
                  return (
                    <button
                      key={p.no}
                      type="button"
                      onClick={() => toggleEmployee(p.no)}
                      className={`text-left p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition ${
                        isPresent
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-bold text-[11px] mr-1.5">{p.no}.</span>
                        <span className="font-semibold">{p.nama}</span>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{p.nip}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isPresent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isPresent ? 'HADIR' : 'ABSEN'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Statistics Banner */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-medium">Total Pegawai Itwil IV</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {MASTER_PEGAWAI_ITWIL_IV.length}
              </p>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-xs text-emerald-700 font-medium flex items-center justify-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Tercatat Hadir</span>
              </span>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">
                {presentEmployees.length}
              </p>
            </div>

            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
              <span className="text-xs text-rose-700 font-medium flex items-center justify-center gap-1">
                <UserX className="w-3.5 h-3.5" />
                <span>Hasil: Tidak Hadir</span>
              </span>
              <p className="text-xl font-bold text-rose-700 mt-0.5">
                {absentEmployees.length}
              </p>
            </div>
          </div>

          {/* Side by Side Result Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Hadir (Collapsed / Compact list) */}
            <div className="lg:col-span-5 bg-emerald-50/50 rounded-xl border border-emerald-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Daftar Pegawai Hadir ({presentEmployees.length})</span>
                </h4>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {presentEmployees.map((p, idx) => (
                  <div
                    key={p.no}
                    className="flex items-center justify-between p-1.5 bg-white rounded border border-emerald-100 text-xs"
                  >
                    <div className="truncate">
                      <span className="font-bold text-emerald-700 mr-1">{idx + 1}.</span>
                      <span className="font-medium text-slate-800">{p.nama}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                      ✓ Hadir
                    </span>
                  </div>
                ))}
                {presentEmployees.length === 0 && (
                  <p className="text-xs text-center text-slate-400 py-4">Belum ada pegawai hadir.</p>
                )}
              </div>
            </div>

            {/* Right: Output Hasil Rekap Pegawai Yang Tidak Hadir */}
            <div className="lg:col-span-7 bg-white rounded-xl border-2 border-rose-200 p-4 space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-2">
                <div>
                  <h4 className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
                    <UserX className="w-4 h-4 text-rose-600" />
                    <span>OUTPUT: DAFTAR ASN YANG TIDAK HADIR ({absentEmployees.length})</span>
                  </h4>
                  <p className="text-[11px] text-rose-600">
                    Akan otomatis dimasukkan ke Tabel II Dokumen Laporan
                  </p>
                </div>

                {/* Bulk assign button */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleApplyBulkReason}
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold transition"
                    title="Terapkan alasan default ke seluruh pegawai tidak hadir"
                  >
                    Set Semua Alasan
                  </button>
                </div>
              </div>

              {/* Default reason config bar */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700 text-[11px]">Alasan Default:</span>
                <select
                  value={defaultReasonType}
                  onChange={(e) =>
                    setDefaultReasonType(
                      e.target.value as 'sakit' | 'cuti' | 'dinasLuar' | 'lainLain'
                    )
                  }
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium"
                >
                  <option value="dinasLuar">Dinas Luar</option>
                  <option value="cuti">Cuti</option>
                  <option value="sakit">Sakit</option>
                  <option value="lainLain">Lain-Lain</option>
                </select>
                <input
                  type="text"
                  value={defaultReasonText}
                  onChange={(e) => setDefaultReasonText(e.target.value)}
                  placeholder="KLARIFIKASI PENGADUAN"
                  className="flex-1 min-w-[140px] px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium uppercase"
                />
              </div>

              {/* Absent list detail with individual edits */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {absentEmployees.map((p, idx) => {
                  const currentReason = absentReasons[p.no] || {
                    tipe: defaultReasonType,
                    keterangan: defaultReasonText,
                  };
                  return (
                    <div
                      key={p.no}
                      className="p-2.5 bg-rose-50/40 rounded-lg border border-rose-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-rose-800 mr-1.5">{idx + 1}.</span>
                          <span className="font-bold text-slate-900">{p.nama}</span>
                          <span className="text-[10px] text-slate-500 font-mono ml-2">
                            NIP. {p.nip}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                          {p.jabatan}
                        </span>
                      </div>

                      {/* Reason line */}
                      <div className="flex items-center gap-2 text-xs">
                        <select
                          value={currentReason.tipe}
                          onChange={(e) =>
                            handleSetReason(
                              p.no,
                              e.target.value as 'sakit' | 'cuti' | 'dinasLuar' | 'lainLain',
                              currentReason.keterangan
                            )
                          }
                          className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px]"
                        >
                          <option value="dinasLuar">Dinas Luar</option>
                          <option value="cuti">Cuti</option>
                          <option value="sakit">Sakit</option>
                          <option value="lainLain">Lain-Lain</option>
                        </select>
                        <input
                          type="text"
                          value={currentReason.keterangan}
                          onChange={(e) =>
                            handleSetReason(p.no, currentReason.tipe, e.target.value)
                          }
                          placeholder="KLARIFIKASI PENGADUAN"
                          className="flex-1 px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] uppercase"
                        />
                      </div>
                    </div>
                  );
                })}

                {absentEmployees.length === 0 && (
                  <div className="text-center py-8 text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-8 h-8 mx-auto mb-1 text-emerald-500" />
                    <p className="font-bold text-xs">Nihil - Seluruh 25 Pegawai Hadir Lengkap</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Tabel II akan otomatis menampilkan keterangan &quot;Nihil&quot;.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <span>Rekapitulasi yang akan diterapkan: </span>
            <strong className="text-slate-900 font-mono">
              25 ASN &bull; {presentEmployees.length} Hadir &bull; {absentEmployees.length} Tidak Hadir
            </strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApplyToDocument}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>Terapkan ke Laporan Dokumen &amp; Word (.DOCX)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
