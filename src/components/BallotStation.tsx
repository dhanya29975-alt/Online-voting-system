import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { BALLOT_MEASURES } from '../data/electionData';
import { BallotSelection, BallotReceipt } from '../types/voting';
import {
  ShieldCheck,
  Check,
  Lock,
  FileCheck2,
  AlertCircle,
  Copy,
  Printer,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  Fingerprint,
  UserPlus,
  Edit2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BallotStationProps {
  onOpenAuth: () => void;
  onNavigateToAudit: (hash: string) => void;
  onNavigateToCandidates: (candidateId?: string) => void;
  onOpenCandidateManager?: (office?: 'presidential' | 'senate' | 'mayor', candidateId?: string) => void;
}

export const BallotStation: React.FC<BallotStationProps> = ({
  onOpenAuth,
  onNavigateToAudit,
  onNavigateToCandidates,
  onOpenCandidateManager,
}) => {
  const {
    currentVoter,
    castBallot,
    electionPhase,
    presidentialCandidates,
    senateCandidates,
    mayoralCandidates,
  } = useVoting();

  const [selections, setSelections] = useState<BallotSelection>({
    presidentialCandidateId: null,
    senateCandidateId: null,
    mayoralCandidateId: null,
    measureVotes: {},
  });

  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [issuedReceipt, setIssuedReceipt] = useState<BallotReceipt | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Measure vote handler
  const handleMeasureVote = (measureId: string, vote: 'yes' | 'no' | 'abstain') => {
    setSelections((prev) => ({
      ...prev,
      measureVotes: {
        ...prev.measureVotes,
        [measureId]: vote,
      },
    }));
  };

  const handleReview = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsReviewing(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const receipt = await castBallot(selections);
      setIssuedReceipt(receipt);
      setIsReviewing(false);

      // Trigger celebratory voter confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4338ca', '#0ea5e9', '#10b981', '#f59e0b'],
        });
      } catch {
        // Confetti fallback
      }
    } catch (err: any) {
      alert(err.message || 'Error casting ballot. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyHashToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // If user has already voted in this session or from storage
  if (currentVoter && currentVoter.hasVoted && (issuedReceipt || currentVoter.ballotReceiptHash)) {
    const activeHash = issuedReceipt?.ballotHash || currentVoter.ballotReceiptHash || '';
    const activeTimestamp = issuedReceipt?.timestamp || currentVoter.ballotTimestamp || '2026-11-05 06:14:22 UTC';
    const activeReceiptId = issuedReceipt?.receiptId || 'RCP-994101';

    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Success Banner */}
          <div className="bg-emerald-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-800 text-emerald-200 mb-4 ring-8 ring-emerald-800/40">
              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif mb-2 text-white">
              Official Ballot Successfully Submitted & Counted
            </h1>
            <p className="text-emerald-100 text-sm max-w-xl mx-auto">
              Your ballot has been cryptographically sealed and anonymously integrated into the official election tally. Your vote is secret, immutable, and verifiable.
            </p>
          </div>

          {/* Cryptographic Digital Receipt Card */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="border border-stone-200 rounded-xl bg-stone-50/60 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold block">
                    Digital Ballot Receipt
                  </span>
                  <span className="text-lg font-bold font-mono text-stone-900">
                    {activeReceiptId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    Verified in Public Ledger
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5 text-xs text-stone-700">
                <div>
                  <span className="text-stone-500 block mb-1">Voter Name</span>
                  <span className="font-semibold text-stone-900">{currentVoter.name}</span>
                </div>
                <div>
                  <span className="text-stone-500 block mb-1">Masked National Voter ID</span>
                  <span className="font-mono font-medium text-stone-900">
                    {currentVoter.nationalVoterId.slice(0, 4)}****{currentVoter.nationalVoterId.slice(-4)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block mb-1">Precinct / Jurisdiction</span>
                  <span className="font-medium text-stone-900">{currentVoter.jurisdiction}</span>
                </div>
                <div>
                  <span className="text-stone-500 block mb-1">Timestamp of Sealing</span>
                  <span className="font-mono text-stone-900">{activeTimestamp}</span>
                </div>
              </div>

              {/* SHA-256 Hash Display */}
              <div className="mt-2 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-indigo-700" />
                    Ballot Verification Hash (SHA-256)
                  </span>
                  <button
                    onClick={() => copyHashToClipboard(activeHash)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedHash ? 'Copied!' : 'Copy Hash'}
                  </button>
                </div>
                <div className="p-3 bg-stone-900 text-stone-200 font-mono text-xs rounded-lg break-all select-all border border-stone-800">
                  {activeHash}
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  This unique cryptographic hash confirms your ballot was recorded and counted without revealing your candidate choices to anyone. Keep this hash for your records.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                onClick={() => onNavigateToAudit(activeHash)}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Verify Ballot in Public Audit Ledger</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 border border-stone-300"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Voting Certificate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review screen before submission
  if (isReviewing && currentVoter) {
    const selectedPresident = presidentialCandidates.find(
      (c) => c.id === selections.presidentialCandidateId
    );
    const selectedSenate = senateCandidates.find(
      (c) => c.id === selections.senateCandidateId
    );
    const selectedMayor = mayoralCandidates.find(
      (c) => c.id === selections.mayoralCandidateId
    );

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <span className="text-xs uppercase font-mono tracking-wider text-indigo-700 block mb-1">
              Step 2 of 2 · Ballot Verification
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 font-serif">
              Review Your Ballot Selections
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Please double check all your selections before committing your cryptographic vote. Once submitted, your ballot cannot be altered.
            </p>
          </div>

          <div className="space-y-4">
            {/* Presidential */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Office: President & Vice President
              </span>
              {selectedPresident ? (
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-900 text-base">{selectedPresident.name}</div>
                    <div className="text-xs text-stone-600">Running Mate: {selectedPresident.runningMate} · {selectedPresident.party}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-800 text-xs font-semibold">
                    Selected
                  </span>
                </div>
              ) : (
                <div className="mt-1 text-sm text-amber-700 font-medium">No selection (Abstention)</div>
              )}
            </div>

            {/* Senate */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Office: Senate / Global Representative
              </span>
              {selectedSenate ? (
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-900 text-base">{selectedSenate.name}</div>
                    <div className="text-xs text-stone-600">{selectedSenate.party}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-800 text-xs font-semibold">
                    Selected
                  </span>
                </div>
              ) : (
                <div className="mt-1 text-sm text-stone-500">No selection (Abstention)</div>
              )}
            </div>

            {/* Mayor */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Office: Metropolitan Mayor
              </span>
              {selectedMayor ? (
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-900 text-base">{selectedMayor.name}</div>
                    <div className="text-xs text-stone-600">{selectedMayor.party}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-800 text-xs font-semibold">
                    Selected
                  </span>
                </div>
              ) : (
                <div className="mt-1 text-sm text-stone-500">No selection (Abstention)</div>
              )}
            </div>

            {/* Ballot Measures */}
            {BALLOT_MEASURES.map((measure) => {
              const vote = selections.measureVotes[measure.id] || 'abstain';
              return (
                <div key={measure.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                    {measure.code} · {measure.title}
                  </span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-stone-600 max-w-md truncate">{measure.summary}</span>
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                        vote === 'yes'
                          ? 'bg-emerald-100 text-emerald-800'
                          : vote === 'no'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      Vote: {vote}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cryptographic Assurance Notice */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-start gap-3">
            <Lock className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">End-to-End Cryptographic Secret Ballot Guarantee</span>
              When you click "Confirm & Submit Ballot", your client generates a SHA-256 zero-knowledge cryptographic signature. Your voter credential is consumed to prevent double voting, while your choices are permanently detached from your personal identity.
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <button
              onClick={() => setIsReviewing(false)}
              className="px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-stone-950 transition-colors"
            >
              ← Edit My Selections
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Sealing Cryptographic Ballot...' : 'Confirm & Cast Official Ballot'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl bg-stone-900 text-white overflow-hidden shadow-sm">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/civic_hero_banner_1793898742411.jpg"
            alt="Civic Assembly Hall"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 p-6 sm:p-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-300 uppercase tracking-widest mb-3">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>2026 Global General Election</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-serif text-white mb-3">
            Official Electronic Ballot Station
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed mb-6">
            Cast your democratic vote from anywhere in the world. Review candidate manifestos, weigh ballot initiatives, and submit an encrypted, verifiable ballot directly to the electoral registry.
          </p>

          {!currentVoter ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-2"
              >
                <span>Sign In with Voter ID & Mobile Number</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-stone-400">
                Overseas, diplomatic, military & domestic registered voters eligible
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-3 p-3 bg-stone-800/80 backdrop-blur-xs rounded-xl border border-stone-700 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              <div>
                <span className="text-stone-400 block">Authenticated Elector:</span>
                <span className="font-semibold text-white">
                  {currentVoter.name} ({currentVoter.jurisdiction})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ballot Instructions & Notice */}
      <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-600">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Mark your choices below. You can change your selections anytime before clicking "Review & Seal Ballot".
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCandidateManager?.('presidential')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Insert / Edit Candidates</span>
          </button>
          <button
            onClick={() => onNavigateToCandidates()}
            className="text-indigo-600 hover:text-indigo-800 font-semibold whitespace-nowrap flex items-center gap-1"
          >
            <span>Candidate Guide</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 1: PRESIDENTIAL & VICE PRESIDENTIAL RACE */}
      {/* ========================================================== */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold">
              Race 01 of 04 · Federal Executive
            </span>
            <h2 className="text-lg font-bold text-stone-900 font-serif">
              President & Vice President of the Republic
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenCandidateManager?.('presidential')}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              <span>+ Add / Rename Candidate</span>
            </button>
            <span className="text-xs text-stone-500 italic hidden sm:inline">Vote for not more than ONE slate</span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {presidentialCandidates.map((cand) => {
            const isSelected = selections.presidentialCandidateId === cand.id;
            return (
              <div
                key={cand.id}
                onClick={() => {
                  if (!currentVoter) {
                    onOpenAuth();
                    return;
                  }
                  setSelections((prev) => ({
                    ...prev,
                    presidentialCandidateId: cand.id,
                  }));
                }}
                className={`relative flex flex-col rounded-xl border-2 transition-all cursor-pointer p-4 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                {/* Image */}
                <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-stone-100 mb-3.5">
                  <img
                    src={cand.photoUrl}
                    alt={cand.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCandidateManager?.('presidential', cand.id);
                      }}
                      className="p-1 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-stone-900 shadow-xs border border-stone-200 transition-colors"
                      title="Edit this candidate name"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/90 border border-stone-300 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-xs font-semibold text-indigo-700 tracking-tight mb-0.5">
                    {cand.party}
                  </div>
                  <h3 className="font-bold text-base text-stone-900 leading-snug">
                    {cand.name}
                  </h3>
                  <div className="text-xs text-stone-500 mb-3">
                    Running Mate: <span className="text-stone-700 font-medium">{cand.runningMate}</span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-3 mb-3 leading-relaxed">
                    {cand.biography}
                  </p>

                  <div className="space-y-1 mb-4">
                    <span className="text-[11px] uppercase font-semibold text-stone-400 block">
                      Core Platform Stance:
                    </span>
                    <p className="text-xs text-stone-700 italic bg-stone-50 p-2 rounded border border-stone-100">
                      "{cand.stances.economy.slice(0, 95)}..."
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToCandidates(cand.id);
                    }}
                    className="text-xs text-stone-500 hover:text-stone-900 font-medium"
                  >
                    View Manifesto →
                  </button>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded ${
                      isSelected ? 'bg-indigo-600 text-white' : 'text-stone-500'
                    }`}
                  >
                    {isSelected ? 'Marked' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================== */}
      {/* SECTION 2: SENATE / PARLIAMENTARY SEAT */}
      {/* ========================================================== */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold">
              Race 02 of 04 · Legislative Assembly
            </span>
            <h2 className="text-lg font-bold text-stone-900 font-serif">
              Senate / Global Representative (Seat A)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenCandidateManager?.('senate')}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              <span>+ Add / Rename Candidate</span>
            </button>
            <span className="text-xs text-stone-500 italic hidden sm:inline">Vote for ONE representative</span>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {senateCandidates.map((cand) => {
            const isSelected = selections.senateCandidateId === cand.id;
            return (
              <div
                key={cand.id}
                onClick={() => {
                  if (!currentVoter) {
                    onOpenAuth();
                    return;
                  }
                  setSelections((prev) => ({
                    ...prev,
                    senateCandidateId: cand.id,
                  }));
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'border border-stone-300 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-sm text-stone-900">{cand.name}</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCandidateManager?.('senate', cand.id);
                        }}
                        className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                        title="Edit candidate"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-xs text-indigo-700 font-medium">{cand.party}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{cand.description}</div>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'text-stone-400'
                  }`}
                >
                  {isSelected ? 'Marked' : 'Select'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================== */}
      {/* SECTION 3: MAYORAL RACE */}
      {/* ========================================================== */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold">
              Race 03 of 04 · Municipal Executive
            </span>
            <h2 className="text-lg font-bold text-stone-900 font-serif">
              Metropolitan Mayor
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenCandidateManager?.('mayor')}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              <span>+ Add / Rename Candidate</span>
            </button>
            <span className="text-xs text-stone-500 italic hidden sm:inline">Vote for ONE candidate</span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mayoralCandidates.map((cand) => {
            const isSelected = selections.mayoralCandidateId === cand.id;
            return (
              <div
                key={cand.id}
                onClick={() => {
                  if (!currentVoter) {
                    onOpenAuth();
                    return;
                  }
                  setSelections((prev) => ({
                    ...prev,
                    mayoralCandidateId: cand.id,
                  }));
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-700">{cand.party}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCandidateManager?.('mayor', cand.id);
                        }}
                        className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                        title="Edit candidate"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-indigo-600 text-white' : 'border border-stone-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-stone-900 mt-1">{cand.name}</h3>
                  <p className="text-xs text-stone-600 mt-1">{cand.description}</p>
                </div>

                <div className="pt-3 border-t border-stone-100 text-right">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded ${
                      isSelected ? 'bg-indigo-600 text-white' : 'text-stone-500'
                    }`}
                  >
                    {isSelected ? 'Marked' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================== */}
      {/* SECTION 4: BALLOT MEASURES & REFERENDA */}
      {/* ========================================================== */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold">
              Race 04 of 04 · Direct Citizen Referendum
            </span>
            <h2 className="text-lg font-bold text-stone-900 font-serif">
              Statewide & Global Ballot Propositions
            </h2>
          </div>
          <span className="text-xs text-stone-500 italic">Vote YES, NO, or ABSTAIN on each measure</span>
        </div>

        <div className="p-6 space-y-6">
          {BALLOT_MEASURES.map((measure) => {
            const currentVote = selections.measureVotes[measure.id];
            return (
              <div
                key={measure.id}
                className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-xs font-bold font-mono text-indigo-700 uppercase">
                      {measure.code}
                    </span>
                    <h3 className="font-bold text-stone-900 text-base">{measure.title}</h3>
                  </div>
                  <span className="text-xs text-stone-500 font-mono">
                    Threshold: {measure.threshold}
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">
                  {measure.summary}
                </p>

                <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs text-stone-600">
                  <span className="font-semibold text-stone-800 block mb-0.5">Official Ballot Question:</span>
                  <span className="italic">"{measure.fullText}"</span>
                </div>

                {/* Vote Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-stone-500">
                    Fiscal Impact: <span className="text-stone-700 font-medium">{measure.fiscalImpact.slice(0, 75)}...</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentVoter) {
                          onOpenAuth();
                          return;
                        }
                        handleMeasureVote(measure.id, 'yes');
                      }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        currentVote === 'yes'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-stone-300 text-stone-700 hover:border-emerald-500 hover:text-emerald-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>YES</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!currentVoter) {
                          onOpenAuth();
                          return;
                        }
                        handleMeasureVote(measure.id, 'no');
                      }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        currentVote === 'no'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-stone-300 text-stone-700 hover:border-rose-500 hover:text-rose-700'
                      }`}
                    >
                      <span>NO</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!currentVoter) {
                          onOpenAuth();
                          return;
                        }
                        handleMeasureVote(measure.id, 'abstain');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        currentVote === 'abstain'
                          ? 'bg-stone-700 text-white'
                          : 'bg-white border border-stone-300 text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      Abstain
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Submission Bar */}
      <div className="sticky bottom-4 z-30 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-stone-900">
            {currentVoter ? `Ready to submit as ${currentVoter.name}` : 'Authentication Required to Submit'}
          </div>
          <div className="text-[11px] text-stone-500">
            {currentVoter
              ? 'Click to review all selections before final cryptographic commit.'
              : 'Please sign in with your Voter ID & Mobile Number before completing your ballot.'}
          </div>
        </div>

        {currentVoter ? (
          <button
            onClick={handleReview}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <span>Review Selections & Seal Ballot</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <span>Sign In to Cast Ballot</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
