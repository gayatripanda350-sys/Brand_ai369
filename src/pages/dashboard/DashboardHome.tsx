import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type ContentAnalysis, type BrandGuideline, type AISuggestion } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import {
  FileSearch, Palette, Lightbulb, History,
  TrendingUp, ArrowRight, CheckCircle2, AlertCircle,
  FileText, Activity,
} from 'lucide-react';
import { getScoreColor, getScoreLabel } from '@/lib/aiEngine';
import CircularProgress from '@/components/CircularProgress';

export default function DashboardHome() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<ContentAnalysis[]>([]);
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      const [analysesRes, guidelinesRes, suggestionsRes] = await Promise.all([
        supabase.from('content_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('brand_guidelines').select('*').eq('user_id', user.id),
        supabase.from('ai_suggestions').select('*').eq('user_id', user.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
      ]);
      setAnalyses(analysesRes.data ?? []);
      setGuidelines(guidelinesRes.data ?? []);
      setSuggestions(suggestionsRes.data ?? []);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.overall_score, 0) / analyses.length)
    : 0;

  const pendingSuggestions = suggestions.filter((s) => s.status === 'pending').length;
  const firstName = user?.email?.split('@')[0] ?? 'there';

  const stats = [
    {
      label: 'Total Analyses',
      value: analyses.length,
      icon: FileSearch,
      gradient: 'from-brand-500 to-brand-700',
      link: '/dashboard/history',
    },
    {
      label: 'Brand Guidelines',
      value: guidelines.length,
      icon: Palette,
      gradient: 'from-accent-500 to-accent-700',
      link: '/dashboard/guidelines',
    },
    {
      label: 'Pending Suggestions',
      value: pendingSuggestions,
      icon: Lightbulb,
      gradient: 'from-brand-500 to-accent-600',
      link: '/dashboard/suggestions',
    },
    {
      label: 'Avg. Compliance Score',
      value: avgScore,
      icon: TrendingUp,
      gradient: 'from-accent-500 to-brand-600',
      link: '/dashboard/history',
    },
  ];

  const quickActions = [
    {
      title: 'Analyze Content',
      desc: 'Paste text for instant brand compliance analysis',
      icon: FileSearch,
      link: '/dashboard/analyzer',
      gradient: 'from-brand-500 to-brand-700',
    },
    {
      title: 'Manage Guidelines',
      desc: 'Set up and edit your brand voice and rules',
      icon: Palette,
      link: '/dashboard/guidelines',
      gradient: 'from-accent-500 to-accent-700',
    },
    {
      title: 'View Suggestions',
      desc: 'Review AI-powered recommendations',
      icon: Lightbulb,
      link: '/dashboard/suggestions',
      gradient: 'from-brand-500 to-accent-600',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-500">Here's an overview of your brand governance activity.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="card p-5 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* KPI Progress Chart */}
      <div className="mb-8 card p-8 bg-gradient-to-br from-white to-brand-50/40 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="relative flex flex-col lg:flex-row items-center gap-8">
          <div className="shrink-0">
            <CircularProgress
              value={avgScore}
              size={200}
              strokeWidth={14}
              label="Compliance"
              sublabel="Average Brand Compliance Score"
            />
          </div>
          <div className="flex-1 w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Brand Compliance KPI</h2>
            <p className="text-sm text-gray-500 mb-5">
              Based on {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'} across all guideline sets.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Tone', value: analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.tone_score, 0) / analyses.length) : 0, color: 'text-brand-600', bg: 'bg-brand-50' },
                { label: 'Clarity', value: analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.clarity_score, 0) / analyses.length) : 0, color: 'text-accent-600', bg: 'bg-accent-50' },
                { label: 'Consistency', value: analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.consistency_score, 0) / analyses.length) : 0, color: 'text-brand-700', bg: 'bg-brand-50' },
                { label: 'Compliance', value: analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.compliance_score, 0) / analyses.length) : 0, color: 'text-accent-700', bg: 'bg-accent-50' },
              ].map((metric) => (
                <div key={metric.label} className={`${metric.bg} rounded-xl p-4 text-center`}>
                  <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{metric.label}</div>
                  <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        metric.color === 'text-brand-600' ? 'bg-brand-500' :
                        metric.color === 'text-accent-600' ? 'bg-accent-500' :
                        metric.color === 'text-brand-700' ? 'bg-brand-600' : 'bg-accent-600'
                      }`}
                      style={{ width: `${metric.value}%`, transition: 'width 1s ease-out' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2">
              <div className={`badge ${avgScore >= 80 ? 'bg-green-100 text-green-700' : avgScore >= 60 ? 'bg-yellow-100 text-yellow-700' : avgScore >= 40 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                {avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : avgScore >= 40 ? 'Needs Work' : 'Critical'}
              </div>
              <Link to="/dashboard/analyzer" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
                Run new analysis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="card p-6 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{action.desc}</p>
              <div className="flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
                Get started <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent analyses */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Recent Analyses</h3>
            <Link to="/dashboard/history" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-4">No analyses yet. Start by analyzing some content.</p>
              <Link to="/dashboard/analyzer" className="btn-primary text-sm px-5 py-2.5">
                Analyze Content
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map((analysis) => (
                <Link
                  key={analysis.id}
                  to="/dashboard/history"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${getScoreColor(analysis.overall_score) === 'text-green-600' ? 'bg-green-100' : getScoreColor(analysis.overall_score) === 'text-yellow-600' ? 'bg-yellow-100' : getScoreColor(analysis.overall_score) === 'text-orange-600' ? 'bg-orange-100' : 'bg-red-100'}`}>
                    <span className={getScoreColor(analysis.overall_score)}>{analysis.overall_score}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{analysis.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(analysis.created_at).toLocaleDateString()} · {analysis.word_count} words
                    </p>
                  </div>
                  <span className={`badge ${analysis.overall_score >= 80 ? 'bg-green-100 text-green-700' : analysis.overall_score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'}`}>
                    {getScoreLabel(analysis.overall_score)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent suggestions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Recent Suggestions</h3>
            <Link to="/dashboard/suggestions" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-4">No suggestions yet. Run an analysis to get AI recommendations.</p>
              <Link to="/dashboard/analyzer" className="btn-primary text-sm px-5 py-2.5">
                Start Analysis
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((sug) => (
                <div key={sug.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    sug.severity === 'high' ? 'bg-red-100' : sug.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {sug.severity === 'high' ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{sug.category}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{sug.suggestion_text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity overview */}
      <div className="mt-8 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-brand-600" />
          <h3 className="text-base font-bold text-gray-900">Brand Compliance Trend</h3>
        </div>
        {analyses.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            Run analyses to see your compliance trend over time.
          </p>
        ) : (
          <div className="flex items-end justify-between gap-2 h-40">
            {analyses.slice(0, 10).reverse().map((a, i) => {
              const height = Math.max(10, a.overall_score);
              return (
                <div key={a.id} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-xs font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {a.overall_score}
                  </div>
                  <div
                    className="w-full rounded-t-lg gradient-bg transition-all duration-500 hover:opacity-80"
                    style={{ height: `${height}%`, minHeight: '8px' }}
                  />
                  <div className="text-xs text-gray-400">{i + 1}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
