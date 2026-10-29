import React, { useState } from 'react';
import {
  Calendar,
  PenTool,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { NotulaRapatData, DokumentasiFoto } from '../types';
import { formatIndonesianDate, getTodayIso } from '../utils/dateHelper';
import { SAMPLE_NOTULA_RAPAT } from '../data/sampleData';
import { SignaturePadModal } from './SignaturePadModal';

interface FormNotulaProps {
  data: NotulaRapatData;
  onChange: (data: NotulaRapatData) => void;
  onLoadSample: () => void;
}

export const FormNotula: React.FC<FormNotulaProps> = ({
  data,
  onChange,
  onLoadSample,
}) => {
  const [activeSigField, setActiveSigField] = useState<'pimpinan' | 'notulis' | null>(null);

  const updateField = <K extends keyof NotulaRapatData>(key: K, value: NotulaRapatData[K]) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      updateField('logoUrl', event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

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
          keterangan: 'Dokumentasi Pelaksanaan Rapat Kedinasan',
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
      {/* Banner / Info */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-emerald-900 text-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Format Notula Rapat Koordinasi Kedinasan
          </h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            Lengkap dengan Kop Surat Garis Ganda, Metadata Rapat, Risalah Uraian, dan Tanda Tangan.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadSample}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Muat Contoh Notula Rapat</span>
        </button>
      </div>

      {/* Bagian 1: Kop Surat & Instansi */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-2">
          1. Kop Surat &amp; Informasi Satuan Kerja
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Instansi Baris 1:
            </label>
            <input
              type="text"
              value={data.namaInstansiBaris1}
              onChange={(e) => updateField('namaInstansiBaris1', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Satuan Kerja:
            </label>
            <input
              type="text"
              value={data.namaSatker}
              onChange={(e) => updateField('namaSatker', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat, Telepon, Laman &amp; Surel:
            </label>
            <textarea
              rows={2}
              value={data.alamatKontak}
              onChange={(e) => updateField('alamatKontak', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Ganti Logo Kop (PNG/JPG)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>
            {data.logoUrl && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                ✓ Logo terpasang
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bagian 2: Metadata Acara Rapat */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-2">
          2. Agenda &amp; Metadata Rapat
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Notula:
            </label>
            <input
              type="text"
              value={data.judulNotula}
              onChange={(e) => updateField('judulNotula', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sub-Judul / Keterangan Tambahan (Opsional):
            </label>
            <input
              type="text"
              value={data.subJudul || ''}
              onChange={(e) => updateField('subJudul', e.target.value)}
              placeholder="Contoh: EVALUASI CAPAIAN KINERJA"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hari / Tanggal Rapat:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={data.tanggal}
                  onChange={(e) => updateField('tanggal', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => updateField('tanggal', getTodayIso())}
                  className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap"
                >
                  Hari Ini
                </button>
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {formatIndonesianDate(data.tanggal, true)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waktu Pelaksanaan:
              </label>
              <input
                type="text"
                value={data.waktu}
                onChange={(e) => updateField('waktu', e.target.value)}
                placeholder="08.00 s.d. 09.30 WIB"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tempat Pelaksanaan:
            </label>
            <input
              type="text"
              value={data.tempat}
              onChange={(e) => updateField('tempat', e.target.value)}
              placeholder="Zoom Cloud Meeting / Ruang Rapat Lt. 5"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Peserta Rapat:
            </label>
            <input
              type="text"
              value={data.peserta}
              onChange={(e) => updateField('peserta', e.target.value)}
              placeholder="Inspektur Wilayah IV, Auditor, dan Tata Usaha"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Acara / Agenda:
            </label>
            <input
              type="text"
              value={data.acara}
              onChange={(e) => updateField('acara', e.target.value)}
              placeholder="Rapat Koordinasi Mingguan..."
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* Bagian 3: Uraian Jalannya Rapat */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-2">
          3. Uraian Jalannya Rapat &amp; Arahan Pimpinan
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              A. Pembukaan:
            </label>
            <textarea
              rows={2}
              value={data.pembukaan}
              onChange={(e) => updateField('pembukaan', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              B. Arahan Pimpinan Rapat:
            </label>
            <textarea
              rows={4}
              value={data.arahanPimpinan}
              onChange={(e) => updateField('arahanPimpinan', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              C. Pembahasan &amp; Masukan Peserta:
            </label>
            <textarea
              rows={4}
              value={data.pembahasan}
              onChange={(e) => updateField('pembahasan', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              D. Kesimpulan &amp; Rencana Tindak Lanjut:
            </label>
            <textarea
              rows={3}
              value={data.kesimpulanTindakLanjut}
              onChange={(e) => updateField('kesimpulanTindakLanjut', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              E. Penutup:
            </label>
            <textarea
              rows={2}
              value={data.penutup}
              onChange={(e) => updateField('penutup', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bagian 4: Penandatangan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-2">
          4. Penandatangan (Pimpinan Rapat &amp; Notulis)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pimpinan Rapat */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-800">Pimpinan Rapat (Kolom Kiri)</span>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Jabatan:</label>
              <input
                type="text"
                value={data.pimpinanRapat.jabatan}
                onChange={(e) =>
                  updateField('pimpinanRapat', { ...data.pimpinanRapat, jabatan: e.target.value })
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
                value={data.pimpinanRapat.nama}
                onChange={(e) =>
                  updateField('pimpinanRapat', { ...data.pimpinanRapat, nama: e.target.value })
                }
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">NIP:</label>
              <input
                type="text"
                value={data.pimpinanRapat.nip}
                onChange={(e) =>
                  updateField('pimpinanRapat', { ...data.pimpinanRapat, nip: e.target.value })
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
                  onClick={() => setActiveSigField('pimpinan')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-400 rounded-lg text-xs font-medium text-slate-700 shadow-sm transition"
                >
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  <span>{data.pimpinanRapat.signatureImage ? 'Ubah TTD' : 'Buat / Unggah TTD'}</span>
                </button>
                {data.pimpinanRapat.signatureImage && (
                  <button
                    type="button"
                    onClick={() =>
                      updateField('pimpinanRapat', {
                        ...data.pimpinanRapat,
                        signatureImage: undefined,
                      })
                    }
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Hapus
                  </button>
                )}
              </div>
              {data.pimpinanRapat.signatureImage && (
                <div className="mt-2 p-1 bg-white border border-slate-200 rounded max-w-[130px] h-14 flex items-center justify-center">
                  <img
                    src={data.pimpinanRapat.signatureImage}
                    alt="Preview TTD"
                    className="max-h-12 object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notulis */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-800">Notulis (Kolom Kanan)</span>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                Kota Tanda Tangan:
              </label>
              <input
                type="text"
                value={data.kotaTtd}
                onChange={(e) => updateField('kotaTtd', e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Jabatan:</label>
              <input
                type="text"
                value={data.notulis.jabatan}
                onChange={(e) =>
                  updateField('notulis', { ...data.notulis, jabatan: e.target.value })
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
                value={data.notulis.nama}
                onChange={(e) =>
                  updateField('notulis', { ...data.notulis, nama: e.target.value })
                }
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">NIP:</label>
              <input
                type="text"
                value={data.notulis.nip}
                onChange={(e) =>
                  updateField('notulis', { ...data.notulis, nip: e.target.value })
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
                  onClick={() => setActiveSigField('notulis')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-400 rounded-lg text-xs font-medium text-slate-700 shadow-sm transition"
                >
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  <span>{data.notulis.signatureImage ? 'Ubah TTD' : 'Buat / Unggah TTD'}</span>
                </button>
                {data.notulis.signatureImage && (
                  <button
                    type="button"
                    onClick={() =>
                      updateField('notulis', {
                        ...data.notulis,
                        signatureImage: undefined,
                      })
                    }
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Hapus
                  </button>
                )}
              </div>
              {data.notulis.signatureImage && (
                <div className="mt-2 p-1 bg-white border border-slate-200 rounded max-w-[130px] h-14 flex items-center justify-center">
                  <img
                    src={data.notulis.signatureImage}
                    alt="Preview TTD"
                    className="max-h-12 object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bagian 5: Dokumentasi Rapat */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              5. Dokumentasi Foto Rapat
            </h3>
            <p className="text-xs text-slate-500">
              Unggah tangkapan layar Zoom atau foto ruangan rapat
            </p>
          </div>
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer transition">
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
            Belum ada dokumentasi rapat.
          </div>
        )}
      </div>

      {/* Signature Pad Modal */}
      <SignaturePadModal
        isOpen={activeSigField !== null}
        title={
          activeSigField === 'pimpinan'
            ? 'Tanda Tangan Pimpinan Rapat'
            : 'Tanda Tangan Notulis'
        }
        currentSignature={
          activeSigField === 'pimpinan'
            ? data.pimpinanRapat.signatureImage
            : data.notulis.signatureImage
        }
        onClose={() => setActiveSigField(null)}
        onSave={(dataUrl) => {
          if (activeSigField === 'pimpinan') {
            updateField('pimpinanRapat', {
              ...data.pimpinanRapat,
              signatureImage: dataUrl,
            });
          } else if (activeSigField === 'notulis') {
            updateField('notulis', {
              ...data.notulis,
              signatureImage: dataUrl,
            });
          }
        }}
      />
    </div>
  );
};
