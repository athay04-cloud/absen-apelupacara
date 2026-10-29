/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  RotateCcw,
  Eye,
  Edit3,
  Calendar,
  Sparkles,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCheck2,
  Layers,
} from 'lucide-react';
import { DocumentMode, LaporanApelData, NotulaRapatData } from './types';
import {
  SAMPLE_LAPORAN_APEL_PDF,
  SAMPLE_NOTULA_RAPAT,
  getDefaultLaporanApelToday,
} from './data/sampleData';
import { FormApel } from './components/FormApel';
import { FormNotula } from './components/FormNotula';
import { DocumentPreview } from './components/DocumentPreview';
import { exportLaporanApelToDocx, exportNotulaRapatToDocx } from './utils/docxExport';
import { formatIndonesianDate, getTodayIso } from './utils/dateHelper';

export default function App() {
  const [mode, setMode] = useState<DocumentMode>('apel');
  const [apelData, setApelData] = useState<LaporanApelData>(SAMPLE_LAPORAN_APEL_PDF);
  const [notulaData, setNotulaData] = useState<NotulaRapatData>(SAMPLE_NOTULA_RAPAT);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(0.9);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleExportDocx = async () => {
    try {
      setIsExporting(true);
      if (mode === 'apel') {
        await exportLaporanApelToDocx(apelData);
        showToast('Dokumen Word (.docx) Laporan Apel berhasil diunduh!');
      } else {
        await exportNotulaRapatToDocx(notulaData);
        showToast('Dokumen Word (.docx) Notula Rapat berhasil diunduh!');
      }
    } catch (err) {
      console.error('Export error:', err);
      showToast('Gagal mengunduh dokumen. Silakan periksa data input.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleLoadSampleApel = () => {
    setApelData({ ...SAMPLE_LAPORAN_APEL_PDF });
    showToast('Data contoh sesuai lampiran PDF (26 Oktober 2026) dimuat.');
  };

  const handleLoadSampleNotula = () => {
    setNotulaData({ ...SAMPLE_NOTULA_RAPAT });
    showToast('Data contoh Notula Rapat Koordinasi berhasil dimuat.');
  };

  const handleResetToday = () => {
    if (mode === 'apel') {
      const today = getDefaultLaporanApelToday();
      setApelData(today);
      showToast('Formulir diatur ke tanggal hari ini.');
    } else {
      setNotulaData({
        ...SAMPLE_NOTULA_RAPAT,
        tanggal: getTodayIso(),
      });
      showToast('Formulir notula diatur ke hari ini.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-top duration-200 no-print">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner">
              <FileCheck2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide text-white">
                  SISTEM DOKUMEN KEDINASAN
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold bg-blue-900 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
                  Resmi RI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Laporan Apel &amp; Notula Rapat &bull; Ekspor Word (.docx) &amp; PDF Standar A4
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handlePrintPdf}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 shadow-sm transition"
              title="Cetak atau simpan dokumen ke file PDF"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Cetak / Simpan PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportDocx}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 rounded-lg shadow-md transition"
              title="Unduh dokumen dalam format Microsoft Word (.docx)"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Memproses...' : 'Download Word (.DOCX)'}</span>
            </button>
          </div>
        </div>

        {/* Sub-header / Mode Switcher Tabs */}
        <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setMode('apel')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
                  mode === 'apel'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Format Laporan Kehadiran Apel (Sesuai Lampiran)</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('notula')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
                  mode === 'notula'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Format Notula Rapat Kedinasan</span>
              </button>
            </div>

            {/* Quick helper controls */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {mode === 'apel' && (
                <button
                  type="button"
                  onClick={handleLoadSampleApel}
                  className="flex items-center gap-1.5 text-blue-300 hover:text-white px-2.5 py-1 rounded bg-blue-950/80 border border-blue-800/80 transition"
                  title="Muat contoh rekonsiliasi 17 hadir / 8 absen sesuai dokumen lampiran"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden md:inline">Contoh Lampiran (26 Okt)</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleResetToday}
                className="flex items-center gap-1 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Hari Ini</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-center gap-2 no-print">
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg ${
            mobileTab === 'form'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Formulir Input</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg ${
            mobileTab === 'preview'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Pratinjau Kertas A4</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <main className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Form Editor Panel */}
        <section
          id="form-panel"
          className={`w-full lg:w-[48%] xl:w-[45%] space-y-4 ${
            mobileTab === 'preview' ? 'hidden lg:block' : 'block'
          } no-print`}
        >
          {mode === 'apel' ? (
            <FormApel
              data={apelData}
              onChange={setApelData}
              onLoadSample={handleLoadSampleApel}
            />
          ) : (
            <FormNotula
              data={notulaData}
              onChange={setNotulaData}
              onLoadSample={handleLoadSampleNotula}
            />
          )}
        </section>

        {/* Right Column: Live A4 Document Preview Panel */}
        <section
          id="preview-container"
          className={`w-full lg:w-[52%] xl:w-[55%] sticky top-24 ${
            mobileTab === 'form' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Preview Toolbar */}
          <div className="bg-slate-800 text-slate-300 rounded-t-xl px-4 py-2.5 flex items-center justify-between border-b border-slate-700 shadow-sm no-print">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-white">
                Pratinjau Kertas A4 (Real-time Live Preview)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.5, prev - 0.1))}
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition"
                title="Perkecil Pratinjau"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(1.4, prev + 0.1))}
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition"
                title="Perbesar Pratinjau"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(0.9)}
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition ml-1"
                title="Reset Ukuran"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scrollable Canvas Area */}
          <div className="bg-slate-300/80 rounded-b-xl p-4 sm:p-6 overflow-auto max-h-[calc(100vh-140px)] flex justify-center border border-slate-300 shadow-inner">
            <DocumentPreview
              mode={mode}
              apelData={apelData}
              notulaData={notulaData}
              scale={zoomScale}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
