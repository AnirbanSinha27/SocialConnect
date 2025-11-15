import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black overflow-hidden">
      {/* Hero Section */}
      <div className="relative w-full min-h-screen flex items-center justify-center">
        {/* Background gradient accent */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 px-6 py-20 max-w-2xl mx-auto text-center">

          {/* Main heading */}
          <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
            Share Your
            <span className="block bg-linear-to-r from-purple-600 via-pink-600 to-yellow-400 bg-clip-text text-transparent">
              Moments
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 font-light max-w-lg mx-auto leading-relaxed">
            Connect with friends, discover new stories, and celebrate life's most memorable moments together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 w-full max-w-md mx-auto">
            <Link
              href="/auth/login"
              className="flex-1 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-95 shadow-md"
            >
              Log In
            </Link>
            
            <Link
              href="/auth/register"
              className="flex-1 px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 shadow-md"
            >
              Sign Up
            </Link>
          </div>

          {/* Admin Link - subtle */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Administrator?
            </p>
            <Link
              href="/admin"
              className="inline-block px-6 py-2 text-gray-700 dark:text-gray-300 font-medium text-sm border border-gray-300 dark:border-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600"
            >
              Access Admin Panel
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000" />
      </div>
    </div>
  );
}