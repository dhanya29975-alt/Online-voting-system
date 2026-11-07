import React from 'react';
import { useVoting } from '../context/VotingContext';
import { ShieldCheck, UserCheck, CheckCircle2, Globe, QrCode, Printer, KeyRound } from 'lucide-react';

interface VoterProfileModalProps {
  onOpenAuth: () => void;
  onNavigateToBallot: () => void;
}

export const VoterProfileModal: React.FC<VoterProfileModalProps> = ({
  onOpenAuth,
  onNavigateToBallot,
}) => {
  const { currentVoter, logoutVoter } = useVoting();

  if (!currentVoter) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center mx-auto">
          <UserCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-stone-900">
          No Elector Authenticated
        </h2>
        <p className="text-xs text-stone-600 max-w-sm mx-auto">
          Sign in with your National or Global Voter ID to access your official voter credentials card and precinct eligibility.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
        >
          Sign In or Register Elector Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Official Certificate Card */}
      <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm overflow-hidden">
        {/* Certificate Header Banner */}
        <div className="bg-stone-900 text-white p-6 sm:p-8 border-b-4 border-indigo-600 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-700 text-amber-300 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 block">
                  Central Electoral Commission
                </span>
                <h1 className="text-lg sm:text-xl font-bold font-serif text-white">
                  Official Global Elector Credential
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Verified Active Elector
              </span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-stone-200 pb-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-stone-500 block">
                  Elector Legal Name
                </span>
                <span className="text-2xl font-bold text-stone-900 font-serif">
                  {currentVoter.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-mono">Global Voter ID</span>
                  <span className="font-mono font-bold text-stone-900 text-sm">
                    {currentVoter.nationalVoterId}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-mono">Registered Mobile</span>
                  <span className="font-mono text-stone-900 font-bold">
                    {currentVoter.mobileNumber}
                  </span>
                </div>
              </div>

              <div className="text-xs">
                <span className="text-stone-500 block text-[10px] uppercase font-mono">Assigned Electoral Division</span>
                <span className="font-medium text-stone-900 block mt-0.5">
                  {currentVoter.jurisdiction}
                </span>
              </div>
            </div>

            {/* Simulated Digital Security Hologram / Barcode Box */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-2">
              <div className="w-24 h-24 mx-auto bg-stone-900 text-white rounded-lg flex flex-col items-center justify-center p-2">
                <QrCode className="w-16 h-16 text-stone-100" />
              </div>
              <span className="font-mono text-[9px] text-stone-500 tracking-wider block">
                AUTH-SHA256-TOKEN
              </span>
              <div className="h-6 w-full flex items-center justify-center gap-0.5">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full bg-stone-800 ${i % 3 === 0 ? 'w-1' : 'w-0.5'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Voting Record / Eligibility */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block mb-1">Voting Status:</span>
              <span className={`font-bold ${currentVoter.hasVoted ? 'text-emerald-700' : 'text-indigo-700'}`}>
                {currentVoter.hasVoted ? 'Ballot Cast & Tallied' : 'Eligible - Not Yet Cast'}
              </span>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block mb-1">Registered Residence:</span>
              <span className="font-medium text-stone-900">
                {currentVoter.city}, {currentVoter.country}
              </span>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block mb-1">Citizen Category:</span>
              <span className="font-medium text-stone-900 capitalize">
                {currentVoter.residenceType.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 border border-stone-300"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Registration Certificate</span>
            </button>

            {!currentVoter.hasVoted ? (
              <button
                onClick={onNavigateToBallot}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                Proceed to Ballot Station →
              </button>
            ) : (
              <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Your ballot has been officially recorded</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
