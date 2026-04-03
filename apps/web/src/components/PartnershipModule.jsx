'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Handshake, Users, Sparkles, Megaphone } from 'lucide-react';

function PartnerLogo({ name, logoUrl, size = 'sm' }) {
  const sizeClasses = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';

  if (logoUrl) {
    return (
      <div
        className={`flex items-center justify-center ${sizeClasses} rounded-lg bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-700`}
        title={name}
      >
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="max-h-6 max-w-6 object-contain"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  return (
    <div
      className={`flex items-center justify-center ${sizeClasses} rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200`}
    >
      {initials}
    </div>
  );
}

export default function PartnershipModule() {
  // Force update
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadPartners() {
      try {
        const res = await fetch(`/api/neon/featured/partners`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load partners');
        const data = await res.json();
        if (active) setPartners(data.partners || []);
      } catch (error) {
        if (active) setPartners([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPartners();
    return () => {
      active = false;
    };
  }, []);

  const { featuredPartners, communityPartners } = useMemo(() => {
    const featured = partners.filter((partner) =>
      ['platinum', 'gold'].includes(String(partner.tier).toLowerCase()),
    );
    const community = partners.filter(
      (partner) => !['platinum', 'gold'].includes(String(partner.tier).toLowerCase()),
    );
    return {
      featuredPartners: featured.slice(0, 3),
      communityPartners: community.slice(0, 6),
    };
  }, [partners]);

  return (
    <section
      className="py-14 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-t border-slate-200/50 dark:border-slate-700/40"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300 mb-2">
              Partnerships
            </p>
            <h2 className="font-heading text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
              <div className="inline-flex rounded-xl bg-teal-50 dark:bg-teal-900/30 p-2 text-teal-700 dark:text-teal-400">
                <Handshake className="w-5 h-5" />
              </div>
              Partnerships & Advertising
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-lg">
              Built for community-led pathways. Showcase partner programs and local opportunities.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/partners/apply"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-500 dark:to-teal-400"
              suppressHydrationWarning
            >
              <Handshake className="w-4 h-4" />
              Partner with us
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md"
              suppressHydrationWarning
            >
              View opportunities
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800 p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-5">
              <div className="inline-flex rounded-xl bg-emerald-50 dark:bg-emerald-900/40 p-2 text-emerald-600 dark:text-emerald-300">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Community Partners
              </span>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                      <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : communityPartners.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-300">
                No partners listed yet.
              </div>
            ) : (
              <div className="space-y-3">
                {communityPartners.map((partner) => (
                  <Link
                    key={partner.id}
                    href={partner.website || `/partners/${partner.slug}`}
                    className="flex items-center justify-between rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 p-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <PartnerLogo name={partner.name} logoUrl={partner.logoUrl} />
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {partner.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                          {partner.tier || 'standard'} partner
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                      {partner.featuredJobs || 0} opportunities
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800 p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-5">
              <div className="inline-flex rounded-xl bg-purple-50 dark:bg-purple-900/40 p-2 text-purple-600 dark:text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Sponsored Pathways
              </span>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                      <div className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </div>
                    <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700 animate-pulse mb-2" />
                    <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : featuredPartners.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-300">
                No sponsored pathways available yet.
              </div>
            ) : (
              <div className="space-y-4">
                {featuredPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <PartnerLogo name={partner.name} logoUrl={partner.logoUrl} size="md" />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 uppercase">
                        Featured
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {partner.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {partner.description ||
                        'Priority pathways and programs curated with community input.'}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-300">
                        {partner.featuredJobs || 0} live opportunities
                      </span>
                      <Link
                        href={`/partners/${partner.slug}`}
                        className="text-[10px] text-purple-700 dark:text-purple-200 font-medium"
                      >
                        View pathway →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800 p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-5">
              <div className="inline-flex rounded-xl bg-sky-50 dark:bg-sky-900/40 p-2 text-sky-600 dark:text-sky-300">
                <Megaphone className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Partner Advertising
              </span>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-300/70 dark:border-slate-600/60 p-5 bg-gradient-to-br from-sky-50/50 to-purple-50/30 dark:from-sky-900/30 dark:to-purple-900/20 text-center">
              <div className="inline-flex rounded-full bg-sky-100 dark:bg-sky-900/50 p-3 text-sky-600 dark:text-sky-300 mb-3">
                <Megaphone className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Reach community-first audiences
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-xs mx-auto">
                Promote verified programs, jobs, scholarships, and events with full cultural review.
              </p>
              <Link
                href="/advertise"
                className="inline-flex items-center gap-1.5 mt-5 px-5 py-2 text-xs font-semibold rounded-full text-white shadow-md shadow-teal-600/15 transition-all hover:-translate-y-0.5 hover:shadow-lg bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-500 dark:to-teal-400"
                suppressHydrationWarning
              >
                Advertise with us
                <span className="text-xs">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-slate-300 dark:to-slate-600" />
          <p className="text-xs text-center text-slate-500 dark:text-slate-300 font-medium">
            All partners are verified and aligned with community values.
          </p>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-slate-300 dark:to-slate-600" />
        </div>
      </div>
    </section>
  );
}
