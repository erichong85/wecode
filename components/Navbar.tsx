import { LogOut, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  onDashboard: () => void;
  onLogin: () => void;
  onHome: (view?: string) => void;
  userEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogout, onDashboard, onLogin, onHome, userEmail }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-cyber-black border-b-4 border-charcoal dark:border-neon-blue transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onHome()}>
            <img src="/images/logo.svg" alt="HostGenie Logo" className="h-10 w-10 mr-3 object-contain" />
            <span className="font-serif text-2xl font-bold text-charcoal dark:text-white tracking-tight">
              Host<span className="italic text-pop-yellow dark:text-neon-yellow">Genie</span>
            </span>
            <span className="ml-16 text-base md:text-lg font-extrabold text-charcoal dark:text-white hidden sm:inline-block tracking-wide drop-shadow-sm">
              轻松创造 <span className="text-pop-pink dark:text-neon-pink mx-1">|</span> 即刻分享
            </span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md border-2 border-charcoal dark:border-neon-pink bg-white dark:bg-cyber-gray text-charcoal dark:text-neon-pink shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              title={theme === 'light' ? 'Switch to Cyberpunk Mode' : 'Switch to Pop Mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-xs font-bold border-2 border-charcoal dark:border-neon-green rounded-md bg-pop-purple dark:bg-cyber-gray text-charcoal dark:text-neon-green shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              {language === 'zh' ? 'EN' : '中'}
            </button>

            {isLoggedIn ? (
              <>
                <button
                  onClick={onDashboard}
                  className="px-4 py-2 text-sm font-bold border-2 border-charcoal rounded-lg bg-pop-yellow text-charcoal shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  {t('common.dashboard')}
                </button>
                <button
                  onClick={() => onHome && onHome('prompts')}
                  className="px-4 py-2 text-sm font-bold border-2 border-charcoal rounded-lg bg-pop-blue text-charcoal shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  {t('prompts.title')}
                </button>
                <div className="flex items-center space-x-3 ml-2 pl-2 border-l-2 border-charcoal/20">
                  <span className="px-3 py-1.5 text-xs font-bold border-2 border-charcoal rounded-md bg-white text-charcoal shadow-neo-sm">
                    {userEmail?.split('@')[0]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="bg-pop-pink border-2 border-charcoal text-charcoal shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-pop-pink"
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
                className="rounded-lg bg-charcoal text-white border-2 border-charcoal shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
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