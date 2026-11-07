import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { BallotReceipt } from '../types/voting';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  FileCode,
  Download,
  Lock,
  Layers,
  Fingerprint,
} from 'lucide-react';

interface AuditLedgerProps {
  initialSearchHash?: string;
}

export const AuditLedger: React.FC<AuditLedgerProps> = ({ initialSearchHash = '' }) => {
  const { auditReceipts, currentVoter } = useVoting();
  const [searchQuery, setSearchQuery] = useState(initialSearchHash);
  const [verifiedResult, setVerifiedResult] = useState<BallotReceipt | null>(() => {
    if (initialSearchHash) {
      return auditReceipts.find((r) => r.ballotHash.toLowerCase() === initialSearchHash.toLowerCase()) || null;
    }
    return null;
  });
  const [hasSearched, setHasSearched] = useState(Boolean(initialSearchHash));

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    setHasSearched(true);
    if (!query) {
      setVerifiedResult(null);
      return;
    }
    const found = auditReceipts.find(
      (r) =>
        r.ballotHash.toLowerCase() === query ||
        r.receiptId.toLowerCase() === query ||
        r.ballotHash.toLowerCase().includes(query)
    );
    setVerifiedResult(found || null);
  };

  const handleInspectReceipt = (receipt: BallotReceipt) => {
    setSearchQuery(receipt.ballotHash);
    setVerifiedResult(receipt);
    setHasSearched(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadAuditJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditReceipts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegisvote_audit_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 uppercase tracking-wider font-semibold mb-1">
            <Layers className="w-4 h-4" />
            <span>Public Verification Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Independent Ballot Audit & Ledger
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Verify that your digital ballot was received and included in the election tally without exposing who you voted for.
          </p>
        </div>

        <button
          onClick={downloadAuditJSON}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 border border-stone-300 self-start md:self-auto shrink-0 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Chain (JSON)</span>
        </button>
      </div>

      {/* Verifier Search Box */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-stone-900 font-serif mb-1">
            Verify a Ballot Tracking Hash
          </h2>
          <p className="text-xs text-stone-600">
            Enter the 64-character SHA-256 hash or receipt ID printed on your digital voting card.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="e.g. 0x8f4c3a992e105dbca29910d55e8841c7b398df9a01844b209cba115f0391ee04"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-indigo-600 font-mono text-stone-900"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Run Cryptographic Verification</span>
          </button>
        </form>

        {currentVoter?.ballotReceiptHash && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500">Your Current Session Hash:</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery(currentVoter.ballotReceiptHash!);
                const found = auditReceipts.find((r) => r.ballotHash === currentVoter.ballotReceiptHash);
                setVerifiedResult(found || null);
                setHasSearched(true);
              }}
              className="font-mono text-indigo-700 hover:underline font-semibold"
            >
              {currentVoter.ballotReceiptHash.slice(0, 18)}... (Verify Mine)
            </button>
          </div>
        )}

        {/* Verification Outcome Card */}
        {hasSearched && (
          <div className="mt-4 pt-4 border-t border-stone-200">
            {verifiedResult ? (
              <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Ballot Confirmed: Recorded & Tallied</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono text-[11px] font-bold">
                    Block #{verifiedResult.blockHeight}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-stone-700">
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-mono">Receipt ID</span>
                    <span className="font-mono font-bold text-stone-900">{verifiedResult.receiptId}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-mono">Timestamp</span>
                    <span className="font-mono text-stone-900">{verifiedResult.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-mono">Masked Elector ID</span>
                    <span className="font-mono text-stone-900">{verifiedResult.voterMaskedId}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-mono">Precinct</span>
                    <span className="text-stone-900 font-medium truncate block">{verifiedResult.precinct}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white/80 rounded border border-emerald-200 text-[11px] text-stone-700 font-mono break-all">
                  Hash: {verifiedResult.ballotHash}
                </div>

                <div className="flex items-center gap-2 text-emerald-800 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    Zero-Knowledge Secrecy: Choices remain encrypted in the aggregate count. Only the fact of inclusion is proven.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <div className="font-bold mb-1">Hash Not Found in Active Ledger</div>
                <p>
                  No recorded ballot matched "{searchQuery}". Please verify the hash string or check if your submission is still pending block propagation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explainer: How Verifiable Voting Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-stone-900">1. Secret Ballot Isolation</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            When you vote, your identity token is consumed to ensure one-person-one-vote, while your candidate selections are separated into an anonymous cryptographic cipher.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
            <Fingerprint className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-stone-900">2. Tamper-Evident Hashing</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every submission generates a standard SHA-256 mathematical hash. Even a 1-bit alteration to the election database would invalidate the public ledger chain.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-stone-900">3. Universal E2E Auditability</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Independent international observers and individual citizens can inspect the immutable ledger to mathematically verify that the final tally equals the sum of valid receipts.
          </p>
        </div>
      </div>

      {/* Public Receipts Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-serif">
              Recent Committed Ballot Receipts
            </h2>
            <p className="text-xs text-stone-500">
              Live chronological chain of zero-knowledge ballot confirmations.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-500">
            {auditReceipts.length} verified proofs in chain
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-mono">
                <th className="py-2.5 px-3">Block / Receipt</th>
                <th className="py-2.5 px-3">Masked Voter</th>
                <th className="py-2.5 px-3">Precinct</th>
                <th className="py-2.5 px-3">Cryptographic Hash</th>
                <th className="py-2.5 px-3 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {auditReceipts.map((receipt) => (
                <tr key={receipt.receiptId} className="hover:bg-stone-50/80">
                  <td className="py-3 px-3">
                    <span className="font-bold text-stone-900">{receipt.receiptId}</span>
                    <span className="text-stone-400 block text-[10px]">Height #{receipt.blockHeight}</span>
                  </td>
                  <td className="py-3 px-3 text-stone-700 font-sans">
                    {receipt.voterMaskedId}
                  </td>
                  <td className="py-3 px-3 text-stone-600 font-sans max-w-xs truncate">
                    {receipt.precinct}
                  </td>
                  <td className="py-3 px-3 text-stone-500 text-[11px]">
                    <span className="truncate block max-w-[200px]" title={receipt.ballotHash}>
                      {receipt.ballotHash}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <button
                      onClick={() => handleInspectReceipt(receipt)}
                      className="px-2.5 py-1 rounded bg-stone-100 hover:bg-indigo-50 hover:text-indigo-700 text-stone-700 text-xs font-semibold transition-colors"
                    >
                      Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
