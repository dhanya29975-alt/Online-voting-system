import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { X, ShieldCheck, Globe, Phone, UserCheck, Lock, CheckCircle2 } from 'lucide-react';
import { ResidenceType } from '../types/voting';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { loginVoter, registerVoter, adminLogin, voters, isAdmin, adminLogout } = useVoting();
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginMobile, setLoginMobile] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regCountry, setRegCountry] = useState('United Kingdom');
  const [regCity, setRegCity] = useState('');
  const [regType, setRegType] = useState<ResidenceType>('overseas_expat');
  const [regPassport, setRegPassport] = useState('');
  const [registeredSuccessMsg, setRegisteredSuccessMsg] = useState('');

  // Admin form state
  const [adminKey, setAdminKey] = useState('');
  const [adminError, setAdminError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const result = loginVoter(loginId, loginMobile);
    if (result.success) {
      onClose();
    } else {
      setLoginError(result.error || 'Authentication failed. Please verify Voter ID and Mobile Number.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regMobile.trim() || !regCity.trim()) {
      return;
    }
    const newVoter = registerVoter({
      name: regName,
      email: regEmail,
      mobileNumber: regMobile,
      country: regCountry,
      city: regCity,
      residenceType: regType,
      passportLast4: regPassport || '5501',
    });

    setRegisteredSuccessMsg(`Verified Elector! Your Voter ID is ${newVoter.nationalVoterId}`);
    setTimeout(() => {
      onClose();
      setRegisteredSuccessMsg('');
    }, 1200);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const result = adminLogin(adminKey);
    if (result.success) {
      onClose();
    } else {
      setAdminError(result.error || 'Invalid Admin Key');
    }
  };

  const fillQuickLogin = (id: string, mobile: string) => {
    setLoginId(id);
    setLoginMobile(mobile);
    setLoginError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm tracking-tight text-white">Global Voter Portal</h3>
              <p className="text-[11px] text-stone-400">Official Election Accreditation & Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 bg-stone-50 text-xs">
          <button
            onClick={() => {
              setMode('login');
              setLoginError('');
            }}
            className={`flex-1 py-3 font-semibold text-center transition-colors ${
              mode === 'login'
                ? 'bg-white text-stone-950 border-b-2 border-indigo-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Voter Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setLoginError('');
            }}
            className={`flex-1 py-3 font-semibold text-center transition-colors ${
              mode === 'register'
                ? 'bg-white text-stone-950 border-b-2 border-indigo-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Register Voter
          </button>
          <button
            onClick={() => {
              setMode('admin');
              setAdminError('');
            }}
            className={`flex-1 py-3 font-semibold text-center transition-colors flex items-center justify-center gap-1 ${
              mode === 'admin'
                ? 'bg-white text-stone-950 border-b-2 border-indigo-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock className="w-3 h-3 text-stone-400" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6">
          {/* TAB 1: VOTER LOGIN VIA VOTER ID + MOBILE NUMBER */}
          {mode === 'login' && (
            <div>
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    National / Global Voter ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. VTR-2026-9812-GL"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-indigo-600 font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Your unique accredited electoral identifier
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="e.g. +41 79 555 0192 or 0795550192"
                      value={loginMobile}
                      onChange={(e) => setLoginMobile(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-indigo-600 font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    The mobile phone number registered on your voter file
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-900 hover:bg-indigo-800 text-white font-medium text-sm rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Authenticate & Enter Ballot Station</span>
                </button>
              </form>

              {/* Instant Test Credentials Switcher */}
              <div className="mt-5 pt-4 border-t border-stone-100">
                <span className="text-[11px] uppercase font-semibold text-stone-400 block mb-2">
                  1-Click Test Voter Accounts (Click to Pre-fill):
                </span>
                <div className="space-y-1.5 text-xs">
                  {voters.slice(0, 3).map((voter) => (
                    <button
                      key={voter.id}
                      type="button"
                      onClick={() => fillQuickLogin(voter.nationalVoterId, voter.mobileNumber)}
                      className="w-full p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded text-left flex items-center justify-between text-stone-700"
                    >
                      <div>
                        <span className="font-semibold">{voter.name}</span>{' '}
                        <span className="text-stone-500 font-mono text-[11px]">({voter.nationalVoterId})</span>
                        <div className="text-[10px] text-stone-500">
                          Mobile: <span className="font-mono text-stone-700">{voter.mobileNumber}</span> · {voter.hasVoted ? 'Voted' : 'Ready'}
                        </div>
                      </div>
                      <span className="text-[11px] text-indigo-700 font-medium">Use</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER VOTER WITH VOTER ID & MOBILE NUMBER */}
          {mode === 'register' && (
            <div>
              {registeredSuccessMsg ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-bold text-sm">{registeredSuccessMsg}</div>
                  <p className="text-xs text-emerald-700">
                    Your account is paired with your mobile number. Loading your ballot now...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Julian K. Mercer"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Registered Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
                        <input
                          type="tel"
                          placeholder="+1 555-0199"
                          value={regMobile}
                          onChange={(e) => setRegMobile(e.target.value)}
                          required
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-indigo-600 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Official Email
                      </label>
                      <input
                        type="email"
                        placeholder="voter@domain.org"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Current Country
                      </label>
                      <select
                        value={regCountry}
                        onChange={(e) => setRegCountry(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-indigo-600"
                      >
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Switzerland">Switzerland</option>
                        <option value="Japan">Japan</option>
                        <option value="Germany">Germany</option>
                        <option value="Australia">Australia</option>
                        <option value="Canada">Canada</option>
                        <option value="United States">United States</option>
                        <option value="France">France</option>
                        <option value="Singapore">Singapore</option>
                        <option value="India">India</option>
                        <option value="Brazil">Brazil</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        City / Municipality
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. London / Melbourne / Toronto"
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Passport / National ID (Last 4)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="8419"
                        value={regPassport}
                        onChange={(e) => setRegPassport(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-indigo-600 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Citizen Classification
                    </label>
                    <select
                      value={regType}
                      onChange={(e) => setRegType(e.target.value as ResidenceType)}
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-indigo-600"
                    >
                      <option value="overseas_expat">Overseas Expatriate Citizen (Working / Studying Abroad)</option>
                      <option value="military_deployed">Military / Armed Forces Deployed Overseas</option>
                      <option value="diplomatic_corps">Diplomatic & Consular Mission Personnel</option>
                      <option value="domestic">Domestic Resident (In-Country Precinct)</option>
                    </select>
                  </div>

                  <div className="p-2.5 bg-stone-50 rounded border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
                    <Globe className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                    <span>
                      Registration issues an official Voter ID. On election day, log in using your Voter ID and Mobile Number.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-indigo-900 hover:bg-indigo-800 text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
                  >
                    Submit Registration & Generate Global Voter ID
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: ADMIN ACCESS TO VIEW VOTING RATES */}
          {mode === 'admin' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <span className="font-bold block mb-1">Restricted Election Commission Portal</span>
                Only accredited election administrators are authorized to monitor live voting rates, precinct return batches, and tabulation statistics.
              </div>

              {isAdmin ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Administrator Mode Active</span>
                  </div>
                  <p>
                    You currently have full clearance to inspect real-time voting rates, candidate distributions, and tabulation telemetry.
                  </p>
                  <button
                    onClick={() => {
                      adminLogout();
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-semibold"
                  >
                    Exit Administrator Mode
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAdminAuth} className="space-y-4">
                  {adminError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
                      {adminError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Administrator Security Key
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        placeholder="Enter admin security key (e.g. admin2026)"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-indigo-600 font-mono"
                      />
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      Demo clearance key: <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-800">admin2026</code>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-lg transition-colors"
                    >
                      Verify Administrator Credentials
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        adminLogin('admin2026');
                        onClose();
                      }}
                      className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-lg border border-indigo-200"
                    >
                      1-Click Admin Access
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
