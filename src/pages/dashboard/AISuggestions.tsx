import { useEffect, useState } from 'react';
import { supabase, type AISuggestion, type ContentAnalysis } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import {
  Lightbulb, CheckCircle2, XCircle, Loader2, AlertCircle,
  Brain, Filter, ArrowRight,
} from 'lucide-react';

export default function AISuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, ContentAnalysis>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'applied' | 'dismissed'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    if (!user) return;
    setLoading(true);
    const { data: sugData } = await supabase
      .from('ai_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const { data: anaData } = await supabase
      .from('content_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const anaMap = new Map<string, ContentAnalysis>();
    (anaData ?? []).forEach((a) => anaMap.set(a.id, a));

    setSuggestions(sugData ?? []);
    setAnalyses(anaMap);
    setLoading(false);
  };

  useEffect(() => { fetchSuggestions(); }, [user]);

  const updateStatus = async (id: string, status: 'applied' | 'dismissed') => {
    setUpdating(id);
    await supabase.from('ai_suggestions').update({ status }).eq('id', id);
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    setUpdating(null);
  };

  const filtered = filter === 'all' ? suggestions : suggestions.filter((s) => s.status === filter);

  const counts = {
    all: suggestions.length,
    pending: suggestions.filter((s) => s.status === 'pending').length,
    applied: suggestions.filter((s) => s.status === 'applied').length,
    dismissed: suggestions.filter((s) => s.status === 'dismissed').length,
  };

  const severityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-brand-100 text-brand-700',
    applied: 'bg-green-100 text-green-700',
    dismissed: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Suggestions</h1>
        <p className="text-gray-500">Review and manage AI-powered recommendations from your content analyses.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        {(['all', 'pending', 'applied', 'dismissed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 whitespace-nowrap ${
              filter === f
                ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-brand-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {filter === 'all' ? 'No suggestions yet' : `No ${filter} suggestions`}
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Run a content analysis to generate AI-powered suggestions for improving your brand compliance.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sug) => {
            const analysis = sug.analysis_id ? analyses.get(sug.analysis_id) : null;
            return (
              <div key={sug.id} className="card p-5 group hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    sug.severity === 'high' ? 'bg-red-100' : sug.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <Brain className={`w-5 h-5 ${
                      sug.severity === 'high' ? 'text-red-600' : sug.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">{sug.category}</span>
                      <span className={`badge border ${severityColors[sug.severity]}`}>
                        {sug.severity}
                      </span>
                      <span className={`badge ${statusColors[sug.status]}`}>
                        {sug.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2">{sug.suggestion_text}</p>
                    {analysis && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        From: {analysis.title} · {new Date(sug.created_at).toLocaleDateString()}
                      </p>
                    )}
                    {!analysis && (
                      <p className="text-xs text-gray-400">
                        {new Date(sug.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  {sug.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateStatus(sug.id, 'applied')}
                        disabled={updating === sug.id}
                        className="w-9 h-9 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Mark as applied"
                      >
                        {updating === sug.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => updateStatus(sug.id, 'dismissed')}
                        disabled={updating === sug.id}
                        className="w-9 h-9 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Dismiss"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {sug.status !== 'pending' && (
                    <button
                      onClick={() => updateStatus(sug.id, 'pending')}
                      disabled={updating === sug.id}
                      className="text-xs text-gray-400 hover:text-brand-600 transition-colors shrink-0"
                    >
                      Revert
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
