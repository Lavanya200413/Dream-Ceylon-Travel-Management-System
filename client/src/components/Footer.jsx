import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-gray-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-extrabold text-white">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center">
                <Compass size={18} />
              </div>
              <span>
                <span className="text-amber-400">Smart</span> Lanka
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Smart Lanka Tourism Planner &amp; Travel Management System (Dream Ceylon). Personalized Sri Lankan itineraries, OpenStreetMap route navigation, dynamic tour packages, and verified local hospitality.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
              <ShieldCheck size={13} /> Verified Sri Lanka Tourism Platform
            </div>
          </div>

          {/* Column 2: Explore Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Explore Sri Lanka
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/destinations" className="hover:text-amber-400 transition">
                  50+ Island Destinations
                </Link>
              </li>
              <li>
                <Link to="/planner" className="hover:text-amber-400 transition">
                  Smart Journey &amp; Route Planner
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-amber-400 transition">
                  Basic, Standard &amp; Premium Packages
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-amber-400 transition">
                  Partner Hotels &amp; Eco-Resorts
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-amber-400 transition">
                  Licensed National Tour Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Top Regions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Popular Travel Regions
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>Cultural Triangle (Sigiriya, Kandy, Polonnaruwa)</li>
              <li>Misty Highlands (Ella, Nuwara Eliya, Horton Plains)</li>
              <li>Southern Coast (Galle Fort, Mirissa, Bentota)</li>
              <li>Wildlife &amp; East Coast (Yala, Arugam Bay, Trincomalee)</li>
            </ul>
          </div>

          {/* Column 4: Support & University Info */}
          <div className="space-y-2.5 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Traveler Support &amp; Info
            </h4>
            <p className="flex items-center gap-2 text-gray-400">
              <MapPin size={14} className="text-amber-400 flex-shrink-0" />
              <span>South Eastern University of Sri Lanka (SEUSL)</span>
            </p>
            <p className="flex items-center gap-2 text-gray-400">
              <Phone size={14} className="text-amber-400 flex-shrink-0" />
              <span>SLTDA Tourist Hotline: 1912 • +94 11 242 6900</span>
            </p>
            <p className="flex items-center gap-2 text-gray-400">
              <Mail size={14} className="text-amber-400 flex-shrink-0" />
              <span>support@dreamceylon.lk</span>
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Smart Lanka Tourism Planner (Dream Ceylon). All rights reserved.</p>
          <p>SWT22022 – Practical for Internet Application Development</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
