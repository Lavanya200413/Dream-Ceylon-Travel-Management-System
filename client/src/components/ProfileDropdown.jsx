import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';

const ProfileDropdown = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fallback to a default avatar if no profile image is available
  const avatarUrl = user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-blue-800 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <img 
          src={avatarUrl} 
          alt="Profile" 
          className="w-8 h-8 rounded-full object-cover border border-blue-500 bg-white"
          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=User`; }}
        />
        <span className="font-medium text-sm hidden md:block max-w-[120px] truncate">{user.name}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 transform origin-top-right transition-all animate-fadeIn">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-800 font-bold truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <div className="mt-2 inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded uppercase tracking-wider">
              {user.role}
            </div>
          </div>

          <div className="py-2">
            <Link 
              to="/dashboard" 
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <LayoutDashboard size={16} className="mr-3 text-gray-400" />
              Dashboard
            </Link>
          </div>

          <div className="py-2 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
