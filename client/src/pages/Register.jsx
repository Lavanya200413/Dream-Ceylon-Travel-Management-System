import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Compass,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Register = () => {
  const { register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'tourist'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Client-side validations
  const isPasswordLongEnough = formData.password.length >= 6;
  const doPasswordsMatch =
    formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validation checks
    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email format (e.g., traveler@example.com).');
      return;
    }

    if (!isPasswordLongEnough) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password,
      role: formData.role
    };

    const res = await register(payload);
    if (res.success) {
      setSuccessMsg('Account created successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } else {
      setError(res.error || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden notranslate" translate="no">
      {/* Background Decorative Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden grid lg:grid-cols-12 relative z-10">
        {/* Left Column: Visual Brand Storytelling */}
        <div className="lg:col-span-5 bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Scenic Background Overlay Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80')`
            }}
          />

          <div className="relative z-10 space-y-6">
            {/* Brand Logo & Tagline */}
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
                <Sparkles size={12} /> Start Your Journey
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 leading-snug">
                Experience Sri Lanka Like Never Before
              </h2>
              <p className="text-blue-200 text-xs sm:text-sm mt-2 leading-relaxed">
                Personalized AI itineraries, certified local tour guides, verified boutique hotels & real-time travel scheduling across the Pearl of the Indian Ocean.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-blue-100">
                <div className="w-6 h-6 rounded-lg bg-blue-800/80 flex items-center justify-center flex-shrink-0 text-amber-300">
                  <Check size={14} />
                </div>
                <span><strong>50+ Verified Destinations:</strong> Cultural, beach, wildlife & scenic tea hills.</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-blue-100">
                <div className="w-6 h-6 rounded-lg bg-blue-800/80 flex items-center justify-center flex-shrink-0 text-amber-300">
                  <Check size={14} />
                </div>
                <span><strong>Smart Travel Calendar:</strong> Seamlessly synchronizes with Sri Lankan Public & Poya holidays.</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-blue-100">
                <div className="w-6 h-6 rounded-lg bg-blue-800/80 flex items-center justify-center flex-shrink-0 text-amber-300">
                  <Check size={14} />
                </div>
                <span><strong>Verified Partners:</strong> SLTDA certified tour guides & rated luxury accommodations.</span>
              </div>
            </div>
          </div>

          {/* Social Proof / Location Badge */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-amber-400" />
              Sri Lanka Tourism Platform
            </span>
            <span className="font-semibold text-amber-300">100% Free Signup</span>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Create an Account
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Fill in your details to start planning your Sri Lankan trip today.
                </p>
              </div>
              <span className="text-xs text-gray-500 hidden sm:block">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-blue-600 hover:underline">
                  Log in
                </Link>
              </span>
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={17} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kasun Bandara"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
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
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={17} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+94 77 123 4567"
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  I Want To Join As <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'tourist', label: 'Tourist', subtitle: 'Plan & Explore' },
                    { id: 'guide', label: 'Tour Guide', subtitle: 'Offer Tours' },
                    { id: 'hotel_owner', label: 'Hotel Owner', subtitle: 'List Stays' }
                  ].map((roleOption) => (
                    <button
                      key={roleOption.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: roleOption.id })}
                      className={`p-2.5 text-left rounded-xl border transition ${
                        formData.role === roleOption.id
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-600'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{roleOption.label}</span>
                        {formData.role === roleOption.id && (
                          <CheckCircle2 size={14} className="text-blue-600" />
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        {roleOption.subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={17} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={17} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements Real-Time Checklist */}
              {formData.password && (
                <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1">
                  <span
                    className={`flex items-center gap-1 font-semibold ${
                      isPasswordLongEnough ? 'text-emerald-700' : 'text-gray-500'
                    }`}
                  >
                    <CheckCircle2 size={13} className={isPasswordLongEnough ? 'text-emerald-600' : 'text-gray-300'} />
                    6+ characters
                  </span>
                  <span
                    className={`flex items-center gap-1 font-semibold ${
                      doPasswordsMatch ? 'text-emerald-700' : 'text-gray-500'
                    }`}
                  >
                    <CheckCircle2 size={13} className={doPasswordsMatch ? 'text-emerald-600' : 'text-gray-300'} />
                    Passwords match
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? 'Creating Your Account...' : 'Create Dream Ceylon Account'}</span>
                <ArrowRight size={17} />
              </button>
            </form>

            {/* Social Separator & Google Sign In */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500 font-semibold uppercase">
                  Or register with
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
              Already have an account?{' '}
              <Link to="/login" className="font-extrabold text-blue-900 hover:text-blue-700 underline">
                Log In Here
              </Link>
            </p>

            <div className="text-[11px] text-gray-500 flex flex-wrap justify-center gap-3">
              <span>Are you a hospitality partner?</span>
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

export default Register;
