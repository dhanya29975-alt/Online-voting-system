import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Voter,
  Candidate,
  LocalCandidate,
  BallotSelection,
  BallotReceipt,
  ElectionPhase,
  LiveElectionUpdate,
  ElectionResults,
  ResidenceType,
} from '../types/voting';
import {
  INITIAL_VOTERS,
  PRESIDENTIAL_CANDIDATES,
  SENATE_CANDIDATES,
  MAYORAL_CANDIDATES,
  INITIAL_RESULTS,
  INITIAL_AUDIT_RECEIPTS,
  INITIAL_LIVE_UPDATES,
} from '../data/electionData';
import { generateBallotHash, formatVoterIdMasked } from '../utils/crypto';

interface VotingContextType {
  currentVoter: Voter | null;
  voters: Voter[];
  isAdmin: boolean;
  electionPhase: ElectionPhase;
  results: ElectionResults;
  auditReceipts: BallotReceipt[];
  liveUpdates: LiveElectionUpdate[];
  isAutoStreamingReturns: boolean;
  presidentialCandidates: Candidate[];
  senateCandidates: LocalCandidate[];
  mayoralCandidates: LocalCandidate[];
  loginVoter: (voterId: string, mobileNumber: string) => { success: boolean; error?: string };
  switchTestVoter: (voterId: string) => void;
  logoutVoter: () => void;
  adminLogin: (adminKey: string) => { success: boolean; error?: string };
  adminLogout: () => void;
  toggleAdminMode: () => void;
  registerVoter: (data: {
    name: string;
    email: string;
    mobileNumber: string;
    country: string;
    city: string;
    residenceType: ResidenceType;
    passportLast4: string;
  }) => Voter;
  addPresidentialCandidate: (data: {
    name: string;
    party: string;
    runningMate?: string;
    biography?: string;
    photoUrl?: string;
    keyPriorities?: string[];
    stances?: { economy: string; climate: string; technology: string; foreignPolicy: string; healthcare: string };
  }) => Candidate;
  updatePresidentialCandidate: (id: string, updates: Partial<Candidate>) => void;
  deletePresidentialCandidate: (id: string) => void;
  addSenateCandidate: (data: { name: string; party: string; description?: string }) => LocalCandidate;
  updateSenateCandidate: (id: string, updates: Partial<LocalCandidate>) => void;
  deleteSenateCandidate: (id: string) => void;
  addMayoralCandidate: (data: { name: string; party: string; description?: string }) => LocalCandidate;
  updateMayoralCandidate: (id: string, updates: Partial<LocalCandidate>) => void;
  deleteMayoralCandidate: (id: string) => void;
  resetCandidatesToDefault: () => void;
  castBallot: (selections: BallotSelection) => Promise<BallotReceipt>;
  simulateIncomingReturns: () => void;
  setElectionPhase: (phase: ElectionPhase) => void;
  toggleAutoStreamingReturns: () => void;
  resetDemoData: () => void;
}

const VotingContext = createContext<VotingContextType | null>(null);

const STORAGE_KEYS = {
  VOTERS: 'aegisvote_voters_v4',
  CURRENT_USER_ID: 'aegisvote_current_user_id_v4',
  IS_ADMIN: 'aegisvote_is_admin_v4',
  RESULTS: 'aegisvote_results_v4',
  RECEIPTS: 'aegisvote_receipts_v4',
  UPDATES: 'aegisvote_updates_v4',
  PHASE: 'aegisvote_phase_v4',
  PRES_CANDIDATES: 'aegisvote_pres_candidates_v4',
  SEN_CANDIDATES: 'aegisvote_sen_candidates_v4',
  MAY_CANDIDATES: 'aegisvote_may_candidates_v4',
};

// Helper to normalize phone digits for flexible matching
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export const VotingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Voters list
  const [voters, setVoters] = useState<Voter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VOTERS);
      return stored ? JSON.parse(stored) : INITIAL_VOTERS;
    } catch {
      return INITIAL_VOTERS;
    }
  });

  // Dynamic Candidates Lists
  const [presidentialCandidates, setPresidentialCandidates] = useState<Candidate[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRES_CANDIDATES);
      return stored ? JSON.parse(stored) : PRESIDENTIAL_CANDIDATES;
    } catch {
      return PRESIDENTIAL_CANDIDATES;
    }
  });

  const [senateCandidates, setSenateCandidates] = useState<LocalCandidate[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SEN_CANDIDATES);
      return stored ? JSON.parse(stored) : SENATE_CANDIDATES;
    } catch {
      return SENATE_CANDIDATES;
    }
  });

  const [mayoralCandidates, setMayoralCandidates] = useState<LocalCandidate[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MAY_CANDIDATES);
      return stored ? JSON.parse(stored) : MAYORAL_CANDIDATES;
    } catch {
      return MAYORAL_CANDIDATES;
    }
  });

  // Current logged in voter ID
  const [currentVoterId, setCurrentVoterId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'voter-1';
    } catch {
      return 'voter-1';
    }
  });

  // Admin access state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  // Election phase
  const [electionPhase, setElectionPhaseState] = useState<ElectionPhase>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PHASE);
      return (stored as ElectionPhase) || 'ELECTION_DAY_LIVE';
    } catch {
      return 'ELECTION_DAY_LIVE';
    }
  });

  // Results
  const [results, setResults] = useState<ElectionResults>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESULTS);
      return stored ? JSON.parse(stored) : INITIAL_RESULTS;
    } catch {
      return INITIAL_RESULTS;
    }
  });

  // Audit Receipts
  const [auditReceipts, setAuditReceipts] = useState<BallotReceipt[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
      return stored ? JSON.parse(stored) : INITIAL_AUDIT_RECEIPTS;
    } catch {
      return INITIAL_AUDIT_RECEIPTS;
    }
  });

  // Live Updates
  const [liveUpdates, setLiveUpdates] = useState<LiveElectionUpdate[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.UPDATES);
      return stored ? JSON.parse(stored) : INITIAL_LIVE_UPDATES;
    } catch {
      return INITIAL_LIVE_UPDATES;
    }
  });

  const [isAutoStreamingReturns, setIsAutoStreamingReturns] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(voters));
    } catch {
      // Storage quota
    }
  }, [voters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRES_CANDIDATES, JSON.stringify(presidentialCandidates));
    } catch {
      // Storage quota
    }
  }, [presidentialCandidates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SEN_CANDIDATES, JSON.stringify(senateCandidates));
    } catch {
      // Storage quota
    }
  }, [senateCandidates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MAY_CANDIDATES, JSON.stringify(mayoralCandidates));
    } catch {
      // Storage quota
    }
  }, [mayoralCandidates]);

  useEffect(() => {
    try {
      if (currentVoterId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentVoterId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
      }
    } catch {
      // ignore
    }
  }, [currentVoterId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_ADMIN, isAdmin ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, [isAdmin]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
    } catch {
      // ignore
    }
  }, [results]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(auditReceipts));
    } catch {
      // ignore
    }
  }, [auditReceipts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.UPDATES, JSON.stringify(liveUpdates));
    } catch {
      // ignore
    }
  }, [liveUpdates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PHASE, electionPhase);
    } catch {
      // ignore
    }
  }, [electionPhase]);

  // Derived current voter
  const currentVoter = useMemo(() => {
    return voters.find((v) => v.id === currentVoterId) || null;
  }, [voters, currentVoterId]);

  const loginVoter = useCallback(
    (voterId: string, mobileNumber: string) => {
      const cleanId = voterId.trim().toUpperCase();
      const voter = voters.find(
        (v) => v.nationalVoterId.toUpperCase() === cleanId || v.id === cleanId.toLowerCase()
      );

      if (!voter) {
        return { success: false, error: 'Voter ID not recognized in global electorate register.' };
      }

      const inputDigits = normalizePhone(mobileNumber);
      const voterDigits = normalizePhone(voter.mobileNumber || '');

      const isMatch =
        inputDigits.length >= 4 &&
        (inputDigits === voterDigits ||
          voterDigits.endsWith(inputDigits) ||
          inputDigits.endsWith(voterDigits));

      if (!isMatch) {
        return {
          success: false,
          error: `Mobile number does not match registered voter records for ${voter.name}.`,
        };
      }

      setCurrentVoterId(voter.id);
      return { success: true };
    },
    [voters]
  );

  const adminLogin = useCallback((adminKey: string) => {
    const cleanKey = adminKey.trim().toLowerCase();
    if (
      cleanKey === 'admin2026' ||
      cleanKey === 'admin' ||
      cleanKey === 'electoral-commission' ||
      cleanKey === 'admin123'
    ) {
      setIsAdmin(true);
      return { success: true };
    }
    return {
      success: false,
      error: 'Invalid Administrator Security Key. (Demo Key: admin2026)',
    };
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdmin(false);
  }, []);

  const toggleAdminMode = useCallback(() => {
    setIsAdmin((prev) => !prev);
  }, []);

  const switchTestVoter = useCallback((voterId: string) => {
    setCurrentVoterId(voterId);
  }, []);

  const logoutVoter = useCallback(() => {
    setCurrentVoterId(null);
  }, []);

  // --- CANDIDATE INSERTION / CUSTOMIZATION METHODS ACCORDING TO USER'S WISH ---
  const addPresidentialCandidate = useCallback(
    (data: {
      name: string;
      party: string;
      runningMate?: string;
      biography?: string;
      photoUrl?: string;
      keyPriorities?: string[];
      stances?: { economy: string; climate: string; technology: string; foreignPolicy: string; healthcare: string };
    }) => {
      const newId = `cand-custom-${Date.now()}`;
      const defaultPriorities = [
        'Universal economic transparency and anti-corruption oversight',
        'Balanced tax reform and public infrastructure funding',
        'Strengthening civil rights and public education access',
      ];
      const defaultStances = {
        economy: 'Focus on domestic industrial investment, balanced budgets, and middle-class support.',
        climate: 'Pragmatic clean energy transitions and environmental stewardship.',
        technology: 'Fostering competitive innovation while protecting consumer digital privacy.',
        foreignPolicy: 'Multilateral diplomatic alliances and consular protections for citizens abroad.',
        healthcare: 'Affordable prescription access and expanded local medical infrastructure.',
      };

      const newCandidate: Candidate = {
        id: newId,
        name: data.name.trim(),
        runningMate: data.runningMate?.trim() || 'Nomination in Progress',
        office: 'President & Vice President',
        party: data.party.trim(),
        partyColor: 'bg-indigo-600',
        photoUrl:
          data.photoUrl ||
          '/src/assets/images/candidate_maria_santos_1793898743046.jpg',
        biography:
          data.biography?.trim() ||
          `${data.name.trim()} was nominated to represent ${data.party.trim()} in the 2026 General Election, advocating for civic revitalization and global voter empowerment.`,
        keyPriorities: data.keyPriorities && data.keyPriorities.length > 0 ? data.keyPriorities : defaultPriorities,
        stances: data.stances || defaultStances,
        endorsements: ['Citizens for Good Governance', 'Independent Voter Coalition'],
      };

      setPresidentialCandidates((prev) => [...prev, newCandidate]);

      // Initialize vote count in results
      setResults((prev) => ({
        ...prev,
        candidateVotes: {
          ...prev.candidateVotes,
          [newId]: 0,
        },
      }));

      // Broadcast news announcement
      const update: LiveElectionUpdate = {
        id: `upd-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeLabel: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC',
        headline: `Candidate Nominated: ${data.name.trim()} Added to Official Ballot`,
        body: `${data.name.trim()} has been accredited for the President & Vice President race under the ${data.party.trim()} ticket.`,
        category: 'announcement',
      };
      setLiveUpdates((prev) => [update, ...prev]);

      return newCandidate;
    },
    []
  );

  const updatePresidentialCandidate = useCallback((id: string, updates: Partial<Candidate>) => {
    setPresidentialCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    if (updates.name) {
      const update: LiveElectionUpdate = {
        id: `upd-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeLabel: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC',
        headline: `Ballot Updated: Candidate Slate Modified`,
        body: `Official certification amended for candidate ${updates.name}.`,
        category: 'announcement',
      };
      setLiveUpdates((prev) => [update, ...prev]);
    }
  }, []);

  const deletePresidentialCandidate = useCallback((id: string) => {
    setPresidentialCandidates((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addSenateCandidate = useCallback(
    (data: { name: string; party: string; description?: string }) => {
      const newId = `sen-custom-${Date.now()}`;
      const newCand: LocalCandidate = {
        id: newId,
        name: data.name.trim(),
        party: data.party.trim(),
        office: 'Senate / Global Representative (Seat A)',
        description:
          data.description?.trim() ||
          `Candidate nominated for Senate Representative Seat A under ${data.party.trim()}.`,
      };

      setSenateCandidates((prev) => [...prev, newCand]);

      setResults((prev) => ({
        ...prev,
        senateVotes: {
          ...prev.senateVotes,
          [newId]: 0,
        },
      }));

      return newCand;
    },
    []
  );

  const updateSenateCandidate = useCallback((id: string, updates: Partial<LocalCandidate>) => {
    setSenateCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteSenateCandidate = useCallback((id: string) => {
    setSenateCandidates((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addMayoralCandidate = useCallback(
    (data: { name: string; party: string; description?: string }) => {
      const newId = `may-custom-${Date.now()}`;
      const newCand: LocalCandidate = {
        id: newId,
        name: data.name.trim(),
        party: data.party.trim(),
        office: 'Metropolitan Mayor',
        description:
          data.description?.trim() ||
          `Candidate contesting the mayoral election on behalf of ${data.party.trim()}.`,
      };

      setMayoralCandidates((prev) => [...prev, newCand]);
      return newCand;
    },
    []
  );

  const updateMayoralCandidate = useCallback((id: string, updates: Partial<LocalCandidate>) => {
    setMayoralCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteMayoralCandidate = useCallback((id: string) => {
    setMayoralCandidates((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const resetCandidatesToDefault = useCallback(() => {
    setPresidentialCandidates(PRESIDENTIAL_CANDIDATES);
    setSenateCandidates(SENATE_CANDIDATES);
    setMayoralCandidates(MAYORAL_CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.PRES_CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.SEN_CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.MAY_CANDIDATES);
  }, []);

  const registerVoter = useCallback(
    (data: {
      name: string;
      email: string;
      mobileNumber: string;
      country: string;
      city: string;
      residenceType: ResidenceType;
      passportLast4: string;
    }) => {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const countryCode = data.country.slice(0, 2).toUpperCase() || 'GL';
      const nationalId = `VTR-2026-${randomSuffix}-${countryCode}`;

      let jurisdictionDesc = `Overseas Citizen Division - ${data.country}`;
      if (data.residenceType === 'military_deployed') {
        jurisdictionDesc = `Armed Forces & Diplomatic Overseas Unit`;
      } else if (data.residenceType === 'domestic') {
        jurisdictionDesc = `Domestic Electoral District - ${data.city}`;
      }

      const newVoter: Voter = {
        id: `voter-${Date.now()}`,
        nationalVoterId: nationalId,
        name: data.name.trim(),
        email: data.email.trim(),
        mobileNumber: data.mobileNumber.trim(),
        country: data.country,
        city: data.city.trim(),
        residenceType: data.residenceType,
        jurisdiction: jurisdictionDesc,
        registrationStatus: 'verified',
        hasVoted: false,
        votedAt: null,
        ballotReceiptHash: null,
        ballotTimestamp: null,
        passportLast4: data.passportLast4.trim(),
      };

      setVoters((prev) => [newVoter, ...prev]);
      setCurrentVoterId(newVoter.id);

      // Add a live ticker announcement
      const update: LiveElectionUpdate = {
        id: `upd-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeLabel: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC',
        headline: `New Verified Voter Credential Issued in ${data.country}`,
        body: `Citizen authenticated via mobile phone and registered in ${jurisdictionDesc}.`,
        category: 'announcement',
      };
      setLiveUpdates((prev) => [update, ...prev]);

      return newVoter;
    },
    []
  );

  const castBallot = useCallback(
    async (selections: BallotSelection): Promise<BallotReceipt> => {
      if (!currentVoter) {
        throw new Error('You must be signed in with your Voter ID & Mobile Number to submit a ballot.');
      }
      if (currentVoter.hasVoted) {
        throw new Error('This voter credential has already cast a ballot. One ballot per eligible voter is enforced.');
      }

      const now = new Date();
      const isoTimestamp = now.toISOString();
      const formattedTimestamp = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
      const timeLabel = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';

      // Generate cryptographically verifiable hash
      const selectionSalt = Math.random().toString(36).substring(2, 15);
      const ballotHash = await generateBallotHash({
        voterId: currentVoter.nationalVoterId,
        timestamp: isoTimestamp,
        precinct: currentVoter.jurisdiction,
        selectionSalt,
      });

      const receiptId = `RCP-${Math.floor(100000 + Math.random() * 900000)}`;
      const latestBlockHeight = (auditReceipts[0]?.blockHeight || 142100) + 1;

      const receipt: BallotReceipt = {
        receiptId,
        ballotHash,
        blockHeight: latestBlockHeight,
        timestamp: formattedTimestamp,
        precinct: currentVoter.jurisdiction,
        voterMaskedId: formatVoterIdMasked(currentVoter.nationalVoterId),
        auditStatus: 'Verified & Tallied',
        selectionsMaskedCount:
          (selections.presidentialCandidateId ? 1 : 0) +
          (selections.senateCandidateId ? 1 : 0) +
          (selections.mayoralCandidateId ? 1 : 0) +
          Object.keys(selections.measureVotes).length,
      };

      // 1. Update voter state
      setVoters((prev) =>
        prev.map((v) =>
          v.id === currentVoter.id
            ? {
                ...v,
                hasVoted: true,
                votedAt: isoTimestamp,
                ballotReceiptHash: ballotHash,
                ballotTimestamp: formattedTimestamp,
              }
            : v
        )
      );

      // 2. Prepend audit receipt
      setAuditReceipts((prev) => [receipt, ...prev]);

      // 3. Increment election tallies
      setResults((prev) => {
        const nextCandidateVotes = { ...prev.candidateVotes };
        if (selections.presidentialCandidateId) {
          nextCandidateVotes[selections.presidentialCandidateId] =
            (nextCandidateVotes[selections.presidentialCandidateId] || 0) + 1;
        }

        const nextSenateVotes = { ...prev.senateVotes };
        if (selections.senateCandidateId) {
          nextSenateVotes[selections.senateCandidateId] =
            (nextSenateVotes[selections.senateCandidateId] || 0) + 1;
        }

        const nextMeasureVotes = { ...prev.measureVotes };
        Object.entries(selections.measureVotes).forEach(([measureId, vote]) => {
          if (!nextMeasureVotes[measureId]) {
            nextMeasureVotes[measureId] = { yes: 0, no: 0, abstain: 0 };
          }
          nextMeasureVotes[measureId][vote] = (nextMeasureVotes[measureId][vote] || 0) + 1;
        });

        return {
          ...prev,
          totalVotesCast: prev.totalVotesCast + 1,
          candidateVotes: nextCandidateVotes,
          senateVotes: nextSenateVotes,
          measureVotes: nextMeasureVotes,
        };
      });

      // 4. Post Live Wire Notice
      const update: LiveElectionUpdate = {
        id: `upd-${Date.now()}`,
        timestamp: isoTimestamp,
        timeLabel,
        headline: `Encrypted Ballot Verified from ${currentVoter.city}, ${currentVoter.country}`,
        body: `Cryptographic receipt ${ballotHash.slice(0, 16)}... committed to public zero-knowledge audit chain.`,
        category: 'security',
      };
      setLiveUpdates((prev) => [update, ...prev]);

      return receipt;
    },
    [currentVoter, auditReceipts]
  );

  const simulateIncomingReturns = useCallback(() => {
    setResults((prev) => {
      const addedVotes = Math.floor(18000 + Math.random() * 24000);
      const addedPrecincts = Math.min(prev.totalPrecincts - prev.precinctsReporting, Math.floor(8 + Math.random() * 12));

      // Dynamically distribute votes among current active presidential candidates
      const nextCandidateVotes = { ...prev.candidateVotes };
      const candCount = presidentialCandidates.length;

      if (candCount > 0) {
        let remaining = addedVotes;
        presidentialCandidates.forEach((c, index) => {
          if (index === candCount - 1) {
            nextCandidateVotes[c.id] = (nextCandidateVotes[c.id] || 0) + remaining;
          } else {
            const share = Math.round(addedVotes * (0.85 / candCount + (index % 2 === 0 ? 0.04 : -0.02)));
            const allocated = Math.min(remaining, Math.max(100, share));
            nextCandidateVotes[c.id] = (nextCandidateVotes[c.id] || 0) + allocated;
            remaining -= allocated;
          }
        });
      }

      // Dynamically distribute senate votes
      const nextSenateVotes = { ...prev.senateVotes };
      if (senateCandidates.length > 0) {
        let senRemaining = addedVotes;
        senateCandidates.forEach((s, index) => {
          if (index === senateCandidates.length - 1) {
            nextSenateVotes[s.id] = (nextSenateVotes[s.id] || 0) + senRemaining;
          } else {
            const allocated = Math.round(addedVotes / senateCandidates.length);
            nextSenateVotes[s.id] = (nextSenateVotes[s.id] || 0) + allocated;
            senRemaining -= allocated;
          }
        });
      }

      const prop101YesAdded = Math.round(addedVotes * (0.57 + Math.random() * 0.04));
      const prop101NoAdded = addedVotes - prop101YesAdded;

      const prop102YesAdded = Math.round(addedVotes * (0.63 + Math.random() * 0.04));
      const prop102NoAdded = addedVotes - prop102YesAdded;

      const nextMeasureVotes = {
        ...prev.measureVotes,
        'prop-101': {
          yes: (prev.measureVotes['prop-101']?.yes || 0) + prop101YesAdded,
          no: (prev.measureVotes['prop-101']?.no || 0) + prop101NoAdded,
          abstain: prev.measureVotes['prop-101']?.abstain || 0,
        },
        'prop-102': {
          yes: (prev.measureVotes['prop-102']?.yes || 0) + prop102YesAdded,
          no: (prev.measureVotes['prop-102']?.no || 0) + prop102NoAdded,
          abstain: prev.measureVotes['prop-102']?.abstain || 0,
        },
      };

      const updatedRegional = prev.regionalTurnout.map((reg) => {
        const addedReg = Math.round(addedVotes / prev.regionalTurnout.length);
        const newCounted = reg.votesCounted + addedReg;
        return {
          ...reg,
          votesCounted: newCounted,
          turnoutPct: Math.min(99.4, +((newCounted / reg.totalRegistered) * 100).toFixed(1)),
        };
      });

      return {
        ...prev,
        totalVotesCast: prev.totalVotesCast + addedVotes,
        precinctsReporting: Math.min(prev.totalPrecincts, prev.precinctsReporting + addedPrecincts),
        candidateVotes: nextCandidateVotes,
        senateVotes: nextSenateVotes,
        measureVotes: nextMeasureVotes,
        regionalTurnout: updatedRegional,
      };
    });

    const now = new Date();
    const timeLabel = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
    const cities = ['Berlin', 'Tokyo', 'Sydney', 'Geneva', 'Toronto', 'Singapore', 'London', 'Seoul'];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];

    const update: LiveElectionUpdate = {
      id: `upd-${Date.now()}`,
      timestamp: now.toISOString(),
      timeLabel,
      headline: `Official Tabulation: Overseas Center in ${randomCity} Completes Verification`,
      body: `Encrypted batch cryptographic tally logged into central administrator dashboard.`,
      category: 'turnout',
    };

    setLiveUpdates((prev) => [update, ...prev.slice(0, 15)]);
  }, [presidentialCandidates, senateCandidates]);

  // Periodic simulated live stream when enabled by Admin
  useEffect(() => {
    if (!isAutoStreamingReturns) return;
    const interval = setInterval(() => {
      simulateIncomingReturns();
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoStreamingReturns, simulateIncomingReturns]);

  const toggleAutoStreamingReturns = useCallback(() => {
    setIsAutoStreamingReturns((prev) => !prev);
  }, []);

  const setElectionPhase = useCallback((phase: ElectionPhase) => {
    setElectionPhaseState(phase);
  }, []);

  const resetDemoData = useCallback(() => {
    setVoters(INITIAL_VOTERS);
    setPresidentialCandidates(PRESIDENTIAL_CANDIDATES);
    setSenateCandidates(SENATE_CANDIDATES);
    setMayoralCandidates(MAYORAL_CANDIDATES);
    setCurrentVoterId('voter-1');
    setIsAdmin(false);
    setResults(INITIAL_RESULTS);
    setAuditReceipts(INITIAL_AUDIT_RECEIPTS);
    setLiveUpdates(INITIAL_LIVE_UPDATES);
    setElectionPhaseState('ELECTION_DAY_LIVE');
    setIsAutoStreamingReturns(false);
    localStorage.clear();
  }, []);

  return (
    <VotingContext.Provider
      value={{
        currentVoter,
        voters,
        isAdmin,
        electionPhase,
        results,
        auditReceipts,
        liveUpdates,
        isAutoStreamingReturns,
        presidentialCandidates,
        senateCandidates,
        mayoralCandidates,
        loginVoter,
        switchTestVoter,
        logoutVoter,
        adminLogin,
        adminLogout,
        toggleAdminMode,
        registerVoter,
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
        castBallot,
        simulateIncomingReturns,
        setElectionPhase,
        toggleAutoStreamingReturns,
        resetDemoData,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

export function useVoting(): VotingContextType {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
}
