import React from 'react';
import { LOGO_KEMENKUM_SVG } from '../data/sampleData';

interface KopSuratProps {
  namaInstansiBaris1?: string;
  namaSatker?: string;
  alamatKontak?: string;
  logoUrl?: string;
  className?: string;
}

export const KopSurat: React.FC<KopSuratProps> = ({
  namaInstansiBaris1 = 'KEMENTERIAN HUKUM REPUBLIK INDONESIA',
  namaSatker = 'INSPEKTORAT JENDERAL',
  alamatKontak = 'Jl. H.R. Rasuna Said Kav. X-6 No. 8, Kuningan, Jakarta Selatan | Telp: 021-5252975 | Laman: http://www.itjen.kemenkum.go.id | Surel: itjen@kemenkum.go.id',
  logoUrl = LOGO_KEMENKUM_SVG,
  className = '',
}) => {
  return (
    <div className={`w-full mb-6 ${className}`}>
      <div className="flex items-center gap-4 pb-3">
        {/* Logo */}
        <div className="w-20 h-20 shrink-0 flex items-center justify-center">
          <img
            src={logoUrl || LOGO_KEMENKUM_SVG}
            alt="Logo Instansi"
            className="w-18 h-18 object-contain"
          />
        </div>

        {/* Text */}
        <div className="flex-1 text-center font-serif">
          <h2 className="text-[15px] font-bold tracking-wider uppercase text-black leading-tight">
            {namaInstansiBaris1}
          </h2>
          <h1 className="text-[18px] font-extrabold tracking-wide uppercase text-black leading-tight mt-0.5">
            {namaSatker}
          </h1>
          <p className="text-[9.5px] text-gray-800 leading-snug mt-1 font-sans">
            {alamatKontak}
          </p>
        </div>
      </div>

      {/* Official Government Double Border (Garis Ganda Kop Surat) */}
      <div className="w-full">
        <div className="border-b-[3px] border-black"></div>
        <div className="border-b-[1px] border-black mt-[1.5px]"></div>
      </div>
    </div>
  );
};
