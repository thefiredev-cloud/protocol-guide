import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

const formatNumber = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

export default function ImageTrendPartnershipDashboard() {
  const [monthlyPrice, setMonthlyPrice] = useState(4.99);
  const [annualPrice, setAnnualPrice] = useState(39);
  const [revenueShare, setRevenueShare] = useState(0.8);
  const [usersPerAgency, setUsersPerAgency] = useState(25);
  const [annualMix, setAnnualMix] = useState(0.7);

  // ImageTrend Data
  const imageTrendRevenue = [
    { year: '2021', revenue: 10.3, employees: 180 },
    { year: '2022', revenue: 13.0, employees: 220 },
    { year: '2023', revenue: 17.4, employees: 280 },
    { year: '2024', revenue: 25.2, employees: 345 },
    { year: '2025 (Est)', revenue: 32.8, employees: 394 },
  ];

  const imageTrendMetrics = {
    totalCustomers: 3000,
    totalAgencies: 20000,
    emsAgencies: 13000,
    statesCovered: 43,
    csatScore: 97.4,
    estimatedValuation: 175000000,
    revenue2024: 25200000,
  };

  // Calculate scenarios
  const adoptionRates = [0.02, 0.05, 0.10, 0.15, 0.20];
  const scenarioNames = ['Conservative (2%)', 'Moderate (5%)', 'Optimistic (10%)', 'Strong (15%)', 'Aggressive (20%)'];

  const calculateScenario = (adoptionRate) => {
    const agencies = imageTrendMetrics.emsAgencies * adoptionRate;
    const users = agencies * usersPerAgency;
    const monthlyARPU = (1 - annualMix) * monthlyPrice + annualMix * (annualPrice / 12);
    const mrr = users * monthlyARPU;
    const arr = mrr * 12;
    const yourRevenue = arr * revenueShare;
    return { agencies, users, mrr, arr, yourRevenue };
  };

  const scenarios = adoptionRates.map((rate, i) => ({
    name: scenarioNames[i],
    adoptionRate: rate,
    ...calculateScenario(rate)
  }));

  // 5-Year Projection (moderate path)
  const yearlyAdoption = [0.02, 0.05, 0.10, 0.15, 0.20];
  const fiveYearProjection = yearlyAdoption.map((rate, i) => {
    const data = calculateScenario(rate);
    return {
      year: `Year ${i + 1}`,
      adoption: rate * 100,
      agencies: data.agencies,
      users: data.users,
      arr: data.arr,
      yourRevenue: data.yourRevenue
    };
  });

  // Valuation impact
  const valuationMultiples = [5, 8, 10, 12];
  const valuationScenarios = scenarios.slice(0, 4).map((scenario, i) => ({
    name: scenario.name,
    arr: scenario.yourRevenue,
    multiple: valuationMultiples[i],
    valuation: scenario.yourRevenue * valuationMultiples[i]
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            ImageTrend Distribution Partnership Analysis
          </h1>
          <p className="text-slate-400 text-lg">Protocol Guide Revenue & Valuation Projections</p>
        </div>

        {/* ImageTrend Company Overview */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">📊 ImageTrend Company Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">$25.2M</p>
              <p className="text-slate-400 text-sm">2024 Revenue</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">30%+</p>
              <p className="text-slate-400 text-sm">YoY Growth</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-400">13,000</p>
              <p className="text-slate-400 text-sm">EMS Agencies</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">97.4%</p>
              <p className="text-slate-400 text-sm">CSAT Score</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={imageTrendRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(v) => `$${v}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value) => [`$${value}M`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B98133" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Assumptions */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">⚙️ Model Assumptions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-slate-400 text-sm block mb-1">Monthly Price</label>
              <input
                type="number"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Annual Price</label>
              <input
                type="number"
                value={annualPrice}
                onChange={(e) => setAnnualPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Your Rev Share</label>
              <input
                type="number"
                value={revenueShare * 100}
                onChange={(e) => setRevenueShare((parseFloat(e.target.value) || 0) / 100)}
                className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white"
                step="1"
                max="100"
              />
              <span className="text-xs text-slate-500">% (ImageTrend takes {((1-revenueShare)*100).toFixed(0)}%)</span>
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Users/Agency</label>
              <input
                type="number"
                value={usersPerAgency}
                onChange={(e) => setUsersPerAgency(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Annual Mix %</label>
              <input
                type="number"
                value={annualMix * 100}
                onChange={(e) => setAnnualMix((parseFloat(e.target.value) || 0) / 100)}
                className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white"
                step="5"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">📈 Revenue Scenarios</h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-3 px-4">Scenario</th>
                  <th className="text-right py-3 px-4">Adoption</th>
                  <th className="text-right py-3 px-4">Agencies</th>
                  <th className="text-right py-3 px-4">Users</th>
                  <th className="text-right py-3 px-4">MRR</th>
                  <th className="text-right py-3 px-4">ARR</th>
                  <th className="text-right py-3 px-4 text-emerald-400 font-bold">Your Revenue</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, i) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 font-medium">{s.name}</td>
                    <td className="py-3 px-4 text-right">{(s.adoptionRate * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-right">{formatNumber(s.agencies)}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(s.users)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(s.mrr)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(s.arr)}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">{formatCurrency(s.yourRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarios}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9CA3AF" tickFormatter={formatCurrency} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value) => [formatCurrency(value), 'Your Revenue']}
                />
                <Bar dataKey="yourRevenue" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5-Year Projection */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">🚀 5-Year Growth Trajectory</h2>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {fiveYearProjection.map((year, i) => (
              <div key={i} className="bg-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-slate-400 text-sm">{year.year}</p>
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(year.yourRevenue)}</p>
                <p className="text-xs text-slate-500">{year.adoption}% adoption</p>
              </div>
            ))}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fiveYearProjection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={formatCurrency} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value, name) => [formatCurrency(value), name === 'yourRevenue' ? 'Your Revenue' : name]}
                />
                <Legend />
                <Line type="monotone" dataKey="yourRevenue" name="Your Revenue (80%)" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="arr" name="Total ARR" stroke="#8884d8" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Valuation Impact */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-rose-400 mb-4">💰 Valuation Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-3">SaaS Multiples by Growth</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-700/30 rounded-lg p-3">
                  <span className="text-slate-400">&lt;20% Growth</span>
                  <span className="text-blue-400 font-bold">3-5x ARR</span>
                </div>
                <div className="flex justify-between items-center bg-slate-700/30 rounded-lg p-3">
                  <span className="text-slate-400">20-40% Growth</span>
                  <span className="text-emerald-400 font-bold">5-8x ARR</span>
                </div>
                <div className="flex justify-between items-center bg-slate-700/30 rounded-lg p-3">
                  <span className="text-slate-400">40-60% Growth</span>
                  <span className="text-purple-400 font-bold">8-12x ARR</span>
                </div>
                <div className="flex justify-between items-center bg-slate-700/30 rounded-lg p-3">
                  <span className="text-slate-400">&gt;60% Growth</span>
                  <span className="text-amber-400 font-bold">12-20x ARR</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-3">Your Potential Valuations</h3>
              <div className="space-y-2">
                {valuationScenarios.map((v, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-700/30 rounded-lg p-3">
                    <div>
                      <span className="text-slate-300">{v.name}</span>
                      <span className="text-slate-500 text-sm ml-2">({v.multiple}x)</span>
                    </div>
                    <span className="text-emerald-400 font-bold">{formatCurrency(v.valuation)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-blue-900/50 to-emerald-900/50 rounded-2xl p-6 border border-emerald-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">🎯 Key Investment Thesis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏥</span>
              <div>
                <h3 className="font-semibold text-emerald-400">Immediate Distribution</h3>
                <p className="text-slate-300 text-sm">Access to 13,000+ EMS agencies through ImageTrend's existing customer base</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💵</span>
              <div>
                <h3 className="font-semibold text-emerald-400">Zero CAC</h3>
                <p className="text-slate-300 text-sm">ImageTrend handles sales & marketing - you focus on product</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <h3 className="font-semibold text-emerald-400">Strong Economics</h3>
                <p className="text-slate-300 text-sm">80% revenue share is exceptional for a distribution partnership</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <h3 className="font-semibold text-emerald-400">High Retention</h3>
                <p className="text-slate-300 text-sm">Embedded in workflow = sticky customers, low churn expected</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-emerald-400">Path to $1M+ ARR</h3>
                <p className="text-slate-300 text-sm">Achievable within 2 years at just 5% adoption rate</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="font-semibold text-emerald-400">Premium Valuation</h3>
                <p className="text-slate-300 text-sm">SaaS with recurring revenue commands 5-12x ARR multiples</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>Analysis prepared for Protocol Guide | Data sources: GetLatka, Crunchbase, PR Newswire, Grand View Research</p>
          <p className="mt-1">ImageTrend is a private company - financials are estimates based on publicly available information</p>
        </div>
      </div>
    </div>
  );
}
