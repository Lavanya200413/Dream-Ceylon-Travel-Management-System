import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PackageContext } from '../context/PackageContext';
import { Compass, Menu, X, Globe, LayoutDashboard } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/planner', label: 'Smart Planner' },
  { to: '/packages', label: 'Packages' },
  { to: '/hotels', label: 'Hotels' },
  { to: '/guides', label: 'Guides' }
];

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { currency, setCurrency, currencyRates } = useContext(PackageContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-blue-950/95 backdrop-blur-md text-white shadow-lg sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-white group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-blue-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Compass size={22} />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-lg sm:text-xl font-black">
                <span className="text-amber-400">Smart Lanka</span>
              </span>
              <span className="text-[11px] font-semibold tracking-wider text-blue-200/90 uppercase -mt-0.5">
                Dream Ceylon Planner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(item.to)
                    ? 'bg-white/15 text-amber-300 shadow-xs'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Controls: Currency Switcher + Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Multi-Currency Selector (Module 8) */}
            <div className="flex items-center bg-blue-900/90 border border-blue-700/80 rounded-xl px-2.5 py-1.5 text-xs shadow-inner">
              <Globe size={13} className="text-amber-400 mr-1.5 flex-shrink-0" />
              <select
                aria-label="Select Display Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-blue-900 text-amber-300 font-extrabold focus:outline-none cursor-pointer pr-1 border-0"
              >
                {Object.keys(currencyRates || { LKR: 300, USD: 1, EUR: 0.92, GBP: 0.79 }).map(
                  (code) => (
                    <option key={code} value={code} className="bg-white text-gray-900 font-bold py-1">
                      {code} ({currencyRates[code]?.symbol?.trim() || code})
                    </option>
                  )
                )}
              </select>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    isActive('/dashboard')
                      ? 'bg-amber-400 text-blue-950 border-amber-400'
                      : 'bg-blue-900/70 text-blue-100 border-blue-700 hover:bg-blue-800'
                  }`}
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
                <ProfileDropdown />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-blue-100 hover:text-white hover:bg-white/10 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-amber-400 hover:bg-amber-300 text-blue-950 px-4 py-2 rounded-xl transition font-bold text-sm shadow-sm"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <select
              aria-label="Mobile Currency Selector"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-blue-900 border border-blue-700 text-amber-300 text-xs font-bold rounded-lg px-2 py-1.5 md:hidden"
            >
              {Object.keys(currencyRates || { LKR: 300, USD: 1 }).map((code) => (
                <option key={code} value={code} className="bg-white text-gray-900 font-bold">
                  {code} ({currencyRates[code]?.symbol?.trim() || code})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-blue-950 border-t border-white/10 px-4 pt-3 pb-5 space-y-2">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold ${
                isActive(item.to)
                  ? 'bg-white/15 text-amber-300'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-amber-400 text-blue-950 font-bold text-sm"
              >
                Open Dashboard ({user.name})
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-white/20 text-white font-semibold text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-amber-400 text-blue-950 font-bold text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
