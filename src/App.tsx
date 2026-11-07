/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VotingProvider, useVoting } from './context/VotingContext';
import { Header } from './components/Header';
import { BallotStation } from './components/BallotStation';
import { ElectionNight } from './components/ElectionNight';
import { VoterGuide } from './components/VoterGuide';
import { AuditLedger } from './components/AuditLedger';
import { VoterProfileModal } from './components/VoterProfileModal';
import { AuthModal } from './components/AuthModal';
import { ManageCandidatesModal } from './components/ManageCandidatesModal';
import { ShieldCheck, RotateCcw, UserPlus } from 'lucide-react';

function VotingAppContent() {
  const [activeTab, setActiveTab] = useState<'ballot' | 'results' | 'candidates' | 'audit' | 'profile'>('ballot');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCandidateManagerOpen, setIsCandidateManagerOpen] = useState(false);
  const [candidateManagerOffice, setCandidateManagerOffice] = useState<'presidential' | 'senate' | 'mayor'>('presidential');
  const [candidateManagerEditingId, setCandidateManagerEditingId] = useState<string | undefined>(undefined);
  const [auditTargetHash, setAuditTargetHash] = useState('');
  const [candidateGuideTarget, setCandidateGuideTarget] = useState<string | undefined>(undefined);

  const { resetDemoData, currentVoter } = useVoting();

  const handleOpenCandidateManager = (
    office: 'presidential' | 'senate' | 'mayor' = 'presidential',
    candidateId?: string
  ) => {
    setCandidateManagerOffice(office);
    setCandidateManagerEditingId(candidateId);
    setIsCandidateManagerOpen(true);
  };

  const handleNavigateToAudit = (hash: string) => {
    setAuditTargetHash(hash);
    setActiveTab('audit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCandidates = (candId?: string) => {
    setCandidateGuideTarget(candId);
    setActiveTab('candidates');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCandidateToVote = (_candId: string) => {
    setActiveTab('ballot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-950">
      {/* Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCandidateManager={() => handleOpenCandidateManager('presidential')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'ballot' && (
          <BallotStation
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateToAudit={handleNavigateToAudit}
            onNavigateToCandidates={handleNavigateToCandidates}
            onOpenCandidateManager={handleOpenCandidateManager}
          />
        )}

        {activeTab === 'results' && (
          <ElectionNight
            onOpenCandidateManager={() => handleOpenCandidateManager('presidential')}
          />
        )}

        {activeTab === 'candidates' && (
          <VoterGuide
            onSelectCandidateToVote={handleSelectCandidateToVote}
            selectedCandidateId={candidateGuideTarget}
            onOpenCandidateManager={handleOpenCandidateManager}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLedger initialSearchHash={auditTargetHash} />
        )}

        {activeTab === 'profile' && (
          <VoterProfileModal
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateToBallot={() => setActiveTab('ballot')}
          />
        )}
      </main>

      {/* Auth & Registration Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Candidate Customization & Insertion Modal */}
      <ManageCandidatesModal
        isOpen={isCandidateManagerOpen}
        onClose={() => setIsCandidateManagerOpen(false)}
        initialOffice={candidateManagerOffice}
        editingCandidateId={candidateManagerEditingId}
      />

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-stone-200 mt-16 py-10 px-4 sm:px-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-indigo-900 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-stone-900 font-serif">
                AegisVote Global Electoral Protocol
              </span>
            </div>
            <p className="text-[11px] text-stone-500 max-w-md">
              Certified for global overseas citizen participation, military ballots, customizable candidate rosters, and end-to-end cryptographic verifiability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-stone-600">
            <button
              onClick={() => handleOpenCandidateManager('presidential')}
              className="hover:text-stone-950 transition-colors font-semibold text-indigo-700 flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Insert / Edit Candidates</span>
            </button>
            <button
              onClick={() => setActiveTab('ballot')}
              className="hover:text-stone-950 transition-colors"
            >
              Ballot Station
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className="hover:text-stone-950 transition-colors"
            >
              Election Night Live
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className="hover:text-stone-950 transition-colors"
            >
              Candidates Guide
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className="hover:text-stone-950 transition-colors"
            >
              Public Ledger
            </button>
            <button
              onClick={() => {
                if (confirm('Reset all demo ballots and voter records back to factory defaults?')) {
                  resetDemoData();
                }
              }}
              className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors ml-2"
              title="Reset demonstration data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 mt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-400">
          <div>
            &copy; 2026 Central Electoral Commission. All rights reserved. Secret ballot guaranteed by law.
          </div>
          <div className="font-mono">
            SHA-256 Engine: WebCrypto v2 &middot; Dynamic Candidate Roster Enabled
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <VotingProvider>
      <VotingAppContent />
    </VotingProvider>
  );
}
