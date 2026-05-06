import { Link } from 'react-router-dom'
import { Bot } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <header className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 font-semibold text-sm">
          <Bot size={18} />
          AI Secretary
        </Link>
        <Link to="/login" className="text-sm text-blue-500 hover:underline">Back to app</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: May 2025</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            By creating an account or using AI Secretary, you agree to these Terms of Service.
            If you do not agree, please do not use the app.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Description of Service</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            AI Secretary is a personal productivity assistant that helps you manage tasks,
            contacts, calendar events, and emails using AI. Features include daily briefings,
            AI chat, and optional Google account integration.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. Your Account</h2>
          <ul className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1">
            <li>You are responsible for keeping your login credentials secure.</li>
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>You must be at least 18 years old to use this service.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Acceptable Use</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">You agree not to:</p>
          <ul className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1">
            <li>Use the app for any unlawful purpose.</li>
            <li>Attempt to reverse-engineer, hack, or disrupt the service.</li>
            <li>Use automated scripts to make excessive API requests.</li>
            <li>Share your account with others or resell access.</li>
            <li>Upload content that is harmful, offensive, or violates others' rights.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Google Account Integration</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            When you connect your Google account, you authorise AI Secretary to access your
            Google Calendar, Gmail, and Contacts on your behalf. You can revoke this access
            at any time from Settings or from your Google Account permissions page.
            We only access Google data to provide the features described in the app.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. AI-Generated Content</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            AI Secretary uses OpenAI to generate briefings, chat responses, and email drafts.
            AI-generated content may be inaccurate or incomplete. You are responsible for
            reviewing AI-generated content before acting on it, especially for email drafts
            and calendar events.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. Availability</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            We aim to keep the service available but do not guarantee 100% uptime.
            The service may be temporarily unavailable due to maintenance, upgrades,
            or factors outside our control. We are not liable for any losses caused by
            service downtime.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">8. Subscription and Payments</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Some features may require a paid subscription. Subscription fees are charged in
            advance and are non-refundable except where required by applicable law.
            We reserve the right to change pricing with 30 days' notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">9. Termination</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            You may delete your account at any time from Settings. We reserve the right to
            suspend or terminate accounts that violate these terms. Upon termination, your
            data will be deleted within 30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">10. Limitation of Liability</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            AI Secretary is provided "as is". We are not liable for any indirect, incidental,
            or consequential damages arising from your use of the app, including but not
            limited to data loss, missed appointments, or errors in AI-generated content.
            Our total liability is limited to the amount you paid us in the past 3 months.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">11. Changes to Terms</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            We may update these terms from time to time. We will notify you of significant
            changes via email or an in-app notice. Continued use of the app after changes
            means you accept the updated terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">12. Governing Law</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            These terms are governed by the laws of India. Any disputes shall be subject
            to the exclusive jurisdiction of courts in India.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">13. Contact</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            For questions about these terms, contact us at:{' '}
            <a href="mailto:kmohaneesh@gmail.com" className="text-blue-500 hover:underline">
              kmohaneesh@gmail.com
            </a>
          </p>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 text-center text-xs text-gray-400">
        <div className="flex justify-center gap-6">
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}
