import { MASTER_PEGAWAI_ITWIL_IV, PegawaiMaster } from '../data/masterPegawaiItwilIV';

// Helper to clean and normalize a name for matching
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ') // remove punctuation
    .replace(/\b(sh|mh|s psi|se|cgre|dr|dra|drs|ak|ca|mm|m si|m kn|md|s kom)\b/g, '') // remove common degrees
    .replace(/\s+/g, ' ')
    .trim();
}

export interface MatchResult {
  pegawai: PegawaiMaster;
  hadir: boolean;
  matchedBy?: 'nip' | 'name' | 'manual';
  confidence?: 'exact' | 'partial';
}

export interface ReconciliationReport {
  totalPegawai: number;
  jumlahHadir: number;
  jumlahTidakHadir: number;
  hadirList: PegawaiMaster[];
  tidakHadirList: PegawaiMaster[];
  allResults: MatchResult[];
  unmatchedLines: string[];
}

/**
 * Match a raw pasted text (e.g. from WhatsApp, Zoom attendance, or Excel) against Master Pegawai
 */
export function matchAttendanceFromText(rawText: string): ReconciliationReport {
  const lines = rawText
    .split(/\r?\n|,|;/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const matchedSet = new Set<number>(); // master no
  const matchedMethod = new Map<number, { method: 'nip' | 'name'; confidence: 'exact' | 'partial' }>();
  const unmatched: string[] = [];

  // Check each master pegawai against the entire text and each line
  const normalizedFullText = normalizeText(rawText);

  for (const pegawai of MASTER_PEGAWAI_ITWIL_IV) {
    // 1. Match by NIP (Exact digits)
    if (rawText.includes(pegawai.nip)) {
      matchedSet.add(pegawai.no);
      matchedMethod.set(pegawai.no, { method: 'nip', confidence: 'exact' });
      continue;
    }

    // 2. Match by normalized full name
    const normName = normalizeText(pegawai.nama);
    if (normalizedFullText.includes(normName)) {
      matchedSet.add(pegawai.no);
      matchedMethod.set(pegawai.no, { method: 'name', confidence: 'exact' });
      continue;
    }

    // 3. Match by key name tokens (first + last name or distinctive surname)
    const tokens = normName.split(' ').filter((t) => t.length > 2);
    if (tokens.length >= 2) {
      // Check if both tokens exist in the text or one line contains both
      const token1 = tokens[0];
      const token2 = tokens[1];
      if (normalizedFullText.includes(token1) && normalizedFullText.includes(token2)) {
        matchedSet.add(pegawai.no);
        matchedMethod.set(pegawai.no, { method: 'name', confidence: 'partial' });
        continue;
      }
    } else if (tokens.length === 1) {
      if (normalizedFullText.includes(tokens[0])) {
        matchedSet.add(pegawai.no);
        matchedMethod.set(pegawai.no, { method: 'name', confidence: 'partial' });
        continue;
      }
    }
  }

  // Check unmatched lines that don't match any pegawai
  for (const line of lines) {
    const cleanLine = normalizeText(line);
    if (
      cleanLine.length < 3 ||
      cleanLine.includes('daftar hadir') ||
      cleanLine.includes('presensi') ||
      cleanLine.includes('apel') ||
      cleanLine.includes('itwil iv')
    ) {
      continue;
    }
    const matchesAny = MASTER_PEGAWAI_ITWIL_IV.some((p) => {
      const pNorm = normalizeText(p.nama);
      return line.includes(p.nip) || cleanLine.includes(pNorm) || pNorm.includes(cleanLine);
    });
    if (!matchesAny) {
      unmatched.push(line);
    }
  }

  const allResults: MatchResult[] = MASTER_PEGAWAI_ITWIL_IV.map((p) => {
    const isHadir = matchedSet.has(p.no);
    const meta = matchedMethod.get(p.no);
    return {
      pegawai: p,
      hadir: isHadir,
      matchedBy: meta?.method,
      confidence: meta?.confidence,
    };
  });

  const hadirList = allResults.filter((r) => r.hadir).map((r) => r.pegawai);
  const tidakHadirList = allResults.filter((r) => !r.hadir).map((r) => r.pegawai);

  return {
    totalPegawai: MASTER_PEGAWAI_ITWIL_IV.length,
    jumlahHadir: hadirList.length,
    jumlahTidakHadir: tidakHadirList.length,
    hadirList,
    tidakHadirList,
    allResults,
    unmatchedLines: unmatched,
  };
}

/**
 * Sample text representing 17 present employees from the PDF dated 26 October 2026.
 * The 8 absent employees were:
 * Helmy, Faisal, Henni Maria, Y. Aditya, Saadia Santi, Monica Ronauli, Syefardirta Fascanti, Syahrizal Lubis.
 */
export const SAMPLE_TEXT_PRESENSI_HADIR_26_OKT = `DAFTAR HADIR APEL PAGI ITWIL IV - SENIN, 26 OKTOBER 2026:
1. Bambang Setyabudi (196911281997031001)
2. Dwi Ari Wibowo
3. Fandyla Wahyu Sasongko
4. Niken Ayu Kusumaningpuri
5. Surya Narendra
6. Adi Agustina Girsang
7. Henni Noor Utami
8. Falentina Paramita Sari
9. Bara Dynata
10. Anasti Dwi Martantya K.
11. Bobby Novianto
12. Ivan Satria Nurrahman
13. Doni Aji Saputro
14. Naufal Enji Athaya
15. Vidi Marentra Eflar
16. Disti Oke viani
17. Irmi Juwianipa`;
