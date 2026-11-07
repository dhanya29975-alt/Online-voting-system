import React from 'react';
import { useVoting } from '../context/VotingContext';
import { ShieldCheck, UserCheck, LogOut, ChevronDown, Lock, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  activeTab: 'ballot' | 'results' | 'candidates' | 'audit' | 'profile';
  setActiveTab: (tab: 'ballot' | 'results' | 'candidates' | 'audit' | 'profile') => void;
  onOpenAuth: () => void;
  onOpenCandidateManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenCandidateManager,
}) => {
  const {
    currentVoter,
    logoutVoter,
    voters,
    switchTestVoter,
    electionPhase,
    setElectionPhase,
    isAdmin,
    toggleAdminMode,
    adminLogout,
  } = useVoting();
  const [showVoterDropdown, setShowVoterDropdown] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Official State Ribbon */}
      <div className="bg-stone-900 text-stone-300 text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-mono text-stone-200 tracking-tight">ELECTION 2026 // GLOBAL VOTING ACTIVE</span>
          <span className="hidden sm:inline text-stone-500">·</span>
          <span className="hidden sm:inline text-stone-400">Voter ID & Mobile Number Authentication</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          {isAdmin ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-bold text-[10px]">
              ADMIN CLEARANCE ACTIVE
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-stone-400 text-[11px]">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Voting Rates: Admin Only</span>
            </span>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">Phase:</span>
            <select
              value={electionPhase}
              onChange={(e) => setElectionPhase(e.target.value as any)}
              className="bg-stone-800 text-stone-200 text-xs px-2 py-0.5 rounded border border-stone-700 focus:outline-none focus:border-stone-500 cursor-pointer"
            >
              <option value="ELECTION_DAY_LIVE">Voting Open (Election Day)</option>
              <option value="POLLS_CLOSING">Polls Closing / Counting</option>
              <option value="CERTIFIED">Final Results Certified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation: 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('ballot')}
          className="flex items-center gap-2.5 text-left text-stone-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded bg-indigo-900 text-amber-400 flex items-center justify-center font-bold shadow-xs">
            <ShieldCheck className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-stone-950 font-sans block leading-tight">
              AegisVote <span className="text-indigo-600 font-medium">Global</span>
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('ballot')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'ballot'
                ? 'text-stone-950 font-semibold'
                : 'hover:text-stone-900'
            }`}
          >
            Ballot Station
            {activeTab === 'ballot' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`whitespace-nowrap transition-colors py-1 relative flex items-center gap-1.5 ${
              activeTab === 'results'
                ? 'text-stone-950 font-semibold'
                : 'hover:text-stone-900'
            }`}
          >
            <span>Live Voting Rates</span>
            {isAdmin ? (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                <Lock className="w-2.5 h-2.5" />
                Admin
              </span>
            )}
            {activeTab === 'results' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'candidates'
                ? 'text-stone-950 font-semibold'
                : 'hover:text-stone-900'
            }`}
          >
            Candidates & Measures
            {activeTab === 'candidates' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'audit'
                ? 'text-stone-950 font-semibold'
                : 'hover:text-stone-900'
            }`}
          >
            Verify Ballot Hash
            {activeTab === 'audit' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'profile'
                ? 'text-stone-950 font-semibold'
                : 'hover:text-stone-900'
            }`}
          >
            Voter Registration Card
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Voter Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentVoter ? (
            <div className="relative">
              <div className="flex items-center gap-2 p-1 pl-2.5 bg-stone-100 hover:bg-stone-150 rounded-lg border border-stone-200 transition-colors">
                <button
                  onClick={() => setShowVoterDropdown(!showVoterDropdown)}
                  className="flex items-center gap-2 text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-xs font-semibold text-stone-900 block truncate max-w-[120px]">
                      {currentVoter.name}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 block truncate max-w-[120px]">
                      {currentVoter.nationalVoterId}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                <div className="h-4 w-px bg-stone-300 mx-0.5" />

                <button
                  onClick={logoutVoter}
                  title="Sign out of voting session"
                  className="p-1 text-stone-500 hover:text-stone-900 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Voter Switcher Dropdown */}
              {showVoterDropdown && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-stone-200 py-2 z-50 text-xs"
                  onClick={() => setShowVoterDropdown(false)}
                >
                  <div className="px-3 py-1.5 border-b border-stone-100 font-semibold text-stone-500 uppercase tracking-wider text-[10px]">
                    Current Session: {currentVoter.name}
                  </div>
                  <div className="px-3 py-1 text-stone-600">
                    <div>Mobile: <span className="font-mono text-stone-800">{currentVoter.mobileNumber}</span></div>
                    <div>Jurisdiction: <span className="font-medium text-stone-800">{currentVoter.city}, {currentVoter.country}</span></div>
                    <div>Status: <span className="text-emerald-700 font-medium">{currentVoter.hasVoted ? 'Ballot Cast' : 'Eligible to Vote'}</span></div>
                  </div>

                  <div className="border-t border-stone-100 mt-2 pt-2 px-3 pb-1 text-[10px] uppercase font-semibold text-stone-400">
                    Switch Test Voter Account
                  </div>
                  {voters.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => switchTestVoter(v.id)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-stone-50 ${
                        v.id === currentVoter.id ? 'bg-indigo-50/70 font-semibold text-indigo-900' : 'text-stone-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs">{v.name}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{v.mobileNumber}</div>
                      </div>
                      <span className="text-[10px] text-stone-500">
                        {v.hasVoted ? 'Voted' : 'Ready'}
                      </span>
                    </button>
                  ))}

                  <div className="border-t border-stone-100 mt-2 pt-1">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="w-full px-3 py-1.5 text-left text-stone-700 hover:bg-stone-50 font-medium"
                    >
                      View Registration Card
                    </button>
                    <button
                      onClick={onOpenCandidateManager}
                      className="w-full px-3 py-1.5 text-left text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-1.5"
                    >
                      <span>+ Insert / Edit Candidate Names</span>
                    </button>
                    <button
                      onClick={onOpenAuth}
                      className="w-full px-3 py-1.5 text-left text-stone-700 hover:bg-stone-50 font-medium"
                    >
                      + Register / Login with Mobile
                    </button>
                    <button
                      onClick={() => toggleAdminMode()}
                      className="w-full px-3 py-1.5 text-left text-amber-700 hover:bg-amber-50 font-medium flex items-center gap-1.5"
                    >
                      <Lock className="w-3 h-3" />
                      <span>{isAdmin ? 'Exit Administrator Mode' : 'Toggle Administrator Mode'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-900 rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Voter Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-stone-200 bg-stone-50/80 px-2 py-2 text-xs font-medium text-stone-600">
        <button
          onClick={() => setActiveTab('ballot')}
          className={`px-2 py-1 rounded ${activeTab === 'ballot' ? 'bg-white text-indigo-900 font-semibold shadow-xs' : ''}`}
        >
          Ballot
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-2 py-1 rounded flex items-center gap-1 ${activeTab === 'results' ? 'bg-white text-indigo-900 font-semibold shadow-xs' : ''}`}
        >
          <span>Voting Rates</span>
          {!isAdmin && <Lock className="w-2.5 h-2.5 text-amber-700" />}
        </button>
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-2 py-1 rounded ${activeTab === 'candidates' ? 'bg-white text-indigo-900 font-semibold shadow-xs' : ''}`}
        >
          Candidates
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-2 py-1 rounded ${activeTab === 'audit' ? 'bg-white text-indigo-900 font-semibold shadow-xs' : ''}`}
        >
          Verify
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-2 py-1 rounded ${activeTab === 'profile' ? 'bg-white text-indigo-900 font-semibold shadow-xs' : ''}`}
        >
          Voter ID
        </button>
      </div>
    </header>
  );
};
