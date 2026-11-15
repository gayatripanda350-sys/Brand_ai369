import { useEffect, useState, type FormEvent } from 'react';
import { supabase, type BrandGuideline } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import {
  Palette, Plus, Edit3, Trash2, X, Save, Loader2,
  CheckCircle2, Type, MessageSquare, AlertCircle, Tag, Eye,
} from 'lucide-react';

type EditState = {
  name: string;
  tone: string;
  voice_description: string;
  color_palette: string;
  typography_heading: string;
  typography_body: string;
  do_list: string;
  dont_list: string;
  keywords: string;
  forbidden_words: string;
};

const emptyState: EditState = {
  name: '',
  tone: '',
  voice_description: '',
  color_palette: '',
  typography_heading: '',
  typography_body: '',
  do_list: '',
  dont_list: '',
  keywords: '',
  forbidden_words: '',
};

function parseList(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

function parseColors(s: string): { name: string; hex: string }[] {
  return s.split('\n')
    .map((line) => {
      const [name, hex] = line.split(',').map((x) => x.trim());
      return { name: name || '', hex: hex || '#000000' };
    })
    .filter((c) => c.name);
}

export default function BrandGuidelines() {
  const { user } = useAuth();
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditState>(emptyState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuidelines = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('brand_guidelines')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setGuidelines(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchGuidelines(); }, [user]);

  const handleEdit = (g: BrandGuideline) => {
    setEditingId(g.id);
    setForm({
      name: g.name,
      tone: g.tone.join(', '),
      voice_description: g.voice_description,
      color_palette: g.color_palette.map((c) => `${c.name}, ${c.hex}`).join('\n'),
      typography_heading: g.typography?.heading ?? '',
      typography_body: g.typography?.body ?? '',
      do_list: g.do_list.join('\n'),
      dont_list: g.dont_list.join('\n'),
      keywords: g.keywords.join(', '),
      forbidden_words: g.forbidden_words.join(', '),
    });
    setShowForm(true);
    setError(null);
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(emptyState);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this guideline set? This cannot be undone.')) return;
    await supabase.from('brand_guidelines').delete().eq('id', id);
    fetchGuidelines();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError(null);

    const row = {
      user_id: user.id,
      name: form.name.trim(),
      tone: parseList(form.tone),
      voice_description: form.voice_description.trim(),
      color_palette: parseColors(form.color_palette),
      typography: { heading: form.typography_heading.trim(), body: form.typography_body.trim() },
      do_list: form.do_list.split('\n').map((x) => x.trim()).filter(Boolean),
      dont_list: form.dont_list.split('\n').map((x) => x.trim()).filter(Boolean),
      keywords: parseList(form.keywords),
      forbidden_words: parseList(form.forbidden_words),
      is_active: true,
    };

    if (editingId) {
      const { error } = await supabase.from('brand_guidelines').update({
        ...row,
        updated_at: new Date().toISOString(),
      }).eq('id', editingId);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from('brand_guidelines').insert(row);
      if (error) setError(error.message);
    }

    setSaving(false);
    if (!error) {
      setShowForm(false);
      setForm(emptyState);
      setEditingId(null);
      fetchGuidelines();
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Brand Guidelines</h1>
          <p className="text-gray-500">Define your brand voice, tone, and rules for AI analysis.</p>
        </div>
        {!showForm && (
          <button onClick={handleNew} className="btn-primary text-sm">
            <Plus className="w-4 h-4" />
            New Guideline
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200 mb-6 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="card p-6 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? 'Edit Guideline Set' : 'Create New Guideline Set'}
            </h2>
            <button
              onClick={() => { setShowForm(false); setForm(emptyState); setEditingId(null); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Guideline Set Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Corporate Brand Voice"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone (comma-separated)</label>
                <input
                  type="text"
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value })}
                  className="input-field"
                  placeholder="professional, friendly, confident"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Voice Description</label>
              <textarea
                value={form.voice_description}
                onChange={(e) => setForm({ ...form, voice_description: e.target.value })}
                rows={2}
                className="input-field resize-none"
                placeholder="Describe your brand voice — e.g., 'Our voice is authoritative yet approachable, using clear and concise language that empowers our readers.'"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Heading Font</label>
                <input
                  type="text"
                  value={form.typography_heading}
                  onChange={(e) => setForm({ ...form, typography_heading: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Inter Bold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Body Font</label>
                <input
                  type="text"
                  value={form.typography_body}
                  onChange={(e) => setForm({ ...form, typography_body: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Inter Regular"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Color Palette <span className="text-gray-400 font-normal">(one per line: name, #hex)</span>
              </label>
              <textarea
                value={form.color_palette}
                onChange={(e) => setForm({ ...form, color_palette: e.target.value })}
                rows={3}
                className="input-field resize-none font-mono text-sm"
                placeholder={'Primary, #2563eb\nSecondary, #7c3aed\nAccent, #06b6d4'}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Do List <span className="text-gray-400 font-normal">(one per line)</span>
                </label>
                <textarea
                  value={form.do_list}
                  onChange={(e) => setForm({ ...form, do_list: e.target.value })}
                  rows={4}
                  className="input-field resize-none text-sm"
                  placeholder={'Use active voice\nBe concise and specific'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Don't List <span className="text-gray-400 font-normal">(one per line)</span>
                </label>
                <textarea
                  value={form.dont_list}
                  onChange={(e) => setForm({ ...form, dont_list: e.target.value })}
                  rows={4}
                  className="input-field resize-none text-sm"
                  placeholder={'Avoid jargon\nDon\'t use exclamation marks excessively'}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="input-field"
                  placeholder="innovation, quality, trust, reliable"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Forbidden Words (comma-separated)</label>
                <input
                  type="text"
                  value={form.forbidden_words}
                  onChange={(e) => setForm({ ...form, forbidden_words: e.target.value })}
                  className="input-field"
                  placeholder="cheap, free, guarantee"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {editingId ? 'Update' : 'Create'} Guideline Set
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyState); setEditingId(null); }}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Guidelines list */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="card p-6 h-48 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : guidelines.length === 0 && !showForm ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-brand-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No guidelines yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Create your first brand guideline set to start getting accurate compliance analysis
            tailored to your brand voice.
          </p>
          <button onClick={handleNew} className="btn-primary">
            <Plus className="w-5 h-5" />
            Create Your First Guideline Set
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {guidelines.map((g) => (
            <div key={g.id} className="card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{g.name}</h3>
                    <p className="text-xs text-gray-400">
                      {new Date(g.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(g)}
                    className="w-8 h-8 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 flex items-center justify-center transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {g.voice_description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{g.voice_description}</p>
              )}

              <div className="space-y-2">
                {g.tone.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <Type className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500">Tone:</span>
                    <div className="flex flex-wrap gap-1">
                      {g.tone.slice(0, 4).map((t) => (
                        <span key={t} className="badge bg-brand-50 text-brand-700">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {g.keywords.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500">Keywords:</span>
                    <div className="flex flex-wrap gap-1">
                      {g.keywords.slice(0, 4).map((k) => (
                        <span key={k} className="badge bg-accent-50 text-accent-700">{k}</span>
                      ))}
                      {g.keywords.length > 4 && <span className="text-xs text-gray-400">+{g.keywords.length - 4} more</span>}
                    </div>
                  </div>
                )}
                {g.color_palette.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500">Colors:</span>
                    <div className="flex gap-1">
                      {g.color_palette.slice(0, 5).map((c, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded border border-gray-200"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {g.forbidden_words.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500">Forbidden:</span>
                    <span className="text-gray-700">{g.forbidden_words.length} words</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                {g.do_list.length > 0 && <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {g.do_list.length} Do's</span>}
                {g.dont_list.length > 0 && <span className="flex items-center gap-1"><X className="w-3 h-3 text-red-400" /> {g.dont_list.length} Don'ts</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
