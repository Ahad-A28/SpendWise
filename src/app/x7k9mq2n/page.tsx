'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Coins, Lock, Unlock, RefreshCw, Plus, Zap, Activity, AlertTriangle, CheckCircle, Eye, EyeOff, Search, User, FileText, X } from 'lucide-react';

interface AdminUserStats {
  userId: string;
  name: string;
  email: string;
  imageUrl?: string;
  credits: number;
  requestCount: number;
  isLocked: boolean;
  isRateLimited: boolean;
  rateLimitRemainingMinutes: number;
  chatCost: number;
  agentCost: number;
  fileCost: number;
}

interface CreditLog {
  _id: string;
  action: string;
  amount: number;
  details: string;
  createdAt: string;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"));

export default function SecretAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [users, setUsers] = useState<AdminUserStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customCreditsMap, setCustomCreditsMap] = useState<Record<string, string>>({});
  const [customChatCostMap, setCustomChatCostMap] = useState<Record<string, string>>({});
  const [customAgentCostMap, setCustomAgentCostMap] = useState<Record<string, string>>({});
  const [customFileCostMap, setCustomFileCostMap] = useState<Record<string, string>>({});
  const [viewLogsUserId, setViewLogsUserId] = useState<string | null>(null);
  const [userLogs, setUserLogs] = useState<CreditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('adminAuthToken');
    }
    return null;
  });

  useEffect(() => {
    if (authToken && !isAuthenticated) {
      setIsAuthenticated(true);
    }
  }, [authToken, isAuthenticated]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const token = btoa(`${loginUsername}:${loginPassword}`);
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Basic ${token}` },
      });
      if (res.status === 401) {
        setLoginError('Invalid username or password.');
        return;
      }
      const data = await res.json();
      setAuthToken(token);
      sessionStorage.setItem('adminAuthToken', token);
      setUsers(Array.isArray(data) ? data : []);
      setIsAuthenticated(true);
    } catch {
      setLoginError('Cannot connect to server. Is the backend running?');
    }
  };

  const fetchStats = async () => {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Basic ${authToken}` },
      });
      if (!res.ok) { setIsAuthenticated(false); return; }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const sendAction = async (userId: string, action: string, value?: number) => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${authToken}` },
        body: JSON.stringify({ action, value }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Action applied successfully!', 'success');
        fetchStats();
      } else {
        showToast('Action failed.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async (userId: string) => {
    if (!authToken) return;
    setIsLoading(true);
    setViewLogsUserId(userId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/credit-logs`, {
        headers: { Authorization: `Basic ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserLogs(data);
      } else {
        showToast('Failed to fetch logs', 'error');
      }
    } catch {
      showToast('Error connecting to server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Access</h1>
            <p className="text-sm text-slate-500 mt-1">Restricted Area — Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Enter admin username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Enter admin password"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />{loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 mt-2"
            >
              Login to Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 p-4 sm:p-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <Shield className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Admin User Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage user AI credits, lock status & monitor activity</p>
        </div>
        <div className="sm:ml-auto flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchStats} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => { setIsAuthenticated(false); setAuthToken(null); sessionStorage.removeItem('adminAuthToken'); setUsers([]); }}
              className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-sm font-bold transition-all">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <User className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-semibold">No users found</p>
            <p className="text-sm">Try adjusting your search query</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.userId} className={`flex flex-col bg-white dark:bg-slate-900 rounded-3xl border transition-all hover:shadow-lg ${user.isLocked ? 'border-rose-300 dark:border-rose-900/50' : 'border-slate-200 dark:border-slate-800'}`}>
              
              {/* Card Header (User Info) */}
              <div className="p-5 flex items-start gap-4 border-b border-slate-100 dark:border-slate-800/50">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.name} className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{user.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate mt-1">{user.userId}</p>
                </div>
                {user.isLocked && (
                  <div className="shrink-0 p-1.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg" title="Bot is Locked">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800/50">
                <div className="p-4 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">
                    <Coins className="w-3.5 h-3.5 text-amber-500" /> Credits
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">{user.credits.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">
                    <Activity className="w-3.5 h-3.5 text-indigo-500" /> Req (5H)
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {user.requestCount}<span className="text-sm font-normal text-slate-400">/500</span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/50 flex justify-end">
                <button 
                  onClick={() => fetchLogs(user.userId)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> View Logs
                </button>
              </div>

              {/* Rate Limit Warning */}
              {user.isRateLimited && (
                <div className="px-5 py-3 bg-orange-50 dark:bg-orange-950/30 border-y border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-orange-700 dark:text-orange-400">
                    <Zap className="w-4 h-4" /> Rate Limited ({user.rateLimitRemainingMinutes}m)
                  </div>
                  <button onClick={() => sendAction(user.userId, 'resetRateLimit')} disabled={isLoading}
                    className="text-[10px] px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded font-bold transition-all">
                    Reset
                  </button>
                </div>
              )}

              {/* Actions Footer */}
              <div className="p-4 flex flex-col gap-3 mt-auto bg-slate-50/50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50">
                
                {/* Custom Credits */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex flex-1 gap-2">
                    <input type="number" min="0" placeholder="Set Credits" 
                      value={customCreditsMap[user.userId] || ''} 
                      onChange={e => setCustomCreditsMap({...customCreditsMap, [user.userId]: e.target.value})} 
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    <button onClick={() => {
                        if(customCreditsMap[user.userId]) {
                          sendAction(user.userId, 'setCredits', Number(customCreditsMap[user.userId]));
                          setCustomCreditsMap({...customCreditsMap, [user.userId]: ''});
                        }
                      }} disabled={isLoading || !customCreditsMap[user.userId]}
                      className="shrink-0 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-50">
                      Set
                    </button>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => sendAction(user.userId, 'addCredits', 1000)} disabled={isLoading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold transition-all">
                      <Plus className="w-3 h-3" /> 1K
                    </button>
                    <button onClick={() => sendAction(user.userId, 'addCredits', 5000)} disabled={isLoading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold transition-all">
                      <Plus className="w-3 h-3" /> 5K
                    </button>
                  </div>
                </div>

                {/* Custom Costs */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500">Chat Cost ({user.chatCost})</span>
                    <div className="flex gap-1">
                      <input type="number" min="0" placeholder="Cost" 
                        value={customChatCostMap[user.userId] || ''} 
                        onChange={e => setCustomChatCostMap({...customChatCostMap, [user.userId]: e.target.value})} 
                        className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      <button onClick={() => {
                          if(customChatCostMap[user.userId]) {
                            sendAction(user.userId, 'setChatCost', Number(customChatCostMap[user.userId]));
                            setCustomChatCostMap({...customChatCostMap, [user.userId]: ''});
                          }
                        }} disabled={isLoading || !customChatCostMap[user.userId]}
                        className="shrink-0 px-2 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold disabled:opacity-50">
                        Set
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500">Agent Cost ({user.agentCost})</span>
                    <div className="flex gap-1">
                      <input type="number" min="0" placeholder="Cost" 
                        value={customAgentCostMap[user.userId] || ''} 
                        onChange={e => setCustomAgentCostMap({...customAgentCostMap, [user.userId]: e.target.value})} 
                        className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500" />
                      <button onClick={() => {
                          if(customAgentCostMap[user.userId]) {
                            sendAction(user.userId, 'setAgentCost', Number(customAgentCostMap[user.userId]));
                            setCustomAgentCostMap({...customAgentCostMap, [user.userId]: ''});
                          }
                        }} disabled={isLoading || !customAgentCostMap[user.userId]}
                        className="shrink-0 px-2 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold disabled:opacity-50">
                        Set
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-500">File Cost ({user.fileCost})</span>
                    <div className="flex gap-1">
                      <input type="number" min="0" placeholder="Cost" 
                        value={customFileCostMap[user.userId] || ''} 
                        onChange={e => setCustomFileCostMap({...customFileCostMap, [user.userId]: e.target.value})} 
                        className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500" />
                      <button onClick={() => {
                          if(customFileCostMap[user.userId]) {
                            sendAction(user.userId, 'setFileCost', Number(customFileCostMap[user.userId]));
                            setCustomFileCostMap({...customFileCostMap, [user.userId]: ''});
                          }
                        }} disabled={isLoading || !customFileCostMap[user.userId]}
                        className="shrink-0 px-2 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold disabled:opacity-50">
                        Set
                      </button>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => sendAction(user.userId, 'setLocked', user.isLocked ? 0 : 1)}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all mt-1 ${
                    user.isLocked 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                >
                  {user.isLocked ? <><Unlock className="w-4 h-4" /> Unlock Bot</> : <><Lock className="w-4 h-4" /> Lock Bot</>}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Logs Modal */}
      {viewLogsUserId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" /> Credit Logs
              </h3>
              <button onClick={() => setViewLogsUserId(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {isLoading && userLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Loading logs...</div>
              ) : userLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No logs found for this user.</div>
              ) : (
                <div className="space-y-3">
                  {userLogs.map(log => (
                    <div key={log._id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{log.action}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${log.action === 'Admin Update' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                            {log.amount > 0 ? log.amount : 0} Cr
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
