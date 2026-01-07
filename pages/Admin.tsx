import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getOverviewStats,
  getAllUsersWithMetrics,
  getUserMessages,
  OverviewStats,
  UserMetrics,
  ChatMessage
} from '../lib/admin-queries';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [users, setUsers] = useState<UserMetrics[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userMessages, setUserMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [statsData, usersData] = await Promise.all([
      getOverviewStats(),
      getAllUsersWithMetrics()
    ]);
    setStats(statsData);
    setUsers(usersData);
    setIsLoading(false);
  };

  const handleUserClick = async (email: string) => {
    if (expandedUser === email) {
      setExpandedUser(null);
      setUserMessages([]);
      return;
    }

    setExpandedUser(email);
    setMessagesLoading(true);
    const messages = await getUserMessages(email);
    setUserMessages(messages);
    setMessagesLoading(false);
  };

  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const feedbackPercent = stats
    ? Math.round((stats.positiveRatings / (stats.positiveRatings + stats.negativeRatings || 1)) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-28 px-5 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">User metrics and activity</p>
        </div>
        <button
          onClick={() => navigate('/account')}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">arrow_back</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">group</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total Users</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">forum</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalSessions || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Sessions</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">chat</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalMessages || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Messages</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">thumb_up</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{feedbackPercent}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Positive</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">User Activity ({filteredUsers.length})</h3>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">inbox</span>
            <p className="text-slate-500 dark:text-slate-400">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredUsers.map((user) => (
              <div key={user.email}>
                <button
                  onClick={() => handleUserClick(user.email)}
                  className="w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatTimeAgo(user.lastActive)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.sessionCount}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Sessions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.messageCount}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Messages</p>
                      </div>
                      <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedUser === user.email ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded Messages */}
                {expandedUser === user.email && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                    {messagesLoading ? (
                      <div className="p-6 flex justify-center">
                        <span className="material-symbols-outlined text-2xl text-primary animate-spin">progress_activity</span>
                      </div>
                    ) : userMessages.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">No messages found</p>
                      </div>
                    ) : (
                      <div className="p-4 max-h-96 overflow-y-auto space-y-3">
                        {userMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-xl ${
                              msg.role === 'user'
                                ? 'bg-primary/10 dark:bg-primary/20 ml-8'
                                : 'bg-white dark:bg-slate-800 mr-8 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-semibold ${
                                msg.role === 'user' ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
                              }`}>
                                {msg.role === 'user' ? 'User' : 'Assistant'}
                              </span>
                              <span className="text-[10px] text-slate-400">{formatDate(msg.createdAt)}</span>
                              {msg.confidence && (
                                <span className="text-[10px] text-slate-400 ml-auto">
                                  Confidence: {Math.round(msg.confidence * 100)}%
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap line-clamp-4">
                              {msg.content}
                            </p>
                            {msg.citations && msg.citations.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {msg.citations.map((citation, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400">
                                    {citation}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">refresh</span>
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default Admin;
