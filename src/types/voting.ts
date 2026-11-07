export type ResidenceType = 'overseas_expat' | 'military_deployed' | 'diplomatic_corps' | 'domestic';

export interface Voter {
  id: string;
  nationalVoterId: string;
  name: string;
  email: string;
  mobileNumber: string;
  country: string;
  city: string;
  residenceType: ResidenceType;
  jurisdiction: string;
  registrationStatus: 'verified' | 'pending';
  hasVoted: boolean;
  votedAt: string | null;
  ballotReceiptHash: string | null;
  ballotTimestamp: string | null;
  voterPin?: string;
  passportLast4: string;
  isAdmin?: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  runningMate: string;
  office: string;
  party: string;
  partyColor: string;
  photoUrl: string;
  biography: string;
  keyPriorities: string[];
  stances: {
    economy: string;
    climate: string;
    technology: string;
    foreignPolicy: string;
    healthcare: string;
  };
  endorsements: string[];
}

export interface LocalCandidate {
  id: string;
  name: string;
  party: string;
  office: string;
  description: string;
}

export interface BallotMeasure {
  id: string;
  code: string;
  title: string;
  summary: string;
  fullText: string;
  fiscalImpact: string;
  proArguments: string[];
  conArguments: string[];
  threshold: string;
  sponsor: string;
}

export interface BallotSelection {
  presidentialCandidateId: string | null;
  senateCandidateId: string | null;
  mayoralCandidateId: string | null;
  measureVotes: Record<string, 'yes' | 'no' | 'abstain'>;
}

export interface BallotReceipt {
  receiptId: string;
  ballotHash: string;
  blockHeight: number;
  timestamp: string;
  precinct: string;
  voterMaskedId: string;
  auditStatus: 'Verified & Tallied';
  selectionsMaskedCount: number;
}

export type ElectionPhase = 'REGISTRATION_OPEN' | 'ELECTION_DAY_LIVE' | 'POLLS_CLOSING' | 'CERTIFIED';

export interface LiveElectionUpdate {
  id: string;
  timestamp: string;
  timeLabel: string;
  headline: string;
  body: string;
  category: 'turnout' | 'precinct_call' | 'announcement' | 'security';
}

export interface RegionalTurnout {
  region: string;
  flag: string;
  turnoutPct: number;
  votesCounted: number;
  totalRegistered: number;
}

export interface ElectionResults {
  totalEligibleVoters: number;
  totalVotesCast: number;
  precinctsReporting: number;
  totalPrecincts: number;
  candidateVotes: Record<string, number>;
  senateVotes: Record<string, number>;
  measureVotes: Record<string, { yes: number; no: number; abstain: number }>;
  regionalTurnout: RegionalTurnout[];
}
