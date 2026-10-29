import React, { useState } from 'react';
import { X, Users, Search, Copy, Check } from 'lucide-react';
import { MASTER_PEGAWAI_ITWIL_IV } from '../data/masterPegawaiItwilIV';

interface MasterPegawaiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasterPegawaiModal: React.FC<MasterPegawaiModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filtered = MASTER_PEGAWAI_ITWIL_IV.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nip.includes(searchTerm) ||
      p.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyAll = () => {
    const text = MASTER_PEGAWAI_ITWIL_IV.map(
      (p) => `${p.no}. ${p.nama} - ${p.nip} (${p.jabatan})`
    ).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Data Master Pegawai Inspektorat Wilayah IV
              </h3>
              <p className="text-xs text-slate-500">
                Total 25 Pegawai (Update Juni 2026 - Inspektorat Jenderal Kementerian Hukum)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, NIP, atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Semua Data Pegawai'}</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-2 border border-slate-200 text-center w-12">No</th>
                <th className="p-2 border border-slate-200">Nama &amp; NIP</th>
                <th className="p-2 border border-slate-200">Jabatan</th>
                <th className="p-2 border border-slate-200">Pangkat / Golongan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.no} className="hover:bg-blue-50/40 transition">
                  <td className="p-2 border border-slate-200 text-center font-bold text-slate-600">
                    {p.no}
                  </td>
                  <td className="p-2 border border-slate-200">
                    <p className="font-semibold text-slate-900">{p.nama}</p>
                    <p className="font-mono text-slate-500 text-[11px]">{p.nip}</p>
                  </td>
                  <td className="p-2 border border-slate-200 font-medium text-slate-800">
                    {p.jabatan}
                  </td>
                  <td className="p-2 border border-slate-200 text-slate-600">
                    {p.pangkatGol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
