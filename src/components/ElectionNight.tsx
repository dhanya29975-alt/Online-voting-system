import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { BALLOT_MEASURES } from '../data/electionData';
import { formatNumber, formatPercent } from '../utils/crypto';
import {
  TrendingUp,
  RefreshCw,
  Play,
  Pause,
  Clock,
  Radio,
  Lock,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  LogOut,
  UserPlus,
} from 'lucide-react';

interface ElectionNightProps {
  onOpenAdminAuth?: () => void;
  onOpenCandidateManager?: () => void;
}

export const ElectionNight: React.FC<ElectionNightProps> = ({ onOpenAdminAuth, onOpenCandidateManager }) => {
  const {
    results,
    liveUpdates,
    simulateIncomingReturns,
    isAutoStreamingReturns,
    toggleAutoStreamingReturns,
    isAdmin,
    adminLogin,
    adminLogout,
    currentVoter,
    presidentialCandidates,
    senateCandidates,
  } = useVoting();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [adminInputKey, setAdminInputKey] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string>('');

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError('');
    const res = adminLogin(adminInputKey);
    if (!res.success) {
      setAdminAuthError(res.error || 'Invalid administrator key');
    }
  };

  // If user is NOT an admin, block access to voting rates as requested!
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-stone-900 text-white p-6 sm:p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center mx-auto ring-4 ring-stone-800/60">
              <Lock className="w-7 h-7 text-amber-300" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-stone-400 block">
              Official Election Protocol &middot; Confidential Tabulation
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Voting Rates Restricted to Election Administrators
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
              In accordance with electoral integrity regulations, live precinct returns and candidate voting rates are classified and restricted to accredited Election Commission administrators until certified publication.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Voter Privacy & Anti-Coercion Policy</span>
                Registered citizens may cast their ballot and verify their cryptographic receipt on the public ledger. Live voting distributions and margin rates are accessible strictly to authorized election officers.
              </div>
            </div>

            {/* Direct Admin Login Box */}
            <div className="border border-stone-200 rounded-xl bg-stone-50/60 p-6 max-w-md mx-auto space-y-4">
              <div className="text-center">
                <span className="text-xs font-bold text-stone-900 block font-serif">
                  Election Administrator Authorization
                </span>
                <span className="text-[11px] text-stone-500">
                  Authenticate with your official commission security key
                </span>
              </div>

              {adminAuthError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
                  {adminAuthError}
                </div>
              )}

              <form onSubmit={handleAdminAuthSubmit} className="space-y-3">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Enter Admin Key (e.g. admin2026)"
                    value={adminInputKey}
                    onChange={(e) => setAdminInputKey(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
                  >
                    Authenticate as Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => adminLogin('admin2026')}
                    className="py-2 px-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium text-xs rounded-lg transition-colors"
                  >
                    1-Click Admin Access
                  </button>
                </div>
              </form>

              <div className="text-center text-[10px] text-stone-400 font-mono">
                Demo Administrator Security Key: <span className="font-semibold text-stone-700">admin2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN VIEW: FULL VOTING RATES ACCESS ---
  const totalPresVotes = Object.values(results.candidateVotes).reduce((a, b) => a + b, 0);
  const reportingPct = ((results.precinctsReporting / results.totalPrecincts) * 100).toFixed(1);
  const overallTurnoutPct = ((results.totalVotesCast / results.totalEligibleVoters) * 100).toFixed(1);

  // Sorted candidates by votes
  const sortedCandidates = [...presidentialCandidates].sort((a, b) => {
    return (results.candidateVotes[b.id] || 0) - (results.candidateVotes[a.id] || 0);
  });

  const leadingCandidate = sortedCandidates[0] || { id: 'none', name: 'Awaiting Candidate Accreditation' };
  const secondCandidate = sortedCandidates[1];
  const voteLead = secondCandidate
    ? (results.candidateVotes[leadingCandidate.id] || 0) - (results.candidateVotes[secondCandidate.id] || 0)
    : (results.candidateVotes[leadingCandidate.id] || 0);

  const filteredUpdates = liveUpdates.filter((upd) => {
    if (activeCategoryFilter === 'all') return true;
    return upd.category === activeCategoryFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Administrator Status Bar */}
      <div className="bg-amber-500 text-stone-950 px-4 py-2 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold shadow-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-stone-900 shrink-0" />
          <span>ADMINISTRATOR PORTAL &middot; LIVE TABULATION & CONFIDENTIAL VOTING RATES</span>
        </div>
        <div className="flex items-center gap-2">
          {onOpenCandidateManager && (
            <button
              onClick={onOpenCandidateManager}
              className="px-2.5 py-1 bg-stone-900 text-white rounded text-[11px] font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1 shadow-2xs"
            >
              <UserPlus className="w-3 h-3" />
              <span>+ Insert / Edit Candidates</span>
            </button>
          )}
          <button
            onClick={adminLogout}
            className="px-2.5 py-1 bg-stone-900 text-white rounded text-[11px] font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            <span>Exit Admin View</span>
          </button>
        </div>
      </div>

      {/* Top Banner: Election Night Command Deck */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
                ADMINISTRATOR TABULATION DECK
              </span>
              <span className="text-stone-500">·</span>
              <span className="text-xs text-stone-400 font-mono">Confidential Live Returns</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
              Global General Election Returns & Voting Rates
            </h1>
            <p className="text-xs text-stone-400 mt-1 max-w-xl">
              Real-time returns from 140 diplomatic outposts, overseas citizen precincts, and domestic electoral registries.
            </p>
          </div>

          {/* Interactive Simulation Controls for Admin */}
          <div className="flex flex-wrap items-center gap-3 bg-stone-800/90 p-3 rounded-xl border border-stone-700">
            <button
              onClick={simulateIncomingReturns}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Add a batch of incoming precinct returns"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Simulate Next Return Batch</span>
            </button>

            <button
              onClick={toggleAutoStreamingReturns}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isAutoStreamingReturns
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-stone-700 hover:bg-stone-600 text-stone-200'
              }`}
            >
              {isAutoStreamingReturns ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Live Feed</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Auto-Stream Live Returns</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Key KPI Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <span className="text-xs text-stone-400 block mb-1">Total Ballots Cast Worldwide</span>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {formatNumber(results.totalVotesCast)}
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">
              of {formatNumber(results.totalEligibleVoters)} registered electors
            </span>
          </div>

          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <span className="text-xs text-stone-400 block mb-1">Precincts Reporting</span>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {results.precinctsReporting} <span className="text-sm font-normal text-stone-400">/ {results.totalPrecincts}</span>
            </div>
            <div className="w-full bg-stone-700 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${reportingPct}%` }}
              />
            </div>
            <span className="text-[11px] text-indigo-300 mt-1 block font-mono">
              {reportingPct}% tabulated
            </span>
          </div>

          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <span className="text-xs text-stone-400 block mb-1">Estimated Global Turnout</span>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {overallTurnoutPct}%
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+6.2% over previous cycle</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <span className="text-xs text-stone-400 block mb-1">Current Leader</span>
            <div className="text-lg font-bold text-white truncate">
              {leadingCandidate.name}
            </div>
            <span className="text-[11px] text-stone-300 mt-1 block font-mono">
              +{formatNumber(voteLead)} vote lead ({formatPercent(results.candidateVotes[leadingCandidate.id] || 0, totalPresVotes)})
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Races + Live News Wire */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Races (2 spans) */}
        <div className="lg:col-span-2 space-y-8">
          {/* PRESIDENTIAL RACE */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold">
                  Executive Race · 84.2% Estimated Tabulation
                </span>
                <h2 className="text-xl font-bold text-stone-900 font-serif">
                  President & Vice President of the Republic
                </h2>
              </div>
              <span className="text-xs font-mono text-stone-600 bg-stone-100 px-2.5 py-1 rounded">
                Total Tallied: {formatNumber(totalPresVotes)}
              </span>
            </div>

            <div className="space-y-5">
              {sortedCandidates.map((cand, idx) => {
                const votes = results.candidateVotes[cand.id] || 0;
                const pct = totalPresVotes > 0 ? (votes / totalPresVotes) * 100 : 0;
                const isLeading = idx === 0;

                return (
                  <div
                    key={cand.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isLeading
                        ? 'border-indigo-600/60 bg-indigo-50/20'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={cand.photoUrl}
                          alt={cand.name}
                          className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-stone-900">{cand.name}</h3>
                            {isLeading && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                                Projected Lead
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-stone-500">
                            {cand.party} · Mate: {cand.runningMate}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                          {pct.toFixed(1)}%
                        </div>
                        <div className="text-xs font-mono text-stone-500 tabular-nums">
                          {formatNumber(votes)} votes
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden mt-3">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          cand.id === 'cand-santos'
                            ? 'bg-indigo-600'
                            : cand.id === 'cand-vance'
                            ? 'bg-sky-600'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LEGISLATIVE ASSEMBLY / SENATE */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <span className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold">
                Legislative Branch
              </span>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                Senate / Global Representative (Seat A)
              </h2>
            </div>

            <div className="space-y-3">
              {senateCandidates.map((sen) => {
                const votes = results.senateVotes[sen.id] || 0;
                const totalSenateVotes = Object.values(results.senateVotes).reduce((a, b) => a + b, 0);
                const pct = totalSenateVotes > 0 ? (votes / totalSenateVotes) * 100 : 0;
                return (
                  <div key={sen.id} className="p-3 rounded-lg border border-stone-200 bg-stone-50/50">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div>
                        <span className="font-bold text-stone-900">{sen.name}</span>
                        <span className="text-stone-500 ml-2">({sen.party})</span>
                      </div>
                      <div className="font-mono font-semibold text-stone-800">
                        {pct.toFixed(1)}% ({formatNumber(votes)})
                      </div>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BALLOT MEASURES RESULTS */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 space-y-6">
            <div className="border-b border-stone-200 pb-3">
              <span className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold">
                Direct Citizen Referenda
              </span>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                Ballot Propositions & Sovereign Bonds
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BALLOT_MEASURES.map((measure) => {
                const data = results.measureVotes[measure.id] || { yes: 0, no: 0, abstain: 0 };
                const totalValid = data.yes + data.no;
                const yesPct = totalValid > 0 ? (data.yes / totalValid) * 100 : 0;
                const noPct = totalValid > 0 ? (data.no / totalValid) * 100 : 0;
                const isPassing = yesPct >= 50;

                return (
                  <div key={measure.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-indigo-700">{measure.code}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isPassing ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPassing ? 'Projected to Pass' : 'Projected to Fail'}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-stone-900 mb-2">{measure.title}</h3>

                      <div className="space-y-2 my-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-emerald-800">YES</span>
                            <span className="font-mono text-stone-800">{yesPct.toFixed(1)}% ({formatNumber(data.yes)})</span>
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-2">
                            <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${yesPct}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-rose-800">NO</span>
                            <span className="font-mono text-stone-800">{noPct.toFixed(1)}% ({formatNumber(data.no)})</span>
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-2">
                            <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${noPct}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-200">
                      Required Threshold: {measure.threshold}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REGIONAL / OVERSEAS TURNOUT TABLE */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <span className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold">
                Worldwide Geographic Breakdown
              </span>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                Turnout by Overseas & Domestic Electoral Division
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-mono">
                    <th className="py-2.5 px-3">Electoral Division</th>
                    <th className="py-2.5 px-3 text-right">Votes Counted</th>
                    <th className="py-2.5 px-3 text-right">Registered Electors</th>
                    <th className="py-2.5 px-3 text-right">Turnout Pct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {results.regionalTurnout.map((reg) => (
                    <tr key={reg.region} className="hover:bg-stone-50">
                      <td className="py-2.5 px-3 font-medium text-stone-900 flex items-center gap-2">
                        <span>{reg.flag}</span>
                        <span>{reg.region}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-stone-700">
                        {formatNumber(reg.votesCounted)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-stone-500">
                        {formatNumber(reg.totalRegistered)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-indigo-700">
                        {reg.turnoutPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Live Breaking News Wire (1 span) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                <h2 className="font-bold text-stone-900 text-base font-serif">
                  Live Election Wire
                </h2>
              </div>
              <span className="text-[11px] font-mono text-stone-400">
                {liveUpdates.length} dispatches
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs">
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                  activeCategoryFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveCategoryFilter('turnout')}
                className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                  activeCategoryFilter === 'turnout'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Turnout
              </button>
              <button
                onClick={() => setActiveCategoryFilter('security')}
                className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                  activeCategoryFilter === 'security'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Audits
              </button>
            </div>

            {/* Updates list */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredUpdates.map((update) => (
                <div
                  key={update.id}
                  className="p-3 rounded-lg border border-stone-200/80 bg-stone-50/60 hover:bg-stone-50 transition-colors text-xs"
                >
                  <div className="flex items-center justify-between text-stone-400 text-[10px] font-mono mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {update.timeLabel}
                    </span>
                    <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                      {update.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-xs mb-1">
                    {update.headline}
                  </h4>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    {update.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-200 text-center">
              <span className="text-[11px] text-stone-500">
                Central Electoral Commission Confidential Wire
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
