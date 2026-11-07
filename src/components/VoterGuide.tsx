import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { BALLOT_MEASURES } from '../data/electionData';
import { Candidate } from '../types/voting';
import {
  BookOpen,
  Check,
  ThumbsUp,
  ThumbsDown,
  Scale,
  ArrowRight,
  UserPlus,
  Edit2,
} from 'lucide-react';

interface VoterGuideProps {
  onSelectCandidateToVote: (candidateId: string) => void;
  selectedCandidateId?: string;
  onOpenCandidateManager?: (office?: 'presidential' | 'senate' | 'mayor', candidateId?: string) => void;
}

export const VoterGuide: React.FC<VoterGuideProps> = ({
  onSelectCandidateToVote,
  selectedCandidateId,
  onOpenCandidateManager,
}) => {
  const { presidentialCandidates } = useVoting();
  const [activeTab, setActiveTab] = useState<'candidates' | 'matrix' | 'measures'>('candidates');
  const [highlightedCandidateId, setHighlightedCandidateId] = useState<string>(
    selectedCandidateId || presidentialCandidates[0]?.id || ''
  );

  const currentCandidate =
    presidentialCandidates.find((c) => c.id === highlightedCandidateId) ||
    presidentialCandidates[0] || {
      id: 'none',
      name: 'No Candidate Registered',
      runningMate: '',
      office: 'President & Vice President',
      party: 'None',
      partyColor: 'bg-stone-500',
      photoUrl: '/src/assets/images/candidate_maria_santos_1793898743046.jpg',
      biography: 'No candidates currently on ballot. Click + Insert Candidate to add one according to your wish.',
      keyPriorities: [],
      stances: {
        economy: 'N/A',
        climate: 'N/A',
        technology: 'N/A',
        foreignPolicy: 'N/A',
        healthcare: 'N/A',
      },
      endorsements: [],
    };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-stone-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 uppercase tracking-wider font-semibold mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Official Non-Partisan Electorate Guide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Candidates, Manifestos & Ballot Measures
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Impartial policy breakdowns, official campaign platforms, and legal analyses prepared for international and domestic voters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenCandidateManager?.('presidential')}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Insert / Edit Candidates</span>
          </button>

          {/* Segmented Tab Control */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg shrink-0 text-xs font-medium">
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'candidates'
                  ? 'bg-white text-stone-950 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Profiles
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'matrix'
                  ? 'bg-white text-stone-950 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Comparison
            </button>
            <button
              onClick={() => setActiveTab('measures')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'measures'
                  ? 'bg-white text-stone-950 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Propositions
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CANDIDATE PROFILES */}
      {activeTab === 'candidates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidate Selector Rail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                Executive Candidates ({presidentialCandidates.length})
              </span>
              <button
                type="button"
                onClick={() => onOpenCandidateManager?.('presidential')}
                className="text-xs text-indigo-700 hover:underline font-semibold"
              >
                + Insert Name
              </button>
            </div>

            {presidentialCandidates.map((cand) => {
              const isSelected = cand.id === highlightedCandidateId;
              return (
                <div
                  key={cand.id}
                  onClick={() => setHighlightedCandidateId(cand.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/30 shadow-2xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <img
                    src={cand.photoUrl}
                    alt={cand.name}
                    className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                      {cand.name}
                    </div>
                    <div className="text-[11px] text-indigo-700 font-medium truncate">
                      {cand.party}
                    </div>
                    <div className="text-[10px] text-stone-500 truncate">
                      Mate: {cand.runningMate}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2 mt-4">
              <span className="font-bold text-stone-800 block">Custom Candidate Names</span>
              <p className="text-[11px] leading-relaxed">
                You can insert, customize, and edit candidate names according to your wish. All candidates are dynamically updated across the electronic ballot and tally.
              </p>
            </div>
          </div>

          {/* Candidate Detailed Dossier */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 sm:p-8 space-y-6">
              {/* Header with Photo & Bio */}
              <div className="flex flex-col sm:flex-row items-start gap-6 border-b border-stone-200 pb-6">
                <img
                  src={currentCandidate.photoUrl}
                  alt={currentCandidate.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200 shadow-xs"
                />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-indigo-700 tracking-tight">
                      {currentCandidate.party}
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenCandidateManager?.('presidential', currentCandidate.id)}
                      className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Rename or edit this candidate"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Candidate</span>
                    </button>
                  </div>

                  <h2 className="text-2xl font-bold text-stone-950 font-serif">
                    {currentCandidate.name}
                  </h2>
                  <div className="text-xs text-stone-600">
                    Candidate for President &middot; Running Mate: <span className="font-semibold text-stone-900">{currentCandidate.runningMate}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed pt-1">
                    {currentCandidate.biography}
                  </p>
                </div>
              </div>

              {/* Key Priorities */}
              <div>
                <h3 className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold mb-3">
                  Core Campaign Priorities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentCandidate.keyPriorities && currentCandidate.keyPriorities.length > 0 ? (
                    currentCandidate.keyPriorities.map((priority, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-800 flex items-start gap-2"
                      >
                        <Check className="w-3.5 h-3.5 text-indigo-700 shrink-0 mt-0.5" />
                        <span>{priority}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-500">
                      Standard civic reform and infrastructure prioritization.
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Policy Positions */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold">
                  Official Policy Stances
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 rounded-lg border border-stone-200 bg-white">
                    <span className="font-bold text-stone-900 block mb-1">
                      Economy & Taxation
                    </span>
                    <p className="text-stone-700 leading-relaxed">
                      {currentCandidate.stances.economy}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-stone-200 bg-white">
                    <span className="font-bold text-stone-900 block mb-1">
                      Climate & Energy Transition
                    </span>
                    <p className="text-stone-700 leading-relaxed">
                      {currentCandidate.stances.climate}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-stone-200 bg-white">
                    <span className="font-bold text-stone-900 block mb-1">
                      Technology, AI Standards & Digital Rights
                    </span>
                    <p className="text-stone-700 leading-relaxed">
                      {currentCandidate.stances.technology}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-stone-200 bg-white">
                    <span className="font-bold text-stone-900 block mb-1">
                      Foreign Affairs & Consular Rights for Global Citizens
                    </span>
                    <p className="text-stone-700 leading-relaxed">
                      {currentCandidate.stances.foreignPolicy}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-stone-200 bg-white">
                    <span className="font-bold text-stone-900 block mb-1">
                      Healthcare & Social Safety Net
                    </span>
                    <p className="text-stone-700 leading-relaxed">
                      {currentCandidate.stances.healthcare}
                    </p>
                  </div>
                </div>
              </div>

              {/* Endorsements */}
              {currentCandidate.endorsements && currentCandidate.endorsements.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold block mb-2">
                    Key Endorsements
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {currentCandidate.endorsements.map((end, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-stone-100 text-stone-700 border border-stone-200 font-medium"
                      >
                        {end}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 border-t border-stone-200 flex justify-end">
                <button
                  onClick={() => onSelectCandidateToVote(currentCandidate.id)}
                  className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                >
                  <span>Select {currentCandidate.name} on Ballot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SIDE-BY-SIDE COMPARISON MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                Presidential Candidate Comparison Matrix
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Compare where each ticket stands on the primary issues facing voters worldwide.
              </p>
            </div>
            <button
              onClick={() => onOpenCandidateManager?.('presidential')}
              className="text-xs text-indigo-700 hover:underline font-semibold"
            >
              + Insert Candidate
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100/50">
                  <th className="py-3 px-4 font-mono font-bold text-stone-600 w-1/4">Policy Dimension</th>
                  {presidentialCandidates.map((cand) => (
                    <th key={cand.id} className="py-3 px-4 font-bold text-stone-900 min-w-[220px]">
                      <div className="flex items-center justify-between">
                        <div>{cand.name}</div>
                        <button
                          onClick={() => onOpenCandidateManager?.('presidential', cand.id)}
                          className="text-stone-400 hover:text-stone-700 p-0.5"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal">{cand.party}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="py-4 px-4 font-semibold text-stone-900 bg-stone-50/50">Economy & Taxes</td>
                  {presidentialCandidates.map((cand) => (
                    <td key={cand.id} className="py-4 px-4 text-stone-700 leading-relaxed">
                      {cand.stances.economy}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-stone-900 bg-stone-50/50">Climate & Energy</td>
                  {presidentialCandidates.map((cand) => (
                    <td key={cand.id} className="py-4 px-4 text-stone-700 leading-relaxed">
                      {cand.stances.climate}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-stone-900 bg-stone-50/50">AI & Digital Rights</td>
                  {presidentialCandidates.map((cand) => (
                    <td key={cand.id} className="py-4 px-4 text-stone-700 leading-relaxed">
                      {cand.stances.technology}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-stone-900 bg-stone-50/50">Global Citizens & Foreign Policy</td>
                  {presidentialCandidates.map((cand) => (
                    <td key={cand.id} className="py-4 px-4 text-stone-700 leading-relaxed">
                      {cand.stances.foreignPolicy}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-stone-900 bg-stone-50/50">Healthcare</td>
                  {presidentialCandidates.map((cand) => (
                    <td key={cand.id} className="py-4 px-4 text-stone-700 leading-relaxed">
                      {cand.stances.healthcare}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BALLOT PROPOSITIONS ANALYSIS */}
      {activeTab === 'measures' && (
        <div className="space-y-8">
          {BALLOT_MEASURES.map((measure) => (
            <div
              key={measure.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-700 uppercase">
                    {measure.code} · Citizen Referendum
                  </span>
                  <h2 className="text-xl font-bold text-stone-900 font-serif">{measure.title}</h2>
                  <span className="text-xs text-stone-500">Sponsored by: {measure.sponsor}</span>
                </div>
                <div className="text-xs text-stone-500 font-mono bg-stone-100 px-3 py-1.5 rounded-lg shrink-0">
                  Required: {measure.threshold}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold block">
                  Official Ballot Summary
                </span>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200">
                  {measure.summary}
                </p>
              </div>

              {/* Fiscal Impact */}
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Scale className="w-4 h-4 text-amber-700" />
                  Independent Fiscal Analysis:
                </span>
                <p className="leading-relaxed">{measure.fiscalImpact}</p>
              </div>

              {/* Arguments For and Against */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pro Arguments */}
                <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <ThumbsUp className="w-4 h-4 text-emerald-700" />
                    <span>Arguments in Favor (Vote YES)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-emerald-950">
                    {measure.proArguments.map((arg, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{arg}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Con Arguments */}
                <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-3">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                    <ThumbsDown className="w-4 h-4 text-rose-700" />
                    <span>Arguments Against (Vote NO)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-rose-950">
                    {measure.conArguments.map((arg, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-700 font-bold mr-1">&times;</span>
                        <span>{arg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
