import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { Candidate, LocalCandidate } from '../types/voting';
import {
  X,
  UserPlus,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ManageCandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOffice?: 'presidential' | 'senate' | 'mayor';
  editingCandidateId?: string;
}

const PRESET_AVATARS = [
  { label: 'Candidate Photo 1', url: '/src/assets/images/candidate_maria_santos_1793898743046.jpg' },
  { label: 'Candidate Photo 2', url: '/src/assets/images/candidate_alistair_vance_1793898743194.jpg' },
  { label: 'Candidate Photo 3', url: '/src/assets/images/candidate_tariq_sterling_1793898743178.jpg' },
];

export const ManageCandidatesModal: React.FC<ManageCandidatesModalProps> = ({
  isOpen,
  onClose,
  initialOffice = 'presidential',
  editingCandidateId,
}) => {
  const {
    presidentialCandidates,
    senateCandidates,
    mayoralCandidates,
    addPresidentialCandidate,
    updatePresidentialCandidate,
    deletePresidentialCandidate,
    addSenateCandidate,
    updateSenateCandidate,
    deleteSenateCandidate,
    addMayoralCandidate,
    updateMayoralCandidate,
    deleteMayoralCandidate,
    resetCandidatesToDefault,
  } = useVoting();

  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [selectedOffice, setSelectedOffice] = useState<'presidential' | 'senate' | 'mayor'>(initialOffice);

  // Form state for adding/editing
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [runningMate, setRunningMate] = useState('');
  const [biography, setBiography] = useState('');
  const [priority, setPriority] = useState('');
  const [photoUrl, setPhotoUrl] = useState(PRESET_AVATARS[0].url);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(editingCandidateId || null);
  const [editOffice, setEditOffice] = useState<'presidential' | 'senate' | 'mayor'>('presidential');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !party.trim()) return;

    if (editingId) {
      // Editing existing candidate
      if (editOffice === 'presidential') {
        updatePresidentialCandidate(editingId, {
          name: name.trim(),
          party: party.trim(),
          runningMate: runningMate.trim(),
          biography: biography.trim(),
          photoUrl,
          keyPriorities: priority.trim() ? [priority.trim()] : undefined,
        });
      } else if (editOffice === 'senate') {
        updateSenateCandidate(editingId, {
          name: name.trim(),
          party: party.trim(),
          description: biography.trim() || `Candidate for Senate Seat under ${party.trim()}.`,
        });
      } else {
        updateMayoralCandidate(editingId, {
          name: name.trim(),
          party: party.trim(),
          description: biography.trim() || `Candidate for Metropolitan Mayor under ${party.trim()}.`,
        });
      }

      setSuccessMsg(`Candidate "${name.trim()}" updated successfully!`);
      setEditingId(null);
    } else {
      // Adding new candidate according to user's wish
      if (selectedOffice === 'presidential') {
        addPresidentialCandidate({
          name: name.trim(),
          party: party.trim(),
          runningMate: runningMate.trim() || 'Civic Running Mate',
          biography:
            biography.trim() ||
            `${name.trim()} was nominated to represent ${party.trim()} in the 2026 General Election.`,
          photoUrl,
          keyPriorities: priority.trim()
            ? [priority.trim(), 'Citizen voter participation & economic transparency']
            : undefined,
        });
      } else if (selectedOffice === 'senate') {
        addSenateCandidate({
          name: name.trim(),
          party: party.trim(),
          description: biography.trim() || `Candidate for Senate Seat under ${party.trim()}.`,
        });
      } else {
        addMayoralCandidate({
          name: name.trim(),
          party: party.trim(),
          description: biography.trim() || `Candidate for Metropolitan Mayor under ${party.trim()}.`,
        });
      }

      setSuccessMsg(`Candidate "${name.trim()}" successfully inserted on ballot!`);
    }

    // Reset fields
    setName('');
    setParty('');
    setRunningMate('');
    setBiography('');
    setPriority('');

    setTimeout(() => {
      setSuccessMsg('');
    }, 2500);
  };

  const startEditCandidate = (office: 'presidential' | 'senate' | 'mayor', cand: any) => {
    setEditingId(cand.id);
    setEditOffice(office);
    setSelectedOffice(office);
    setName(cand.name);
    setParty(cand.party);
    setRunningMate(cand.runningMate || '');
    setBiography(cand.biography || cand.description || '');
    setPriority(cand.keyPriorities?.[0] || '');
    if (cand.photoUrl) setPhotoUrl(cand.photoUrl);
    setActiveTab('add');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setParty('');
    setRunningMate('');
    setBiography('');
    setPriority('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white font-serif">
                Custom Candidate Manager
              </h3>
              <p className="text-[11px] text-stone-400">
                Insert, rename, and customize candidate names according to your wish
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 bg-stone-50 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 font-semibold text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'add'
                ? 'bg-white text-stone-950 border-b-2 border-indigo-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{editingId ? 'Edit Candidate Details' : 'Insert New Candidate'}</span>
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-3 font-semibold text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'manage'
                ? 'bg-white text-stone-950 border-b-2 border-indigo-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Manage Existing Candidates ({presidentialCandidates.length + senateCandidates.length + mayoralCandidates.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* TAB 1: ADD OR EDIT CANDIDATE */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              {editingId && (
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-lg flex items-center justify-between">
                  <span>Currently editing: <strong className="font-semibold">{name}</strong></span>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-xs text-indigo-700 hover:underline font-semibold"
                  >
                    Cancel Edit Mode
                  </button>
                </div>
              )}

              {/* Office Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Election Office / Race
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    disabled={Boolean(editingId)}
                    onClick={() => setSelectedOffice('presidential')}
                    className={`py-2 px-3 rounded-lg border font-medium transition-all ${
                      selectedOffice === 'presidential'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    President & VP
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(editingId)}
                    onClick={() => setSelectedOffice('senate')}
                    className={`py-2 px-3 rounded-lg border font-medium transition-all ${
                      selectedOffice === 'senate'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    Senate (Seat A)
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(editingId)}
                    onClick={() => setSelectedOffice('mayor')}
                    className={`py-2 px-3 rounded-lg border font-medium transition-all ${
                      selectedOffice === 'mayor'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    Metropolitan Mayor
                  </button>
                </div>
              </div>

              {/* Candidate Name & Party Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Candidate Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter any candidate name you wish..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    e.g. Johnathan Vance, Amina Patel, Alex Rivera
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Party / Affiliation Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. People's Union / Independent"
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Running mate (if presidential) */}
              {selectedOffice === 'presidential' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Running Mate (Vice President)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins / Elena Rostova"
                    value={runningMate}
                    onChange={(e) => setRunningMate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-indigo-600"
                  />
                </div>
              )}

              {/* Core Priority & Bio */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Key Campaign Priority / Slogan
                </label>
                <input
                  type="text"
                  placeholder="e.g. Universal Digital Healthcare & Economic Infrastructure"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Candidate Biography & Manifesto Stance
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of candidate's background, platform, or values..."
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-indigo-600 leading-relaxed"
                />
              </div>

              {/* Preset portrait picker */}
              {selectedOffice === 'presidential' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Select Candidate Campaign Portrait
                  </label>
                  <div className="flex items-center gap-3">
                    {PRESET_AVATARS.map((av, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPhotoUrl(av.url)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          photoUrl === av.url
                            ? 'border-indigo-600 ring-2 ring-indigo-300'
                            : 'border-stone-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                        {photoUrl === av.url && (
                          <div className="absolute top-1 right-1 bg-indigo-600 rounded-full text-white p-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">
                  Instantly available on the Ballot Station, Candidate Guide, and Election Night returns.
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Save Changes' : 'Insert Candidate to Ballot'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MANAGE & EDIT EXISTING CANDIDATES */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              {/* Presidential candidates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-stone-500">
                    Presidential Candidates ({presidentialCandidates.length})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedOffice('presidential');
                      setActiveTab('add');
                    }}
                    className="text-[11px] font-semibold text-indigo-700 hover:underline"
                  >
                    + Add Presidential Candidate
                  </button>
                </div>

                <div className="space-y-2">
                  {presidentialCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={cand.photoUrl}
                          alt={cand.name}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-200 shrink-0 border border-stone-300"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-stone-900 truncate">{cand.name}</div>
                          <div className="text-[11px] text-indigo-700 truncate">{cand.party}</div>
                          <div className="text-[10px] text-stone-400 truncate">Mate: {cand.runningMate}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => startEditCandidate('presidential', cand)}
                          className="p-1.5 rounded hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                          title="Rename / Edit candidate"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {presidentialCandidates.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${cand.name}" from ballot?`)) {
                                deletePresidentialCandidate(cand.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-rose-100 text-stone-400 hover:text-rose-700 transition-colors"
                            title="Delete candidate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Senate candidates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-stone-500">
                    Senate Candidates ({senateCandidates.length})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedOffice('senate');
                      setActiveTab('add');
                    }}
                    className="text-[11px] font-semibold text-indigo-700 hover:underline"
                  >
                    + Add Senate Candidate
                  </button>
                </div>

                <div className="space-y-2">
                  {senateCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 truncate">{cand.name}</div>
                        <div className="text-[11px] text-indigo-700 truncate">{cand.party}</div>
                        <div className="text-[10px] text-stone-400 truncate">{cand.description}</div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => startEditCandidate('senate', cand)}
                          className="p-1.5 rounded hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                          title="Rename / Edit candidate"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {senateCandidates.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${cand.name}" from ballot?`)) {
                                deleteSenateCandidate(cand.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-rose-100 text-stone-400 hover:text-rose-700 transition-colors"
                            title="Delete candidate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mayoral candidates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-stone-500">
                    Mayoral Candidates ({mayoralCandidates.length})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedOffice('mayor');
                      setActiveTab('add');
                    }}
                    className="text-[11px] font-semibold text-indigo-700 hover:underline"
                  >
                    + Add Mayoral Candidate
                  </button>
                </div>

                <div className="space-y-2">
                  {mayoralCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 truncate">{cand.name}</div>
                        <div className="text-[11px] text-indigo-700 truncate">{cand.party}</div>
                        <div className="text-[10px] text-stone-400 truncate">{cand.description}</div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => startEditCandidate('mayor', cand)}
                          className="p-1.5 rounded hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                          title="Rename / Edit candidate"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {mayoralCandidates.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${cand.name}" from ballot?`)) {
                                deleteMayoralCandidate(cand.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-rose-100 text-stone-400 hover:text-rose-700 transition-colors"
                            title="Delete candidate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset to defaults button */}
              <div className="pt-4 border-t border-stone-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset candidates list back to original official roster?')) {
                      resetCandidatesToDefault();
                      setSuccessMsg('Reset all candidates to default roster.');
                    }
                  }}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-900 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Default Candidates</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
