import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type BrandGuideline, type ContentAnalysis } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import {
  analyzeContent, getScoreColor, getScoreBg, getScoreLabel, severityColor,
} from '@/lib/aiEngine';
import {
  FileSearch, Sparkles, AlertCircle, CheckCircle2, Brain,
  TrendingUp, Target, Eye, Palette, Save, ArrowRight, Loader2,
} from 'lucide-react';

const SAMPLE_TEXT = `At Acme Corp, we're really excited to launch our new product. It's basically a game-changer that will revolutionize how you work. Our team has worked very hard to make this happen and we think you'll love it. We leverage cutting-edge technology to deliver world-class solutions that are truly best of breed. At the end of the day, our goal is to empower businesses with simple, seamless, and reliable tools that transform the way they operate. This is just the beginning of our journey to unlock new possibilities for our customers.`;

export default function ContentAnalyzer() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>([]);
  const [selectedGuidelineId, setSelectedGuidelineId] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof analyzeContent> | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loadingGuidelines, setLoadingGuidelines] = useState(true);

  useEffect(() => {
    async function fetchGuidelines() {
      if (!user) return;
      const { data } = await supabase
        .from('brand_guidelines')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setGuidelines(data ?? []);
      setLoadingGuidelines(false);
    }
    fetchGuidelines();
  }, [user]);

  const handleAnalyze = useCallback(() => {
    if (text.trim().length < 10) return;
    setAnalyzing(true);
    setSaved(false);
    setResult(null);

    // Simulate AI processing delay for UX
    setTimeout(() => {
      const guideline = guidelines.find((g) => g.id === selectedGuidelineId) ?? null;
      const analysis = analyzeContent(text, guideline);
      setResult(analysis);
      setAnalyzing(false);
    }, 800);
  }, [text, guidelines, selectedGuidelineId]);

  const handleSave = async () => {
    if (!user || !result) return;
    setSaveLoading(true);
    const analysisRow = {
      user_id: user.id,
      guideline_id: selectedGuidelineId || null,
      title: title || 'Untitled Analysis',
      content_text: text,
      overall_score: result.overall_score,
      tone_score: result.tone_score,
      consistency_score: result.consistency_score,
      clarity_score: result.clarity_score,
      compliance_score: result.compliance_score,
      word_count: result.word_count,
      issues: result.issues,
      suggestions: result.suggestions,
      status: 'completed',
    };

    const { data: savedAnalysis, error: analysisError } = await supabase
      .from('content_analyses')
      .insert(analysisRow)
      .select()
      .single();

    if (!analysisError && savedAnalysis && result.suggestions.length > 0) {
      const suggestionRows = result.suggestions.map((s) => ({
        user_id: user.id,
        analysis_id: savedAnalysis.id,
        category: s.category,
        suggestion_text: s.text,
        severity: s.severity,
        status: 'pending',
      }));
      await supabase.from('ai_suggestions').insert(suggestionRows);
    }

    setSaveLoading(false);
    setSaved(true);
  };

  const selectedGuideline = guidelines.find((g) => g.id === selectedGuidelineId);

  const scoreCards = [
    { label: 'Tone', score: result?.tone_score ?? 0, icon: Brain, color: 'from-brand-500 to-brand-700' },
    { label: 'Clarity', score: result?.clarity_score ?? 0, icon: Eye, color: 'from-accent-500 to-accent-700' },
    { label: 'Consistency', score: result?.consistency_score ?? 0, icon: Target, color: 'from-brand-500 to-accent-600' },
    { label: 'Compliance', score: result?.compliance_score ?? 0, icon: TrendingUp, color: 'from-accent-500 to-brand-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Content Analyzer</h1>
        <p className="text-gray-500">Paste your content below for instant AI-powered brand compliance analysis.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Analysis Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="e.g., Product Launch Email"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Brand Guidelines
                <span className="text-gray-400 font-normal"> (optional)</span>
              </label>
              {loadingGuidelines ? (
                <div className="h-11 rounded-xl bg-gray-100 animate-pulse" />
              ) : guidelines.length === 0 ? (
                <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 text-sm text-brand-700 flex items-center gap-2">
                  <Palette className="w-4 h-4 shrink-0" />
                  <span>
                    No guidelines yet.{' '}
                    <Link to="/dashboard/guidelines" className="font-semibold underline">
                      Create one
                    </Link>
                  </span>
                </div>
              ) : (
                <select
                  value={selectedGuidelineId}
                  onChange={(e) => setSelectedGuidelineId(e.target.value)}
                  className="input-field"
                >
                  <option value="">No specific guideline set</option>
                  {guidelines.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Content to Analyze</label>
                <button
                  onClick={() => { setText(SAMPLE_TEXT); setTitle('Sample Content'); }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Try sample text
                </button>
              </div>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setResult(null); setSaved(false); }}
                rows={12}
                className="input-field resize-none font-mono text-sm"
                placeholder="Paste your content here — emails, blog posts, social media copy, ad copy, or any text you want analyzed..."
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
                {text.length > 0 && (
                  <button onClick={() => { setText(''); setResult(null); setSaved(false); }} className="hover:text-gray-600">
                    Clear
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={text.trim().length < 10 || analyzing}
              className="btn-primary w-full"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Content
                </>
              )}
            </button>
          </div>

          {/* Selected guideline preview */}
          {selectedGuideline && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-accent-600" />
                <h3 className="text-sm font-bold text-gray-900">Analyzing against: {selectedGuideline.name}</h3>
              </div>
              <div className="space-y-2 text-xs">
                {selectedGuideline.tone.length > 0 && (
                  <div>
                    <span className="text-gray-500">Tone:</span>{' '}
                    <span className="text-gray-700">{selectedGuideline.tone.join(', ')}</span>
                  </div>
                )}
                {selectedGuideline.keywords.length > 0 && (
                  <div>
                    <span className="text-gray-500">Keywords:</span>{' '}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedGuideline.keywords.slice(0, 6).map((k) => (
                        <span key={k} className="badge bg-brand-50 text-brand-700">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedGuideline.forbidden_words.length > 0 && (
                  <div>
                    <span className="text-gray-500">Forbidden words:</span>{' '}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedGuideline.forbidden_words.slice(0, 4).map((w) => (
                        <span key={w} className="badge bg-red-50 text-red-700">{w}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results panel */}
        <div className="space-y-4">
          {!result && !analyzing && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center mx-auto mb-4">
                <FileSearch className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to analyze</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Paste your content on the left and click "Analyze Content" to get instant
                compliance scores, issues, and AI-powered suggestions.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-brand-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI is analyzing your content...</h3>
              <p className="text-sm text-gray-500">Checking tone, clarity, consistency, and brand compliance.</p>
            </div>
          )}

          {result && (
            <>
              {/* Overall score */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Overall Compliance Score</p>
                    <div className="flex items-end gap-2">
                      <span className={`text-4xl font-bold ${getScoreColor(result.overall_score)}`}>
                        {result.overall_score}
                      </span>
                      <span className="text-sm text-gray-400 pb-1">/ 100</span>
                    </div>
                  </div>
                  <span className={`badge px-4 py-2 text-sm font-semibold ${getScoreBg(result.overall_score)}`}>
                    {getScoreLabel(result.overall_score)}
                  </span>
                </div>

                {/* Progress ring */}
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      result.overall_score >= 80 ? 'bg-green-500' :
                      result.overall_score >= 60 ? 'bg-yellow-500' :
                      result.overall_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.overall_score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">{result.word_count} words analyzed</p>
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-2 gap-3">
                {scoreCards.map((sc) => (
                  <div key={sc.label} className="card p-4">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${sc.color} flex items-center justify-center mb-2`}>
                      <sc.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-end gap-1">
                      <span className={`text-2xl font-bold ${getScoreColor(sc.score)}`}>{sc.score}</span>
                      <span className="text-xs text-gray-400 pb-1">/100</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{sc.label}</p>
                  </div>
                ))}
              </div>

              {/* Issues */}
              {result.issues.length > 0 && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Issues Found ({result.issues.length})
                    </h3>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.issues.map((issue, i) => (
                      <div key={i} className={`p-3 rounded-xl border ${severityColor(issue.severity)}`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wide">{issue.type}</span>
                          <span className="text-xs font-medium uppercase">{issue.severity}</span>
                        </div>
                        <p className="text-sm text-gray-700">{issue.message}</p>
                        {issue.suggestion && (
                          <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                            <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
                            {issue.suggestion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-accent-600" />
                    <h3 className="text-sm font-bold text-gray-900">
                      AI Suggestions ({result.suggestions.length})
                    </h3>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.suggestions.map((sug, i) => (
                      <div key={i} className="p-3 rounded-xl bg-accent-50 border border-accent-100">
                        <div className="flex items-start gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            sug.severity === 'high' ? 'bg-red-100' : sug.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                            <Lightbulb className={`w-3.5 h-3.5 ${
                              sug.severity === 'high' ? 'text-red-600' : sug.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-accent-800 uppercase tracking-wide">{sug.category}</p>
                            <p className="text-sm text-gray-700 mt-0.5">{sug.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.issues.length === 0 && (
                <div className="card p-5 bg-green-50 border-green-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-green-800">No issues detected! Your content is well-aligned.</p>
                  </div>
                </div>
              )}

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saved || saveLoading}
                className={`btn-primary w-full ${saved ? 'bg-green-600 from-green-600 to-green-700' : ''}`}
              >
                {saveLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : saved ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Saved to History
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Analysis
                  </>
                )}
              </button>

              {saved && (
                <Link
                  to="/dashboard/history"
                  className="btn-secondary w-full text-sm"
                >
                  View in History
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
