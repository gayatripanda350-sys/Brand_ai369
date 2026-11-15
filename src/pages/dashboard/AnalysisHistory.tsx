import { useEffect, useState } from 'react';
import { supabase, type ContentAnalysis } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import {
  History, Search, Trash2, Eye, X, Loader2,
  FileText, Calendar, TrendingUp,
} from 'lucide-react';
import { getScoreColor, getScoreBg, getScoreLabel, severityColor } from '@/lib/aiEngine';

export default function AnalysisHistory() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<ContentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContentAnalysis | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAnalyses = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('content_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setAnalyses(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAnalyses(); }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this analysis? This cannot be undone.')) return;
    setDeleting(id);
    await supabase.from('ai_suggestions').delete().eq('analysis_id', id);
    await supabase.from('content_analyses').delete().eq('id', id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleting(null);
  };

  const filtered = analyses.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content_text.toLowerCase().includes(search.toLowerCase())
  );

  const scoreCards = (a: ContentAnalysis) => [
    { label: 'Tone', score: a.tone_score },
    { label: 'Clarity', score: a.clarity_score },
    { label: 'Consistency', score: a.consistency_score },
    { label: 'Compliance', score: a.compliance_score },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Analysis History</h1>
        <p className="text-gray-500">Browse and review all your past content analyses.</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11"
          placeholder="Search analyses by title or content..."
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-brand-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {search ? 'No matching analyses' : 'No analyses yet'}
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            {search
              ? 'Try a different search term.'
              : 'Run your first content analysis to start building your history.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-3">{filtered.length} {filtered.length === 1 ? 'analysis' : 'analyses'}</p>
          <div className="space-y-3">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="card p-5 group hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* Score circle */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    a.overall_score >= 80 ? 'bg-green-100' :
                    a.overall_score >= 60 ? 'bg-yellow-100' :
                    a.overall_score >= 40 ? 'bg-orange-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-xl font-bold ${getScoreColor(a.overall_score)}`}>
                      {a.overall_score}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{a.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(a.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {a.word_count} words
                      </span>
                      <span className={`badge ${getScoreBg(a.overall_score)}`}>
                        {getScoreLabel(a.overall_score)}
                      </span>
                      {a.issues.length > 0 && (
                        <span className="text-red-500">{a.issues.length} issues</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelected(a)}
                      className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 flex items-center justify-center transition-colors"
                      title="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting === a.id}
                      className="w-9 h-9 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.title}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(selected.created_at).toLocaleString()} · {selected.word_count} words
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5">
              {/* Overall score */}
              <div className="flex items-center gap-6 p-5 rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(selected.overall_score)}`}>
                    {selected.overall_score}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Overall Score</div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  {scoreCards(selected).map((sc) => (
                    <div key={sc.label} className="bg-white rounded-xl p-3 text-center">
                      <div className={`text-xl font-bold ${getScoreColor(sc.score)}`}>{sc.score}</div>
                      <div className="text-xs text-gray-500">{sc.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content preview */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Analyzed Content
                </h3>
                <div className="p-4 rounded-xl bg-gray-50 text-sm text-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selected.content_text}
                </div>
              </div>

              {/* Issues */}
              {selected.issues.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">
                    Issues ({selected.issues.length})
                  </h3>
                  <div className="space-y-2">
                    {selected.issues.map((issue, i) => (
                      <div key={i} className={`p-3 rounded-xl border ${severityColor(issue.severity)}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase tracking-wide">{issue.type}</span>
                          <span className="text-xs font-medium uppercase">{issue.severity}</span>
                        </div>
                        <p className="text-sm text-gray-700">{issue.message}</p>
                        {issue.suggestion && (
                          <p className="text-xs text-gray-500 mt-1">{issue.suggestion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {selected.suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent-600" />
                    AI Suggestions ({selected.suggestions.length})
                  </h3>
                  <div className="space-y-2">
                    {selected.suggestions.map((sug, i) => (
                      <div key={i} className="p-3 rounded-xl bg-accent-50 border border-accent-100">
                        <p className="text-xs font-bold text-accent-800 uppercase tracking-wide mb-1">{sug.category}</p>
                        <p className="text-sm text-gray-700">{sug.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.issues.length === 0 && selected.suggestions.length === 0 && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-center">
                  <p className="text-sm font-medium text-green-700">No issues or suggestions — this content was well-aligned!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
