import React from 'react';
import { Plus, Trash2, Eye, Edit2, Globe, Heart, Bookmark } from 'lucide-react';
import { HostedSite, User } from '../types';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { EmptyState } from '../components/EmptyState';
import { sanitizeHTML, getSafeSandbox } from '../lib/sanitize';

interface DashboardProps {
  user: User | null;
  sites: HostedSite[];
  onEditSite: (site: HostedSite) => void;
  onDeleteSite: (id: string) => void;
  onViewSite: (site: HostedSite) => void;
  onLikeSite: (siteId: string) => void;
  onFavoriteSite: (siteId: string) => void;
  userLikes: string[];
  userFavorites: string[];
  isSyncing: boolean;
  onSync: () => void;
  onUsePrompt: (p: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, sites, onEditSite, onDeleteSite, onViewSite, 
  onLikeSite, onFavoriteSite, userLikes, userFavorites, 
  isSyncing, onSync, onUsePrompt 
}) => {
  const { t } = useLanguage();

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b-[8px] border-charcoal dark:border-neon-blue pb-6 gap-6">
        <h2 className="font-black text-6xl md:text-7xl lg:text-8xl text-charcoal dark:text-white uppercase tracking-tighter transform -rotate-2 origin-left">
          {t('dashboard.title') || 'WEBSITES'}
        </h2>
        <div className="flex items-center space-x-3">
          <Button onClick={onSync} variant="outline" disabled={isSyncing} className="rounded-none px-4 py-4 bg-white dark:bg-cyber-gray text-charcoal dark:text-white border-4 border-charcoal shadow-neo transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-none">
             {isSyncing ? '...' : <Globe className="w-5 h-5" />}
          </Button>
          <Button onClick={() => onUsePrompt('')} variant="primary" className="rounded-none px-6 py-4 bg-pop-pink dark:bg-neon-pink text-charcoal font-black uppercase text-xl border-4 border-charcoal shadow-neo transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-none whitespace-nowrap">
            <Plus className="w-6 h-6 mr-2 stroke-[3]" />
            {t('dashboard.createNew')}
          </Button>
        </div>
      </div>

      {sites.length === 0 ? (
        <EmptyState
          message={t('dashboard.noSites')}
          action={
            <Button onClick={() => onUsePrompt('')} variant="primary" className="rounded-none px-8 py-4 bg-pop-yellow dark:bg-neon-yellow text-charcoal font-black uppercase text-2xl border-4 border-charcoal shadow-neo transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-none">
              {t('dashboard.createNew')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {sites.map((site) => (
            <div key={site.id} className="group flex flex-col bg-white dark:bg-cyber-gray overflow-hidden border-4 border-charcoal dark:border-neon-pink shadow-neo transition-all hover:-translate-y-2 hover:-translate-x-2 hover:shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-none duration-200">
              {/* Preview Area - Clickable */}
              <div
                className="relative h-48 bg-white dark:bg-cyber-black border-b-4 border-charcoal dark:border-neon-pink cursor-pointer group-hover:opacity-95 transition-opacity overflow-hidden"
                onClick={() => onViewSite(site)}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10 transform rotate-2 group-hover:rotate-0 transition-transform">
                  <span className={`px-4 py-2 border-4 border-charcoal text-xs font-black uppercase tracking-widest shadow-neo-sm ${site.published ? 'bg-pop-green dark:bg-neon-green text-charcoal' : 'bg-gray-200 dark:bg-gray-700 text-charcoal dark:text-white'}`}>
                    {site.published ? t('common.live') : t('common.draft')}
                  </span>
                </div>

                {site.htmlContent ? (
                  <iframe
                    srcDoc={sanitizeHTML(site.htmlContent)}
                    className="w-[200%] h-[200%] transform scale-50 origin-top-left pointer-events-none select-none"
                    title={site.title}
                    tabIndex={-1}
                    loading="lazy"
                    sandbox={getSafeSandbox()}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-charcoal/20 dark:text-white/20">
                    <Globe className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="flex-grow flex flex-col p-5 bg-white dark:bg-cyber-gray">
                <div className="mb-4">
                  <h3 className="font-bold text-xl text-charcoal dark:text-white mb-1 line-clamp-1 group-hover:underline decoration-2 underline-offset-2" title={site.title}>
                    {site.title || "Untitled Project"}
                  </h3>
                  <div className="text-[10px] text-charcoal/40 dark:text-white/40 font-mono uppercase tracking-wider">
                    {formatDate(site.createdAt)}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-t-2 border-charcoal/10 dark:border-white/10">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onLikeSite(site.id); }}
                      className={`flex items-center px-2 py-1 rounded-md border transition-all ${userLikes.includes(site.id) ? 'bg-pop-pink text-white border-charcoal' : 'bg-pop-pink/10 dark:bg-neon-pink/10 border-charcoal/10 dark:border-neon-pink/30 text-charcoal/60 dark:text-neon-pink'}`}
                    >
                      <Heart className={`w-3 h-3 mr-1 ${userLikes.includes(site.id) ? 'fill-current' : ''}`} />
                      <span>{site.likes || 0}</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onFavoriteSite(site.id); }}
                      className={`flex items-center px-2 py-1 rounded-md border transition-all ${userFavorites.includes(site.id) ? 'bg-pop-blue text-white border-charcoal' : 'bg-pop-blue/10 dark:bg-neon-blue/10 border-charcoal/10 dark:border-neon-blue/30 text-charcoal/60 dark:text-neon-blue'}`}
                    >
                      <Bookmark className={`w-3 h-3 mr-1 ${userFavorites.includes(site.id) ? 'fill-current' : ''}`} />
                      <span>{site.favorites || 0}</span>
                    </button>
                    <div className="flex items-center px-2 py-1 rounded-md bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 text-xs font-bold text-charcoal/60 dark:text-white/60">
                      <Eye className="w-3 h-3 mr-1 text-charcoal/60 dark:text-white/60" />
                      <span>{site.views || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditSite(site); }}
                      className="p-3 border-4 border-charcoal dark:border-neon-yellow bg-pop-yellow dark:bg-neon-yellow text-charcoal shadow-neo-sm hover:shadow-neo hover:-translate-y-[2px] hover:-translate-x-[2px] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                      title={t('common.edit')}
                    >
                      <Edit2 className="w-5 h-5 stroke-[3]" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewSite(site); }}
                      className="p-3 border-4 border-charcoal dark:border-neon-blue bg-pop-blue dark:bg-neon-blue text-charcoal shadow-neo-sm hover:shadow-neo hover:-translate-y-[2px] hover:-translate-x-[2px] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                      title={t('common.view')}
                    >
                      <Eye className="w-5 h-5 stroke-[3]" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteSite(site.id); }}
                      className="p-3 border-4 border-charcoal dark:border-neon-pink bg-pop-pink dark:bg-neon-pink text-charcoal hover:bg-red-500 hover:text-white shadow-neo-sm hover:shadow-neo hover:-translate-y-[2px] hover:-translate-x-[2px] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
