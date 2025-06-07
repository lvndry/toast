export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
            Terms of services were never written for you...
            <span className="text-blue-600">until now</span>
          </h1>

          <div className="max-w-3xl mx-auto space-y-6 text-lg md:text-xl text-slate-700 leading-relaxed">
            <p>
              Legal documents don&apos;t have to be confusing anymore. Our platform transforms
              complex legal jargon into clear, understandable language that actually makes sense.
            </p>

            <p>
              Whether it&apos;s privacy policies, terms of service, cookie policies, or any other
              legal document – we break down the complicated language and highlight what
              really matters to you.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="text-blue-600 text-2xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Privacy Policies</h3>
            <p className="text-slate-600">
              Understand how your data is collected, used, and shared in plain English.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="text-blue-600 text-2xl mb-4">🍪</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Cookie Policies</h3>
            <p className="text-slate-600">
              Learn what cookies are tracking you and what you can do about it.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="text-blue-600 text-2xl mb-4">⚖️</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Terms of Service</h3>
            <p className="text-slate-600">
              Know your rights and obligations without needing a law degree.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 text-white p-8 rounded-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Stop accepting terms you don&apos;t understand
          </h2>
          <p className="text-xl mb-6 text-blue-100">
            Join thousands of users who now actually know what they&apos;re agreeing to.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
}
