import Link from 'next/link';

export default function BusinessResourcesPage() {
  return (
    <div className="nexta-page py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="nexta-h1 mb-4">Business Resources</h1>
        <p className="nexta-muted mb-8">
          Tools and references to support business planning and operations.
        </p>

        <div className="nexta-card p-6">
          <div className="space-y-3">
            <Link href="/business/plan-builder" className="nexta-link">
              Business Plan Builder
            </Link>
            <Link href="/business-suite" className="nexta-link">
              Business Suite
            </Link>
            <Link href="/resources" className="nexta-link">
              Platform Resources
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
