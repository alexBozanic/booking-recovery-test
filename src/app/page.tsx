import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Booking Recovery Tool
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Recover abandoned calendar bookings with intelligent tracking and automated follow-up campaigns.
          </p>
          
          <div className="space-x-4">
            <Link 
              href="/signup"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/login"
              className="inline-block border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              📊
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Abandonment</h3>
            <p className="text-gray-600">Monitor when visitors leave your booking forms</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              📧
            </div>
            <h3 className="text-lg font-semibold mb-2">Automated Recovery</h3>
            <p className="text-gray-600">Send personalized follow-up messages automatically</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              📈
            </div>
            <h3 className="text-lg font-semibold mb-2">Increase Revenue</h3>
            <p className="text-gray-600">Recover 15-25% of abandoned bookings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
