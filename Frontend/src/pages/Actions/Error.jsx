import { AlertCircle, Home } from 'lucide-react';

export default function Error() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Cancelled
        </h1>
        
        <p className="text-gray-600 mb-2">
          We couldn't process your payment at this time.
        </p>
        
        <div className="space-y-3">
          <a
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Home className="w-5 h-5" />
            Return to Homepage
          </a>
        </div>
        
      </div>
    </div>
  );
}