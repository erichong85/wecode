import React from 'react';
import { Globe, Eye } from 'lucide-react';
import { Button } from '../components/Button';
import { HostedSite } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface LandingPageProps {
  onGetStarted: () => void;
  publicSites: HostedSite[];
  onViewSite: (site: HostedSite) => void;
  isLoggedIn: boolean;
}

// Define July Fund inspired color palette
const CARD_THEMES = [
  { bg: 'bg-cream-100', text: 'text-charcoal', border: 'border-charcoal/5', tag: 'bg-accent-green text-charcoal' },
  { bg: 'bg-[#FBC02D]', text: 'text-charcoal', border: 'border-charcoal/10', tag: 'bg-charcoal text-white' }, // Soft Yellow
  { bg: 'bg-[#a78bfa]', text: 'text-white', border: 'border-white/10', tag: 'bg-white text-charcoal' }, // Purple
  { bg: 'bg-[#4ade80]', text: 'text-charcoal', border: 'border-charcoal/10', tag: 'bg-charcoal text-white' }, // Green
  { bg: 'bg-[#252221]', text: 'text-cream-100', border: 'border-white/10', tag: 'bg-accent-green text-charcoal' }, // Darker than main bg (Main is #322f2e)
  { bg: 'bg-[#FFAB91]', text: 'text-charcoal', border: 'border-charcoal/10', tag: 'bg-white text-charcoal' }, // Orange-ish
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
    <div className="min-h-screen bg-charcoal font-sans selection:bg-accent-green selection:text-charcoal">

      {/* Hero Section - Light Cream Background */}
      <div className="bg-cream-100 relative pt-32 pb-20 rounded-b-[3rem] shadow-2xl z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent-green text-charcoal text-xs font-bold tracking-wider uppercase mb-8">
              {t('landing.badge')}
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-charcoal mb-8 tracking-tight leading-[0.9]">
              {t('landing.title_prefix')}<span className="italic">{t('landing.title_suffix')}</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left mt-16 max-w-3xl mx-auto">
              <div>
                <h2 className="font-serif text-3xl text-charcoal mb-4">{t('landing.subtitle')}</h2>
              </div>
              <div>
                <p className="text-charcoal-light text-lg leading-relaxed mb-8">
                  {t('landing.description')}
                </p>
                <Button size="lg" onClick={onGetStarted} className="rounded-full px-8 border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors">
                  {isLoggedIn ? t('landing.goToDashboard') : t('landing.startBuilding')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Sites Section - Dark Background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {publicSites && publicSites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicSites.slice(0, 9).map((site, index) => {
              const theme = getThemeForSite(site.id);
              return (
                <div
                  key={site.id}
                  className={`group ${theme.bg} rounded-2xl overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 duration-500 ${index % 3 === 1 ? 'lg:translate-y-12' : ''}`}
                  onClick={() => onViewSite(site)}
                >
                  {/* Card Header */}
                  <div className="p-6 pb-0 flex justify-between items-start">
                    <div className={`inline-block px-2 py-1 ${theme.tag} text-[10px] font-bold uppercase tracking-wider rounded-sm`}>
                      {t('common.new')}
                    </div>
                  </div>

                  {/* Title Section */}
                  <div className="px-6 py-8 text-center">
                    <h3 className={`font-serif text-3xl ${theme.text} mb-2 leading-tight group-hover:underline decoration-1 underline-offset-4`}>
                      {site.title}
                    </h3>
                    <p className={`text-xs ${theme.text} opacity-60 uppercase tracking-widest mt-4`}>
                      {t('landing.byUser')} • {site.views} {t('common.views')}
                    </p>
                  </div>

                  {/* Preview Image */}
                  <div className="px-4 pb-4">
                    <div className={`aspect-[4/3] rounded-xl overflow-hidden bg-white relative shadow-inner ${theme.border} border`}>
                      {site.htmlContent ? (
                        <iframe
                          srcDoc={site.htmlContent}
                          className="w-[200%] h-[200%] transform scale-50 origin-top-left pointer-events-none select-none bg-white"
                          title={site.title}
                          tabIndex={-1}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Globe className="w-12 h-12 opacity-20" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date & Description (Simulated) */}
                  <div className="px-6 pb-6 text-center">
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${theme.text} opacity-40 mb-4`}>
                      {new Date(site.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                    </div>
                    <p className={`text-sm ${theme.text} opacity-80 line-clamp-2 mb-6 font-serif`}>
                      {site.description || "A beautiful website created with HostGenie. Explore the design and functionality."}
                    </p>

                    {/* View Site Button with Scroll Effect */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewSite(site); }}
                      className={`group/btn relative overflow-hidden rounded-full border ${theme.text === 'text-white' ? 'border-white hover:bg-white hover:text-charcoal' : 'border-charcoal hover:bg-charcoal hover:text-cream-100'} px-8 py-3 bg-transparent transition-colors mx-auto block ${theme.text}`}
                    >
                      <div className="relative h-4 overflow-hidden w-24">
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-transform duration-300 ease-out group-hover/btn:-translate-y-full">
                          {t('landing.viewSite')}
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-transform duration-300 ease-out translate-y-full group-hover/btn:translate-y-0">
                          {t('landing.viewSite')}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Footer Stats */}
                  <div className={`px-6 py-4 flex justify-center items-center border-t ${theme.border} space-x-6`}>
                    <div className={`flex items-center text-xs font-medium ${theme.text} opacity-60`}>
                      <Eye className="w-3 h-3 mr-1" />
                      {site.views}
                    </div>
                    <div className={`flex items-center text-xs font-medium ${theme.text} opacity-60`}>
                      <span className="w-2 h-2 rounded-full bg-red-400 mr-1"></span>
                      {site.likes}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-white/60 py-24">
            <p>{t('landing.noSites')}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-24 bg-cream-100 rounded-3xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex space-x-8">
              <a href="/images/xhs-code.jpg" target="_blank" className="text-charcoal/60 hover:text-charcoal transition-colors text-sm font-medium tracking-wide">{t('footer.redNote')}</a>
              <a href="/images/wechat-code.png" target="_blank" className="text-charcoal/60 hover:text-charcoal transition-colors text-sm font-medium tracking-wide">{t('footer.weChat')}</a>
              <a href="/images/wechat-code.png" target="_blank" className="text-charcoal/60 hover:text-charcoal transition-colors text-sm font-medium tracking-wide">{t('footer.planet')}</a>
            </div>
            <div className="text-charcoal/40 text-xs font-mono">
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
