import Link from 'next/link';

export default function BusinessSuiteHelpPage() {
  return (
    <div className="nexta-page py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="nexta-h1 mb-4">Business Suite Help</h1>
        <p className="nexta-muted mb-8">
          Guides and FAQs for Accounting, Cashbook, and Invoicing.
        </p>

        <div className="nexta-card p-6">
          <div className="space-y-3">
            <Link href="/business-suite" className="nexta-link">
              Back to Business Suite
            </Link>
            <Link href="/help" className="nexta-link">
              Help Centre
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
