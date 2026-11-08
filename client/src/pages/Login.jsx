import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogIn,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Compass,
  AlertCircle,
  Sparkles,
  MapPin,
  Check,
  ArrowRight
} from 'lucide-react';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Login = () => {
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both your email address and password.');
      return;
    }

    const res = await login(formData.email.trim().toLowerCase(), formData.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid email or password. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden notranslate" translate="no">
      {/* Background Decorative Rings */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden grid lg:grid-cols-12 relative z-10">
        {/* Left Column: Visual Brand Storytelling */}
        <div className="lg:col-span-5 bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Scenic Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80')`
            }}
          />

          <div className="relative z-10 space-y-6">
            {/* Brand Logo & Subtitle */}
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-blue-950 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Compass size={28} />
              </div>
              <div className="text-left">
                <span className="text-2xl font-black text-white leading-tight block tracking-tight">
                  Dream Ceylon
                </span>
                <span className="text-xs font-semibold text-amber-300 block -mt-0.5">
                  Smart Lanka Tourism Planner
                </span>
              </div>
            </Link>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles size={12} /> Member Portal
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 leading-snug">
                Welcome Back to Paradise
              </h2>
              <p className="text-blue-200 text-xs sm:text-sm mt-2 leading-relaxed">
                Log in to view your saved itineraries, review tour guides, manage bookings, and check your interactive travel calendar.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-blue-100">
                <div className="w-6 h-6 rounded-lg bg-blue-800/80 flex items-center justify-center flex-shrink-0 text-amber-300">
                  <Check size={14} />
                </div>
                <span><strong>Saved Itineraries:</strong> Access personalized routes and day plans anytime.</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-blue-100">
                <div className="w-6 h-6 rounded-lg bg-blue-800/80 flex items-center justify-center flex-shrink-0 text-amber-300">
                  <Check size={14} />
                </div>
                <span><strong>Interactive Calendar:</strong> Integrated with official Sri Lankan holidays.</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-blue-100">
                <div className="w-6 h-6 rounded-lg bg-blue-800/80 flex items-center justify-center flex-shrink-0 text-amber-300">
                  <Check size={14} />
                </div>
                <span><strong>Multi-Currency Pricing:</strong> Live conversions in LKR, USD, EUR, GBP & AUD.</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-amber-400" />
              Sri Lanka
            </span>
            <span className="font-semibold text-amber-300">Secure 256-Bit SSL</span>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Sign In to Account
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Enter your email address and password to continue.
                </p>
              </div>
              <span className="text-xs text-gray-500 hidden sm:block">
                New here?{' '}
                <Link to="/register" className="font-bold text-emerald-600 hover:underline">
                  Sign up
                </Link>
              </span>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={17} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="traveler@example.com"
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <Lock size={17} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2"
              >
                <LogIn size={17} />
                <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
              </button>
            </form>

            {/* Social Separator & Google Sign In */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500 font-semibold uppercase">
                  Or continue with
                </span>
              </div>
            </div>

            <div>
              <GoogleLoginButton />
            </div>
          </div>

          {/* Footer & Partner Links */}
          <div className="pt-6 mt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-xs text-gray-600">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-extrabold text-emerald-600 hover:text-emerald-700 underline">
                Create Free Account
              </Link>
            </p>

            <div className="text-[11px] text-gray-500 flex flex-wrap justify-center gap-3">
              <span>Service Partner?</span>
              <Link to="/guides/register" className="font-bold text-blue-700 hover:underline">
                Tour Guide Portal &rarr;
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/hotels/register" className="font-bold text-blue-700 hover:underline">
                Hotel Owner Portal &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
