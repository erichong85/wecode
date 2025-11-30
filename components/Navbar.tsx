import React from 'react';
import { LogOut } from 'lucide-react';
import { User } from '../types';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  onDashboard: () => void;
  onLogin: () => void;
  onHome: () => void;
  userEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogout, onDashboard, onLogin, onHome, userEmail }) => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-100/80 backdrop-blur-md border-b border-charcoal/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={onHome}>
            <span className="font-serif text-2xl font-bold text-charcoal tracking-tight">
              Host<span className="italic">Genie</span>
            </span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="text-sm font-medium text-charcoal/60 hover:text-charcoal transition-colors"
            >
              {language === 'zh' ? 'EN' : '中'}
            </button>

            {isLoggedIn ? (
              <>
                <button
                  onClick={onDashboard}
                  className="text-sm font-medium text-charcoal hover:text-accent-purple transition-colors"
                >
                  {t('common.dashboard')}
                </button>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-charcoal/40 font-mono hidden sm:block">
                    {userEmail?.split('@')[0]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-charcoal/60 hover:text-red-500"
                  >
                    {t('common.logout')}
                  </Button>
                </div>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onLogin}
                className="rounded-full bg-charcoal text-cream-100 hover:bg-charcoal-light px-6"
              >
                {t('common.login')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};