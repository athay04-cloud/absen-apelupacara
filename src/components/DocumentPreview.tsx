import React from 'react';
import { LaporanApelData, NotulaRapatData, DocumentMode } from '../types';
import { KopSurat } from './KopSurat';
import {
  formatFormalApelHeader,
  formatIndonesianDate,
  formatSignatureDate,
  getDayNameIndo,
} from '../utils/dateHelper';

interface DocumentPreviewProps {
  mode: DocumentMode;
  apelData: LaporanApelData;
  notulaData: NotulaRapatData;
  scale?: number;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  mode,
  apelData,
  notulaData,
  scale = 1,
}) => {
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
      }}
      className="transition-transform duration-150"
    >
      {/* A4 Paper Container */}
      <div
        id="printable-document"
        className="bg-white text-black shadow-2xl mx-auto font-sans print:shadow-none print:m-0"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '25mm 20mm 20mm 25mm', // Margins: Top 2.5cm, Right 2.0cm, Bottom 2.0cm, Left 2.5cm
          boxSizing: 'border-box',
          fontSize: '11pt',
          lineHeight: '1.4',
        }}
      >
        {mode === 'apel' ? (
          <LaporanApelPreview data={apelData} />
        ) : (
          <NotulaRapatPreview data={notulaData} />
        )}
      </div>
    </div>
  );
};

// ==========================================
// PREVIEW LAPORAN KEHADIRAN APEL (PDF Match)
// ==========================================
const LaporanApelPreview: React.FC<{ data: LaporanApelData }> = ({ data }) => {
  const formalDateHeader = formatFormalApelHeader(data.jenisApel, data.tanggal);
  const defaultPenutup = `Demikian laporan kehadiran ASN ${data.pokja || 'POKJA SDM'} pada ${data.jenisApel || 'Apel Pagi'} hari ${getDayNameIndo(data.tanggal)}, tanggal ${formatIndonesianDate(data.tanggal, false)} ini kami susun dengan sebenar-benarnya sebagai bentuk pertanggungjawaban atas pelaksanaan kegiatan. Laporan ini dibuat sebelum pukul ${data.jamBatasLaporan || '10.00 pagi'} sesuai dengan ketentuan yang berlaku. Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.`;
  const penutupText = data.kalimatPenutup.trim() ? data.kalimatPenutup : defaultPenutup;

  return (
    <div className="text-black space-y-4">
      {/* Optional Kop Surat */}
      {data.tampilkanKop && (
        <KopSurat
          namaInstansiBaris1="KEMENTERIAN HUKUM REPUBLIK INDONESIA"
          namaSatker={data.satuanKerja}
        />
      )}

      {/* Header Dokumen (Centered, Bold) */}
      <div className="text-center font-bold tracking-tight mb-4">
        <h1 className="text-[12.5pt] uppercase leading-tight">
          {data.judulBaris1 || 'SURAT KETERANGAN'}
        </h1>
        <h2 className="text-[12pt] uppercase leading-tight mt-0.5">
          {data.judulBaris2 || 'LAPORAN KEHADIRAN ASN ITWIL IV'}
        </h2>
        <h2 className="text-[12pt] uppercase leading-tight mt-0.5">
          {data.satuanKerja || 'INSPEKTORAT JENDERAL KEMENTERIAN HUKUM'}
        </h2>
        <h3 className="text-[11.5pt] uppercase leading-tight mt-1">
          {formalDateHeader}
        </h3>
      </div>

      {/* Bagian I: REKAPITULASI KEHADIRAN APEL */}
      <div className="space-y-1.5 pt-1">
        <h3 className="font-bold text-[11pt]">I. REKAPITULASI KEHADIRAN APEL</h3>

        {/* Tabel Rekapitulasi */}
        <table className="w-full border-collapse border border-black text-center text-[10.5pt]">
          <thead>
            <tr className="font-bold">
              <th rowSpan={2} className="border border-black px-2 py-1.5 align-middle w-[14%]">
                Jumlah<br />ASN
              </th>
              <th rowSpan={2} className="border border-black px-2 py-1.5 align-middle w-[13%]">
                Hadir
              </th>
              <th colSpan={4} className="border border-black px-2 py-1 align-middle">
                Tidak Hadir Karena:
              </th>
              <th rowSpan={2} className="border border-black px-2 py-1.5 align-middle w-[26%]">
                Keterangan
              </th>
            </tr>
            <tr className="font-bold">
              <th className="border border-black px-1.5 py-1 w-[11%]">Sakit</th>
              <th className="border border-black px-1.5 py-1 w-[11%]">Cuti</th>
              <th className="border border-black px-1.5 py-1 w-[13%]">
                Dinas<br />Luar
              </th>
              <th className="border border-black px-1.5 py-1 w-[12%]">Lain-Lain</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-10 text-center font-medium">
              <td className="border border-black px-2 py-1.5">{data.rekap.jumlahAsn}</td>
              <td className="border border-black px-2 py-1.5">{data.rekap.hadir}</td>
              <td className="border border-black px-2 py-1.5">{data.rekap.sakit}</td>
              <td className="border border-black px-2 py-1.5">{data.rekap.cuti}</td>
              <td className="border border-black px-2 py-1.5">{data.rekap.dinasLuar}</td>
              <td className="border border-black px-2 py-1.5">{data.rekap.lainLain}</td>
              <td className="border border-black px-2 py-1.5 uppercase font-medium text-[9.5pt] leading-tight">
                {data.rekap.keterangan || '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bagian II: DAFTAR ASN YANG TIDAK HADIR APEL */}
      <div className="space-y-1.5 pt-2">
        <h3 className="font-bold text-[11pt]">II. DAFTAR ASN YANG TIDAK HADIR APEL</h3>

        <table className="w-full border-collapse border border-black text-[10pt]">
          <thead>
            <tr className="font-bold text-center">
              <th className="border border-black px-2 py-1.5 w-[6%]">No</th>
              <th className="border border-black px-2 py-1.5 w-[25%]">NIP</th>
              <th className="border border-black px-2 py-1.5 w-[28%]">NAMA</th>
              <th className="border border-black px-2 py-1.5 w-[19%]">JABATAN</th>
              <th className="border border-black px-2 py-1.5 w-[22%]">
                ALASAN<br />KETIDAKHADIRAN
              </th>
            </tr>
          </thead>
          <tbody>
            {data.daftarTidakHadir.length === 0 ? (
              <tr>
                <td colSpan={5} className="border border-black px-3 py-3 text-center italic text-gray-500">
                  Nihil (Seluruh ASN hadir mengikuti apel)
                </td>
              </tr>
            ) : (
              data.daftarTidakHadir.map((asn, idx) => (
                <tr key={asn.id || idx} className="align-middle">
                  <td className="border border-black px-1.5 py-1.5 text-center">{idx + 1}.</td>
                  <td className="border border-black px-2 py-1.5 text-center font-mono text-[9pt]">
                    {asn.nip}
                  </td>
                  <td className="border border-black px-2 py-1.5 font-medium uppercase text-[9pt] leading-snug">
                    {asn.nama}
                  </td>
                  <td className="border border-black px-2 py-1.5 uppercase text-[9pt] leading-snug">
                    {asn.jabatan}
                  </td>
                  <td className="border border-black px-2 py-1.5 uppercase text-center text-[9pt] leading-snug">
                    {asn.alasan}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Kalimat Penutup */}
      <div className="pt-2">
        <p className="text-justify text-[10.5pt] indent-8 leading-relaxed font-normal">
          {penutupText}
        </p>
      </div>

      {/* Bagian Tanda Tangan 2 Kolom (Borderless) */}
      <div className="pt-4 page-break-inside-avoid">
        <table className="w-full border-collapse border-none text-[10.5pt]">
          <tbody>
            <tr className="align-top">
              {/* Kolom Kiri: Mengetahui / Pimpinan */}
              <td className="w-1/2 pr-4 border-none">
                <p className="font-normal">{data.pejabatMengetahui.jabatan || 'Mengetahui,'}</p>
                {/* Signature Preview */}
                <div className="h-18 flex items-center my-1">
                  {data.pejabatMengetahui.signatureImage ? (
                    <img
                      src={data.pejabatMengetahui.signatureImage}
                      alt="Tanda Tangan Pejabat"
                      className="max-h-16 max-w-[150px] object-contain"
                    />
                  ) : (
                    <div className="h-16"></div>
                  )}
                </div>
                <p className="font-bold underline leading-tight">
                  {data.pejabatMengetahui.nama}
                </p>
                <p className="text-[10pt] text-gray-900 mt-0.5">
                  NIP. {data.pejabatMengetahui.nip}
                </p>
              </td>

              {/* Kolom Kanan: Tempat, Tanggal & Petugas */}
              <td className="w-1/2 pl-4 border-none">
                <p className="font-normal">
                  {formatSignatureDate(data.kotaTtd, data.tanggal)}
                </p>
                <p className="font-normal">{data.petugasPembuat.jabatan || 'Pembuat Laporan,'}</p>
                {/* Signature Preview */}
                <div className="h-18 flex items-center my-1">
                  {data.petugasPembuat.signatureImage ? (
                    <img
                      src={data.petugasPembuat.signatureImage}
                      alt="Tanda Tangan Petugas"
                      className="max-h-16 max-w-[150px] object-contain"
                    />
                  ) : (
                    <div className="h-16"></div>
                  )}
                </div>
                <p className="font-bold underline leading-tight">
                  {data.petugasPembuat.nama}
                </p>
                <p className="text-[10pt] text-gray-900 mt-0.5">
                  NIP. {data.petugasPembuat.nip}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Lampiran Dokumentasi Kegiatan (jika ada) */}
      {data.dokumentasi.length > 0 && (
        <div className="pt-8 border-t border-dashed border-gray-300 page-break-before-always">
          <h4 className="font-bold text-center uppercase tracking-wide text-[11pt] mb-4">
            LAMPIRAN DOKUMENTASI KEGIATAN APEL
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {data.dokumentasi.map((foto, i) => (
              <div key={foto.id || i} className="border border-black p-2 text-center bg-gray-50/50">
                <img
                  src={foto.dataUrl}
                  alt={`Dokumentasi ${i + 1}`}
                  className="w-full h-40 object-cover border border-gray-200"
                />
                <p className="text-[9pt] italic mt-1.5 text-gray-700">
                  {foto.keterangan || `Foto Kegiatan Apel #${i + 1}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// PREVIEW NOTULA RAPAT KEDINASAN
// ==========================================
const NotulaRapatPreview: React.FC<{ data: NotulaRapatData }> = ({ data }) => {
  return (
    <div className="text-black space-y-4">
      {/* Kop Surat Resmi */}
      <KopSurat
        namaInstansiBaris1={data.namaInstansiBaris1}
        namaSatker={data.namaSatker}
        alamatKontak={data.alamatKontak}
        logoUrl={data.logoUrl}
      />

      {/* Judul Notula */}
      <div className="text-center font-bold tracking-tight mb-4">
        <h1 className="text-[13pt] uppercase underline leading-tight">
          {data.judulNotula || 'NOTULA RAPAT'}
        </h1>
        {data.subJudul && (
          <h2 className="text-[11pt] uppercase leading-tight mt-1 text-gray-800">
            {data.subJudul}
          </h2>
        )}
      </div>

      {/* Tabel Metadata Rapat (Borderless) */}
      <table className="w-full border-collapse border-none text-[10.5pt] mb-4">
        <tbody>
          <tr>
            <td className="w-[24%] py-0.5 font-bold border-none">Hari / Tanggal</td>
            <td className="w-[3%] py-0.5 font-bold border-none text-center">:</td>
            <td className="w-[73%] py-0.5 border-none font-normal">
              {formatIndonesianDate(data.tanggal, true)}
            </td>
          </tr>
          <tr>
            <td className="py-0.5 font-bold border-none">Waktu Pelaksanaan</td>
            <td className="py-0.5 font-bold border-none text-center">:</td>
            <td className="py-0.5 border-none">{data.waktu || '-'}</td>
          </tr>
          <tr>
            <td className="py-0.5 font-bold border-none">Tempat</td>
            <td className="py-0.5 font-bold border-none text-center">:</td>
            <td className="py-0.5 border-none">{data.tempat || '-'}</td>
          </tr>
          <tr>
            <td className="py-0.5 font-bold border-none">Peserta Rapat</td>
            <td className="py-0.5 font-bold border-none text-center">:</td>
            <td className="py-0.5 border-none">{data.peserta || '-'}</td>
          </tr>
          <tr>
            <td className="py-0.5 font-bold border-none align-top">Acara / Agenda</td>
            <td className="py-0.5 font-bold border-none text-center align-top">:</td>
            <td className="py-0.5 border-none align-top">{data.acara || '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* Uraian Notula */}
      <div className="space-y-3 pt-2 text-[10.5pt]">
        <h3 className="font-bold uppercase tracking-tight text-[11pt] border-b border-black pb-1">
          URAIAN JALANNYA RAPAT
        </h3>

        {/* Pembukaan */}
        {data.pembukaan && (
          <div className="space-y-1">
            <h4 className="font-bold">A. Pembukaan:</h4>
            <p className="text-justify indent-6 leading-relaxed whitespace-pre-line">
              {data.pembukaan}
            </p>
          </div>
        )}

        {/* Arahan Pimpinan */}
        {data.arahanPimpinan && (
          <div className="space-y-1">
            <h4 className="font-bold">B. Arahan Pimpinan Rapat:</h4>
            <p className="text-justify indent-6 leading-relaxed whitespace-pre-line">
              {data.arahanPimpinan}
            </p>
          </div>
        )}

        {/* Pembahasan */}
        {data.pembahasan && (
          <div className="space-y-1">
            <h4 className="font-bold">C. Pembahasan &amp; Masukan Peserta:</h4>
            <p className="text-justify indent-6 leading-relaxed whitespace-pre-line">
              {data.pembahasan}
            </p>
          </div>
        )}

        {/* Kesimpulan & Tindak Lanjut */}
        {data.kesimpulanTindakLanjut && (
          <div className="space-y-1">
            <h4 className="font-bold">D. Kesimpulan &amp; Rencana Tindak Lanjut:</h4>
            <p className="text-justify indent-6 leading-relaxed whitespace-pre-line">
              {data.kesimpulanTindakLanjut}
            </p>
          </div>
        )}

        {/* Penutup */}
        {data.penutup && (
          <div className="space-y-1">
            <h4 className="font-bold">E. Penutup:</h4>
            <p className="text-justify indent-6 leading-relaxed whitespace-pre-line">
              {data.penutup}
            </p>
          </div>
        )}
      </div>

      {/* Tanda Tangan 2 Kolom */}
      <div className="pt-6 page-break-inside-avoid">
        <table className="w-full border-collapse border-none text-[10.5pt]">
          <tbody>
            <tr className="align-top">
              {/* Pimpinan Rapat */}
              <td className="w-1/2 pr-4 border-none">
                <p className="font-normal">{data.pimpinanRapat.jabatan || 'Pimpinan Rapat,'}</p>
                <div className="h-18 flex items-center my-1">
                  {data.pimpinanRapat.signatureImage ? (
                    <img
                      src={data.pimpinanRapat.signatureImage}
                      alt="Tanda Tangan Pimpinan"
                      className="max-h-16 max-w-[150px] object-contain"
                    />
                  ) : (
                    <div className="h-16"></div>
                  )}
                </div>
                <p className="font-bold underline leading-tight">
                  {data.pimpinanRapat.nama}
                </p>
                <p className="text-[10pt] text-gray-900 mt-0.5">
                  NIP. {data.pimpinanRapat.nip}
                </p>
              </td>

              {/* Notulis */}
              <td className="w-1/2 pl-4 border-none">
                <p className="font-normal">
                  {formatSignatureDate(data.kotaTtd, data.tanggal)}
                </p>
                <p className="font-normal">{data.notulis.jabatan || 'Notulis Rapat,'}</p>
                <div className="h-18 flex items-center my-1">
                  {data.notulis.signatureImage ? (
                    <img
                      src={data.notulis.signatureImage}
                      alt="Tanda Tangan Notulis"
                      className="max-h-16 max-w-[150px] object-contain"
                    />
                  ) : (
                    <div className="h-16"></div>
                  )}
                </div>
                <p className="font-bold underline leading-tight">
                  {data.notulis.nama}
                </p>
                <p className="text-[10pt] text-gray-900 mt-0.5">
                  NIP. {data.notulis.nip}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Lampiran Foto Dokumentasi Notula */}
      {data.dokumentasi.length > 0 && (
        <div className="pt-8 border-t border-dashed border-gray-300 page-break-before-always">
          <h4 className="font-bold text-center uppercase tracking-wide text-[11pt] mb-4">
            LAMPIRAN DOKUMENTASI RAPAT
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {data.dokumentasi.map((foto, i) => (
              <div key={foto.id || i} className="border border-black p-2 text-center bg-gray-50/50">
                <img
                  src={foto.dataUrl}
                  alt={`Dokumentasi ${i + 1}`}
                  className="w-full h-40 object-cover border border-gray-200"
                />
                <p className="text-[9pt] italic mt-1.5 text-gray-700">
                  {foto.keterangan || `Dokumentasi Rapat #${i + 1}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
