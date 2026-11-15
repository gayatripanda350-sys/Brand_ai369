import type { BrandGuideline, ContentAnalysis } from '@/lib/supabaseClient';

type Issue = {
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  excerpt?: string;
  suggestion?: string;
};

type Suggestion = {
  category: string;
  text: string;
  severity: 'high' | 'medium' | 'low';
};

type AnalysisResult = {
  overall_score: number;
  tone_score: number;
  consistency_score: number;
  clarity_score: number;
  compliance_score: number;
  word_count: number;
  issues: Issue[];
  suggestions: Suggestion[];
};

const POSITIVE_TONE_WORDS = [
  'innovative', 'trusted', 'reliable', 'professional', 'quality',
  'excellence', 'leading', 'premium', 'dedicated', 'expert',
  'friendly', 'helpful', 'modern', 'simple', 'seamless',
  'empower', 'transform', 'elevate', 'unlock', 'discover',
];

const NEGATIVE_TONE_WORDS = [
  'cheap', 'broken', 'worst', 'hate', 'stupid', 'terrible',
  'awful', 'useless', 'fail', 'lazy', 'amateur', 'outdated',
];

const WEAK_WORDS = [
  'very', 'really', 'just', 'actually', 'basically', 'literally',
  'kind of', 'sort of', 'maybe', 'perhaps', 'stuff', 'things',
  'good', 'nice', 'great', 'okay', 'fine',
];

const PASSIVE_INDICATORS = [
  ' is being', ' was being', ' has been', ' have been', ' will be',
  ' was done', ' were done', ' was created', ' was made',
  ' was designed', ' was developed', ' was built',
];

const CLICHE_PHRASES = [
  'thinking outside the box', 'at the end of the day', 'low-hanging fruit',
  'synergy', 'leverage', 'best of breed', 'world-class',
  'state of the art', 'cutting edge', 'next generation',
  'paradigm shift', 'value add', 'moving forward',
  'circle back', 'touch base', 'deep dive',
];

export function analyzeContent(
  text: string,
  guideline: BrandGuideline | null
): AnalysisResult {
  const lowerText = text.toLowerCase();
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;

  const issues: Issue[] = [];
  const suggestions: Suggestion[] = [];

  // --- Tone analysis ---
  let positiveHits = 0;
  let negativeHits = 0;
  for (const word of POSITIVE_TONE_WORDS) {
    if (lowerText.includes(word)) positiveHits++;
  }
  for (const word of NEGATIVE_TONE_WORDS) {
    if (lowerText.includes(word)) {
      negativeHits++;
      issues.push({
        type: 'tone',
        severity: 'high',
        message: `Negative tone word detected: "${word}"`,
        excerpt: word,
        suggestion: 'Replace with a positive, brand-aligned alternative.',
      });
    }
  }

  // Check guideline tone alignment
  if (guideline && guideline.tone.length > 0) {
    const guidelineTones = guideline.tone.map((t) => t.toLowerCase());
    let toneMatch = false;
    for (const tone of guidelineTones) {
      if (lowerText.includes(tone)) {
        toneMatch = true;
        break;
      }
    }
    if (!toneMatch && wordCount > 20) {
      suggestions.push({
        category: 'Tone Alignment',
        text: `Your brand guidelines specify a ${guideline.tone.join(', ')} tone. Consider incorporating language that better reflects this tone.`,
        severity: 'medium',
      });
    }
  }

  const toneScore = Math.max(
    0,
    Math.min(100, 70 + positiveHits * 5 - negativeHits * 20)
  );

  // --- Clarity analysis ---
  let weakWordCount = 0;
  for (const word of WEAK_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      weakWordCount += matches.length;
    }
  }

  if (weakWordCount > 3) {
    issues.push({
      type: 'clarity',
      severity: 'medium',
      message: `Found ${weakWordCount} weak/ filler words that reduce impact.`,
      suggestion: 'Replace weak words with more specific, impactful language.',
    });
    suggestions.push({
      category: 'Clarity',
      text: `${weakWordCount} weak or filler words detected. Replace words like "very", "really", "just" with stronger, more precise alternatives.`,
      severity: 'medium',
    });
  }

  if (avgSentenceLength > 25) {
    issues.push({
      type: 'clarity',
      severity: 'medium',
      message: `Average sentence length is ${avgSentenceLength.toFixed(0)} words. Long sentences reduce readability.`,
      suggestion: 'Break long sentences into shorter ones for clarity.',
    });
    suggestions.push({
      category: 'Readability',
      text: `Average sentence length is ${avgSentenceLength.toFixed(0)} words. Aim for 15-20 words per sentence for better readability.`,
      severity: 'low',
    });
  }

  let clicheCount = 0;
  for (const phrase of CLICHE_PHRASES) {
    if (lowerText.includes(phrase)) {
      clicheCount++;
      issues.push({
        type: 'clarity',
        severity: 'medium',
        message: `Cliché phrase detected: "${phrase}"`,
        excerpt: phrase,
        suggestion: 'Use original, specific language instead of overused phrases.',
      });
    }
  }

  const clarityScore = Math.max(
    0,
    Math.min(100, 85 - weakWordCount * 3 - (avgSentenceLength > 25 ? 10 : 0) - clicheCount * 8)
  );

  // --- Consistency analysis ---
  let consistencyPenalty = 0;

  // Check for inconsistent capitalization
  const brandMentions = text.match(/\b[A-Z][a-z]+\b/g) || [];
  const uniqueBrands = new Set(brandMentions.map((b) => b.toLowerCase()));
  if (brandMentions.length > 0 && uniqueBrands.size < brandMentions.length * 0.7) {
    consistencyPenalty += 5;
  }

  // Check exclamation mark frequency
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 3 && wordCount < 200) {
    issues.push({
      type: 'consistency',
      severity: 'low',
      message: `Excessive use of exclamation marks (${exclamationCount} found).`,
      suggestion: 'Limit exclamation marks to maintain a professional tone.',
    });
    consistencyPenalty += 5;
  }

  // Check for mixed formatting (ALL CAPS words)
  const allCapsWords = (text.match(/\b[A-Z]{4,}\b/g) || []).length;
  if (allCapsWords > 2) {
    issues.push({
      type: 'consistency',
      severity: 'low',
      message: `${allCapsWords} words in ALL CAPS detected.`,
      suggestion: 'Avoid excessive capitalization; use it sparingly for emphasis.',
    });
    consistencyPenalty += 5;
  }

  const consistencyScore = Math.max(0, Math.min(100, 90 - consistencyPenalty));

  // --- Brand compliance analysis ---
  let compliancePenalty = 0;

  if (guideline) {
    // Check forbidden words
    if (guideline.forbidden_words.length > 0) {
      for (const word of guideline.forbidden_words) {
        const lower = word.toLowerCase();
        if (lowerText.includes(lower)) {
          issues.push({
            type: 'compliance',
            severity: 'high',
            message: `Forbidden brand word detected: "${word}"`,
            excerpt: word,
            suggestion: 'This word is explicitly prohibited by your brand guidelines.',
          });
          compliancePenalty += 15;
        }
      }
    }

    // Check keyword presence
    if (guideline.keywords.length > 0) {
      let keywordHits = 0;
      for (const kw of guideline.keywords) {
        if (lowerText.includes(kw.toLowerCase())) keywordHits++;
      }
      const keywordRatio = keywordHits / guideline.keywords.length;
      if (keywordRatio < 0.2 && wordCount > 50) {
        suggestions.push({
          category: 'Keyword Usage',
          text: `Only ${keywordHits} of ${guideline.keywords.length} brand keywords found. Consider incorporating more brand-aligned keywords.`,
          severity: 'medium',
        });
        compliancePenalty += 10;
      }
    }

    // Check "do" and "don't" lists
    if (guideline.dont_list.length > 0) {
      for (const rule of guideline.dont_list) {
        const keywords = rule.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
        if (keywords.length > 0) {
          const matched = keywords.some((k) => lowerText.includes(k));
          if (matched) {
            issues.push({
              type: 'compliance',
              severity: 'medium',
              message: `Content may violate brand guideline: "${rule}"`,
              suggestion: 'Review your brand guidelines and adjust content accordingly.',
            });
            compliancePenalty += 8;
          }
        }
      }
    }
  }

  // Voice description heuristic check
  if (guideline && guideline.voice_description) {
    const voiceKeywords = guideline.voice_description
      .toLowerCase()
      .split(/[\s,]+/)
      .filter((w) => w.length > 4);
    let voiceMatch = false;
    for (const vk of voiceKeywords) {
      if (lowerText.includes(vk)) {
        voiceMatch = true;
        break;
      }
    }
    if (!voiceMatch && wordCount > 30) {
      suggestions.push({
        category: 'Voice Alignment',
        text: 'Content doesn\'t strongly reflect your defined brand voice. Review your voice description and align your language.',
        severity: 'low',
      });
    }
  }

  // Passive voice detection
  let passiveCount = 0;
  for (const indicator of PASSIVE_INDICATORS) {
    if (lowerText.includes(indicator)) passiveCount++;
  }
  if (passiveCount > 2) {
    issues.push({
      type: 'clarity',
      severity: 'low',
      message: `Passive voice detected (${passiveCount} instances).`,
      suggestion: 'Use active voice for more direct, engaging content.',
    });
    suggestions.push({
      category: 'Voice',
      text: `${passiveCount} instances of passive voice detected. Active voice creates more engaging, direct content.`,
      severity: 'low',
    });
  }

  const complianceScore = Math.max(0, Math.min(100, 85 - compliancePenalty));

  // Overall score
  const overallScore = Math.round(
    (toneScore + clarityScore + consistencyScore + complianceScore) / 4
  );

  // Positive suggestions for high scores
  if (overallScore >= 85) {
    suggestions.push({
      category: 'Overall',
      text: 'Excellent! Your content is well-aligned with brand governance best practices. Maintain this quality standard.',
      severity: 'low',
    });
  }

  if (wordCount < 20) {
    suggestions.push({
      category: 'Content Length',
      text: 'Content is quite short. Consider adding more context and detail for better brand messaging.',
      severity: 'low',
    });
  }

  return {
    overall_score: overallScore,
    tone_score: Math.round(toneScore),
    consistency_score: Math.round(consistencyScore),
    clarity_score: Math.round(clarityScore),
    compliance_score: Math.round(complianceScore),
    word_count: wordCount,
    issues,
    suggestions,
  };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700';
  if (score >= 40) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Critical';
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'high': return 'bg-red-100 text-red-700 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export type { AnalysisResult, Issue, Suggestion };
