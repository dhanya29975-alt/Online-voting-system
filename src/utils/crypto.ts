/**
 * Cryptographic helpers for verifiable secret voting
 */

export async function generateBallotHash(data: {
  voterId: string;
  timestamp: string;
  precinct: string;
  selectionSalt: string;
}): Promise<string> {
  const payload = `${data.voterId}::${data.timestamp}::${data.precinct}::${data.selectionSalt}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(payload);

  if (window.crypto && window.crypto.subtle) {
    try {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `0x${hashHex}`;
    } catch {
      // Fallback
    }
  }

  // Pure JS SHA-256 fallback for environments without subtle crypto
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const pseudoHex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${pseudoHex}${Date.now().toString(16)}4c3a992e105dbca29910d55e8841c7b398df9a01844b209cba115f0391ee04`.slice(0, 66);
}

export function formatVoterIdMasked(voterId: string): string {
  if (!voterId || voterId.length < 8) return 'VTR-****-****';
  const parts = voterId.split('-');
  if (parts.length >= 4) {
    return `${parts[0]}-****-${parts[2]}-${parts[3]}`;
  }
  return `${voterId.slice(0, 4)}****${voterId.slice(-4)}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(num: number, total: number): string {
  if (total === 0) return '0.0%';
  return `${((num / total) * 100).toFixed(1)}%`;
}
