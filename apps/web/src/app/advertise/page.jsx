'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/apiClient';

export default function AdvertisePage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    budget: '',
    goals: [],
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [inquiryId, setInquiryId] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);

  const advertisingPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 299,
      period: '/month',
      description: 'Perfect for small businesses getting started',
      features: [
        'Featured job listing (1)',
        'Company profile badge',
        '5,000 impressions/month',
        'Basic analytics dashboard',
        'Email support'
      ],
      highlight: false,
      popular: true
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 799,
      period: '/month',
      description: 'Ideal for growing companies',
      features: [
        'Featured job listings (5)',
        'Premium company profile',
        '25,000 impressions/month',
        'Advanced analytics & reporting',
        'Social feed sponsored posts',
        'Priority email support'
      ],
      highlight: true,
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 1999,
      period: '/month',
      description: 'For established organizations',
      features: [
        'Featured job listings (10)',
        'Premium company profile + branding',
        '100,000 impressions/month',
        'Advanced analytics & reporting',
        'Social feed sponsored posts (5/month)',
        'Dedicated account manager',
        'Custom advertising solutions'
      ],
      highlight: false,
      popular: false
    }
  ];

  const adFormats = [
    {
      icon: '💼',
      title: 'Featured Jobs',
      description: 'Boost your job listings to the top of search results and reach more qualified candidates.'
    },
    {
      icon: '📰',
      title: 'Sponsored Posts',
      description: 'Share your company story, culture, and opportunities directly in the community feed.'
    },
    {
      icon: '🎯',
      title: 'Targeted Campaigns',
      description: 'Reach specific demographics, skills, and locations with precision targeting.'
    },
    {
      icon: '🏆',
      title: 'Event Sponsorship',
      description: 'Sponsor career fairs, workshops, and community events to connect with talent.'
    },
    {
      icon: '📊',
      title: 'Brand Showcase',
      description: 'Create a premium company profile that highlights your culture and opportunities.'
    },
    {
      icon: '📧',
      title: 'Newsletter Features',
      description: 'Get featured in our weekly newsletter reaching thousands of active job seekers.'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Active Members' },
    { value: '2,500+', label: 'Partner Organizations' },
    { value: '85%', label: 'Engagement Rate' },
    { value: '10K+', label: 'Monthly Job Views' }
  ];

  const handleGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  useEffect(() => {
    const loadPartners = async () => {
      try {
        const res = await api('/community/partners/featured');
        if (res.ok) {
          setPartners(res.data?.partners || []);
        }
      } catch (err) {
        console.error('Failed to load partners:', err);
      }
    };
    loadPartners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...formData,
        selectedPlan: selectedPlan?.id || null,
        goals: formData.goals.join(', ')
      };

      const res = await api('/advertising', {
        method: 'POST',
        body: payload
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || 'Failed to submit inquiry');
      }

      setSuccess('Your advertising inquiry has been received! Our partnerships team will contact you within 24-48 hours.');
      setInquiryId(res.data?.id);
      setSelectedPlan(null);
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        budget: '',
        goals: [],
        message: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.');
      console.error('Advertising submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-royal/20 to-black pt-20 px-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gold to-rose-gold flex items-center justify-center text-4xl mx-auto mb-6">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Thank You!</h1>
          <p className="text-white/70 mb-8">
            We&apos;ve received your advertising inquiry. Our partnerships team will be in touch within 24-48 hours to discuss how we can help grow your reach.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-gold to-rose-gold text-black font-semibold hover:opacity-90 transition-opacity"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-royal/20 to-black pt-20 pb-12">
      {/* Hero Section */}
      <section className="px-4 mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-gold/20 to-rose-gold/20 text-gold text-sm font-medium mb-6">
            Partner With Us
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Reach Australia's Growing
            <span className="bg-gradient-to-r from-gold to-rose-gold bg-clip-text text-transparent"> Indigenous Talent </span>
            Community
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Connect with skilled professionals, support community employment, and build your employer brand with purpose-driven advertising.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-gold to-rose-gold bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Formats */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Advertising Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adFormats.map((format, i) => (
              <div key={i} className="royal-card p-6 hover:border-gold/30 transition-colors">
                <span className="text-3xl mb-4 block">{format.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{format.title}</h3>
                <p className="text-white/60 text-sm">{format.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-2">Advertising Plans</h2>
          <p className="text-white/60 text-center mb-8">Choose the plan that fits your recruitment goals</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {advertisingPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`royal-card p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-gold ring-2 ring-gold/30'
                    : plan.highlight
                    ? 'border-gold/50'
                    : 'hover:border-white/30'
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-gold to-rose-gold text-black text-xs font-semibold mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <div className="mb-4">
                  {plan.price ? (
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                  ) : (
                    <span className="text-2xl font-bold text-white">Contact Us</span>
                  )}
                  <span className="text-white/60 text-sm">{plan.period}</span>
                </div>
                <p className="text-white/60 text-sm mb-6">{plan.description}</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                      <span className="text-gold mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="px-4" id="contact">
        <div className="max-w-2xl mx-auto">
          <div className="royal-card p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-2">Get Started</h2>
            <p className="text-white/60 text-center mb-8">
              Tell us about your advertising goals and we&apos;ll create a custom solution
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
                    placeholder="Your company"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
                    placeholder="email@company.com"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
                    placeholder="(04) XXXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Monthly Budget</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold/50"
                >
                  <option value="">Select budget range</option>
                  <option value="under-500">Under $500/month</option>
                  <option value="500-1000">$500 - $1,000/month</option>
                  <option value="1000-2500">$1,000 - $2,500/month</option>
                  <option value="2500-5000">$2,500 - $5,000/month</option>
                  <option value="5000+">$5,000+/month</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Advertising Goals</label>
                <div className="flex flex-wrap gap-2">
                  {['Hire talent', 'Build brand awareness', 'Community engagement', 'Event sponsorship', 'Other'].map(goal => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleGoalToggle(goal)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.goals.includes(goal)
                          ? 'bg-gradient-to-r from-gold to-rose-gold text-black'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Additional Details</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold/50 resize-none"
                  placeholder="Tell us more about your advertising goals and any specific requirements..."
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-gold to-rose-gold text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Inquiry'
                )}
              </button>

              <p className="text-center text-white/40 text-sm">
                By submitting, you agree to our{' '}
                <Link href="/terms" className="text-gold hover:underline">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-4 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Trusted by Leading Organizations</h2>
          <p className="text-white/60 mb-8">
            Join hundreds of companies committed to Indigenous employment and community development
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-60">
            {['BHP', 'Rio Tinto', 'Commonwealth Bank', 'Telstra', 'Qantas', 'Woolworths'].map(company => (
              <div key={company} className="text-white/50 font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
