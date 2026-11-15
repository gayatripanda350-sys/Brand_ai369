import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Sparkles, ShieldCheck, FileText, Brain, BarChart3,
  CheckCircle2, ArrowRight, Star, Zap, Eye, Palette,
  TrendingUp, Target, Clock, Quote, Lightbulb,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg-soft pt-20 pb-32">
        {/* Decorative background blobs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-brand-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-brand-100 text-sm font-medium text-brand-700 mb-6">
                <Zap className="w-4 h-4" />
                AI-Powered Brand Intelligence
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Ensure every word <br />
                <span className="gradient-text">aligns with your brand</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
                Brand AI analyzes your content against brand guidelines in real-time.
                Get instant compliance scores, tone analysis, and AI-powered suggestions
                to keep your brand voice consistent across every channel.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="btn-primary text-base px-8 py-4">
                  Start Free Analysis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-4">
                  Sign In
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Free forever plan
                </div>
              </div>
            </div>

            {/* Hero visual - mock dashboard preview */}
            <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="glass-card rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-400">brand-ai.app/dashboard</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-700">Brand Compliance Score</span>
                    <span className="badge bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3" /> Excellent
                    </span>
                  </div>
                  <div className="flex items-end gap-6 mb-5">
                    <div className="text-4xl font-bold gradient-text">92</div>
                    <div className="text-xs text-gray-400 pb-1">out of 100</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Tone Alignment', score: 95, color: 'bg-green-400' },
                      { label: 'Clarity', score: 88, color: 'bg-brand-400' },
                      { label: 'Consistency', score: 91, color: 'bg-accent-400' },
                      { label: 'Compliance', score: 94, color: 'bg-brand-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{item.label}</span>
                          <span className="font-medium">{item.score}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-accent-50 border border-accent-100">
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-accent-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-accent-800">
                      <span className="font-semibold">AI Suggestion:</span> Consider replacing "very innovative" with "pioneering" for stronger impact.
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 gradient-bg rounded-2xl flex items-center justify-center shadow-xl animate-float">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '10M+', label: 'Words Analyzed', icon: FileText },
              { value: '99.2%', label: 'Accuracy Rate', icon: Target },
              { value: '5,000+', label: 'Brands Protected', icon: ShieldCheck },
              { value: '<2s', label: 'Analysis Speed', icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-brand-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-sm font-medium text-brand-700 mb-4">
              <Sparkles className="w-4 h-4" />
              Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for <span className="gradient-text">brand governance</span>
            </h2>
            <p className="text-lg text-gray-600">
              From content analysis to AI-powered suggestions, Brand AI gives you the tools
              to maintain brand consistency at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'AI Content Analysis',
                desc: 'Paste any content and get instant analysis across tone, clarity, consistency, and compliance dimensions.',
                gradient: 'from-brand-500 to-brand-700',
              },
              {
                icon: Palette,
                title: 'Brand Guidelines Management',
                desc: 'Define your brand voice, tone, keywords, and rules. The AI engine uses these to evaluate every piece of content.',
                gradient: 'from-accent-500 to-accent-700',
              },
              {
                icon: Lightbulb,
                title: 'AI-Powered Suggestions',
                desc: 'Get actionable, context-aware recommendations to improve content alignment with your brand standards.',
                gradient: 'from-brand-500 to-accent-600',
              },
              {
                icon: BarChart3,
                title: 'Compliance Scoring',
                desc: 'Detailed scores across multiple dimensions give you a clear picture of brand compliance at a glance.',
                gradient: 'from-accent-500 to-brand-600',
              },
              {
                icon: TrendingUp,
                title: 'Analysis History',
                desc: 'Track improvements over time with a complete history of all content analyses and their scores.',
                gradient: 'from-brand-600 to-accent-500',
              },
              {
                icon: ShieldCheck,
                title: 'Forbidden Word Detection',
                desc: 'Automatically flag prohibited words and phrases before they reach your audience.',
                gradient: 'from-accent-600 to-brand-500',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="card p-6 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in minutes with a simple, intuitive workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Palette, title: 'Set Your Guidelines', desc: 'Define your brand voice, tone, keywords, and rules in a guided setup.' },
              { step: '02', icon: FileText, title: 'Analyze Content', desc: 'Paste any content — emails, blogs, social posts — for instant AI analysis.' },
              { step: '03', icon: Lightbulb, title: 'Apply Suggestions', desc: 'Review AI suggestions and improve your content to achieve full compliance.' },
            ].map((item, idx) => (
              <div key={item.step} className="relative">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-brand-200 to-accent-200 -translate-x-1/2" />
                )}
                <div className="card p-8 text-center relative z-10">
                  <div className="text-5xl font-bold gradient-text opacity-20 mb-2">{item.step}</div>
                  <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your team. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Free',
                desc: 'Perfect for individuals getting started',
                features: ['100 analyses per month', '1 brand guideline set', 'Basic compliance scoring', '7-day history', 'Email support'],
                cta: 'Get Started',
                highlighted: false,
              },
              {
                name: 'Professional',
                price: '$49',
                desc: 'For growing teams that need more',
                features: ['Unlimited analyses', '5 brand guideline sets', 'Advanced AI suggestions', 'Full analysis history', 'Priority support', 'Team collaboration'],
                cta: 'Start Free Trial',
                highlighted: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                desc: 'For large organizations with custom needs',
                features: ['Everything in Professional', 'Unlimited guideline sets', 'Custom AI training', 'API access', 'Dedicated manager', 'SSO & SAML'],
                cta: 'Contact Sales',
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`card p-8 relative ${plan.highlighted ? 'ring-2 ring-brand-500 shadow-xl scale-105' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge gradient-bg text-white px-4 py-1.5">Most Popular</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  {plan.price !== 'Custom' && plan.price !== 'Free' && (
                    <span className="text-gray-500">/mo</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`w-full ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by brand teams worldwide
            </h2>
            <p className="text-lg text-gray-600">
              See how teams use Brand AI to maintain consistency at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'Brand AI cut our content review time by 70%. The AI suggestions are spot-on and our brand voice has never been more consistent.',
                author: 'Sarah Chen',
                role: 'Head of Content, Nimbus',
                avatar: 'SC',
              },
              {
                quote: 'We manage 12 sub-brands and Brand AI keeps all of them aligned. The compliance scoring gives us real visibility we never had before.',
                author: 'Marcus Rodriguez',
                role: 'Brand Director, Voltaic',
                avatar: 'MR',
              },
              {
                quote: 'The forbidden word detection alone is worth it. We caught several compliance issues before they went public.',
                author: 'Emily Watson',
                role: 'CMO, Brightside',
                avatar: 'EW',
              },
            ].map((t) => (
              <div key={t.author} className="card p-6">
                <Quote className="w-8 h-8 text-brand-200 mb-4" />
                <p className="text-sm text-gray-700 leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.author}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animated-gradient rounded-3xl p-12 text-center text-white shadow-2xl">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to transform your brand governance?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
              Join thousands of teams using Brand AI to ensure every piece of content
              is perfectly on-brand.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
