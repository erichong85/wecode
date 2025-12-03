import React from 'react';
import { Globe, Eye, ArrowRight, Heart, Bookmark } from 'lucide-react';
import { Button } from '../components/Button';
import { HostedSite } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { EmptyState } from '../components/EmptyState';

interface LandingPageProps {
  onGetStarted: () => void;
  publicSites: HostedSite[];
  onViewSite: (site: HostedSite) => void;
  isLoggedIn: boolean;
}

// Define July Fund inspired color palette
const CARD_THEMES = [
  { bg: 'bg-white', text: 'text-charcoal', border: 'border-charcoal', tag: 'bg-pop-green text-charcoal border-2 border-charcoal' },
  { bg: 'bg-pop-yellow', text: 'text-charcoal', border: 'border-charcoal', tag: 'bg-white text-charcoal border-2 border-charcoal' },
  { bg: 'bg-pop-purple', text: 'text-charcoal', border: 'border-charcoal', tag: 'bg-white text-charcoal border-2 border-charcoal' },
  { bg: 'bg-pop-green', text: 'text-charcoal', border: 'border-charcoal', tag: 'bg-white text-charcoal border-2 border-charcoal' },
  { bg: 'bg-pop-blue', text: 'text-charcoal', border: 'border-charcoal', tag: 'bg-white text-charcoal border-2 border-charcoal' },
  { bg: 'bg-pop-pink', text: 'text-charcoal', border: 'border-charcoal', tag: 'bg-white text-charcoal border-2 border-charcoal' },
];

const getThemeForSite = (id: string) => {
  // Simple hash function to deterministically pick a theme based on ID
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CARD_THEMES[Math.abs(hash) % CARD_THEMES.length];
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, publicSites, onViewSite, isLoggedIn }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white dark:bg-cyber-black font-sans selection:bg-pop-yellow selection:text-charcoal transition-colors duration-300">

      {/* Hero Section */}
      {/* Hero Section */}
      <div className="bg-white dark:bg-cyber-black relative pt-32 pb-20 border-b-4 border-charcoal dark:border-neon-blue z-10 transition-colors duration-300 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dot-pattern pointer-events-none" />

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-10 animate-float-slow hidden lg:block">
          <div className="w-12 h-12 bg-pop-yellow border-2 border-charcoal rounded-full flex items-center justify-center shadow-neo">
            <span className="text-2xl">✨</span>
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-float-medium hidden lg:block">
          <div className="w-16 h-16 bg-pop-pink border-2 border-charcoal rotate-12 flex items-center justify-center shadow-neo">
            <span className="text-3xl text-white font-bold">{'</>'}</span>
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float-fast hidden lg:block">
          <div className="w-10 h-10 bg-pop-blue border-2 border-charcoal rounded-lg -rotate-6 flex items-center justify-center shadow-neo">
            <Globe className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Content (Moved Up) */}
            <div className="flex flex-col items-center text-center mb-16 max-w-3xl mx-auto">
              <div>
                <h2 className="font-extrabold text-5xl md:text-6xl text-charcoal dark:text-white mb-8 border-b-8 border-pop-yellow dark:border-neon-yellow inline-block leading-tight tracking-tight">
                  {t('landing.subtitle')}
                </h2>
              </div>
              <div>
                <p className="text-charcoal dark:text-gray-300 text-xl leading-relaxed font-medium max-w-2xl mx-auto">
                  {t('landing.description')}
                </p>
              </div>
            </div>

            {/* Search Bar (Moved Down) */}
            <div className="relative max-w-2xl mx-auto mb-12 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pop-pink via-pop-purple to-pop-blue rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('landing.searchPlaceholder') || "Search or type to create..."}
                  className="w-full h-20 pl-10 pr-24 rounded-full border-4 border-charcoal dark:border-neon-pink bg-white dark:bg-cyber-gray text-xl font-bold text-charcoal dark:text-white placeholder-charcoal/40 dark:placeholder-white/30 focus:outline-none focus:ring-0 shadow-neo dark:shadow-[4px_4px_0px_0px_#FF00FF] transition-all focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none"
                />
                <button className="absolute right-4 top-4 bottom-4 aspect-square bg-charcoal dark:bg-neon-pink rounded-full text-white dark:text-charcoal flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
                  <ArrowRight className="w-8 h-8" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Sites Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Toggle Switch */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white dark:bg-cyber-gray border-4 border-charcoal dark:border-neon-green rounded-full p-1 shadow-neo dark:shadow-[4px_4px_0px_0px_#39FF14]">
            <button className="px-6 py-2 rounded-full bg-pop-yellow dark:bg-neon-green text-charcoal font-bold text-sm border-2 border-charcoal dark:border-cyber-black shadow-sm transition-transform hover:-translate-y-0.5">
              Featured
            </button>
            <button className="px-6 py-2 rounded-full text-charcoal dark:text-white font-bold text-sm hover:bg-charcoal/5 dark:hover:bg-white/10 transition-colors">
              Latest
            </button>
          </div>
        </div>
        {publicSites && publicSites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {publicSites.slice(0, 9).map((site, index) => {
              const theme = getThemeForSite(site.id);
              return (
                <div
                  key={site.id}
                  className={`group relative flex flex-col h-full bg-white dark:bg-cyber-gray border-2 md:border-4 border-charcoal dark:border-neon-purple rounded-xl overflow-hidden shadow-neo-sm md:shadow-neo dark:shadow-[2px_2px_0px_0px_#FF00FF] md:dark:shadow-[4px_4px_0px_0px_#FF00FF] transition-all hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-neo md:hover:shadow-neo-lg dark:hover:shadow-[4px_4px_0px_0px_#FF00FF] md:dark:hover:shadow-[8px_8px_0px_0px_#FF00FF] hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer`}
                  onClick={() => onViewSite(site)}
                >
                  {/* Top: Preview Section (2/3 height) */}
                  <div className={`relative h-64 ${theme.bg} border-b-2 md:border-b-4 border-charcoal dark:border-neon-purple overflow-hidden group-hover:opacity-95 transition-opacity`}>
                    {/* Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`px-3 py-1.5 ${theme.tag} text-xs font-bold uppercase tracking-wider rounded-md shadow-neo-sm transform rotate-2 group-hover:rotate-0 transition-transform`}>
                        {t('common.new')}
                      </div>
                    </div>

                    {/* Iframe/Preview */}
                    {site.htmlContent ? (
                      <iframe
                        srcDoc={site.htmlContent}
                        className="w-[200%] h-[200%] transform scale-50 origin-top-left pointer-events-none select-none"
                        title={site.title}
                        tabIndex={-1}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-charcoal/20">
                        <Globe className="w-16 h-16" />
                      </div>
                    )}
                  </div>

                  {/* Bottom: Info Section (1/3 height, always white) */}
                  <div className="flex-grow flex flex-col justify-between p-5 bg-white dark:bg-cyber-gray">
                    {/* Title/Description */}
                    <div className="mb-4">
                      <h3 className="font-bold text-xl text-charcoal dark:text-white mb-2 leading-tight line-clamp-2 group-hover:underline decoration-2 underline-offset-2" title={site.title}>
                        {site.title || site.description || "Untitled Project"}
                      </h3>
                    </div>

                    {/* Footer: Stats */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-charcoal/10 dark:border-white/10">
                      {/* Likes & Favorites */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center px-2 py-1 rounded-md bg-pop-pink/10 dark:bg-neon-pink/10 border border-charcoal/10 dark:border-neon-pink/30 text-xs font-bold text-charcoal/60 dark:text-neon-pink">
                          <Heart className="w-3 h-3 mr-1 text-pop-pink dark:text-neon-pink" />
                          <span>{site.likes || 0}</span>
                        </div>
                        <div className="flex items-center px-2 py-1 rounded-md bg-pop-blue/10 dark:bg-neon-blue/10 border border-charcoal/10 dark:border-neon-blue/30 text-xs font-bold text-charcoal/60 dark:text-neon-blue">
                          <Bookmark className="w-3 h-3 mr-1 text-pop-blue dark:text-neon-blue" />
                          <span>{site.favorites || 0}</span>
                        </div>
                      </div>

                      {/* Views */}
                      <div className="flex items-center px-2 py-1 rounded-md bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10">
                        <Eye className="w-3 h-3 mr-1 text-charcoal/60 dark:text-white/60" />
                        <span className="text-xs font-bold text-charcoal/60 dark:text-white/60">{site.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState message={t('landing.noSites')} />
        )}

        {/* Footer */}
        <div className="mt-24 bg-white dark:bg-cyber-gray border-4 border-charcoal dark:border-neon-yellow shadow-neo dark:shadow-[4px_4px_0px_0px_#E2F546] rounded-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex space-x-8">
              <a href="/images/xhs-code.jpg" target="_blank" className="text-charcoal dark:text-white hover:text-pop-purple dark:hover:text-neon-purple transition-colors text-sm font-bold tracking-wide border-b-2 border-transparent hover:border-charcoal dark:hover:border-neon-purple">{t('footer.redNote')}</a>
              <a href="/images/wechat-code.jpg" target="_blank" className="text-charcoal dark:text-white hover:text-pop-green dark:hover:text-neon-green transition-colors text-sm font-bold tracking-wide border-b-2 border-transparent hover:border-charcoal dark:hover:border-neon-green">{t('footer.weChat')}</a>
              <a href="/images/wechat-code.png" target="_blank" className="text-charcoal dark:text-white hover:text-pop-blue dark:hover:text-neon-blue transition-colors text-sm font-bold tracking-wide border-b-2 border-transparent hover:border-charcoal dark:hover:border-neon-blue">{t('footer.planet')}</a>
            </div>
            <div className="text-charcoal/60 dark:text-white/40 text-xs font-mono">
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
