import React from 'react';
import { Plus, Trash2, Eye, Edit2, Globe, Heart, Bookmark } from 'lucide-react';
import { HostedSite } from '../types';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { EmptyState } from '../components/EmptyState';

interface DashboardProps {
  sites: HostedSite[];
  onCreateNew: () => void;
  onViewSite: (site: HostedSite) => void;
  onEditSite: (site: HostedSite) => void;
  onDeleteSite: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ sites, onCreateNew, onViewSite, onEditSite, onDeleteSite }) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
      <div className="flex justify-end items-end mb-12 border-b-4 border-charcoal dark:border-neon-blue pb-6">
        <Button onClick={onCreateNew} variant="primary" className="rounded-lg px-6 bg-charcoal dark:bg-neon-yellow text-white dark:text-charcoal border-2 border-charcoal dark:border-neon-yellow shadow-neo dark:shadow-[4px_4px_0px_0px_#E2F546] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.createNew')}
        </Button>
      </div>

      {sites.length === 0 ? (
        <EmptyState
          message={t('dashboard.noSites')}
          action={
            <Button onClick={onCreateNew} variant="primary" className="rounded-xl border-2 border-charcoal dark:border-neon-blue text-charcoal dark:text-neon-blue px-8 py-3 shadow-neo dark:shadow-[4px_4px_0px_0px_#00FFFF] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
              {t('dashboard.createNew')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sites.map((site) => (
            <div key={site.id} className="group flex flex-col bg-white dark:bg-cyber-gray rounded-xl overflow-hidden border-2 md:border-4 border-charcoal dark:border-neon-pink shadow-neo-sm md:shadow-neo dark:shadow-[2px_2px_0px_0px_#FF00FF] md:dark:shadow-[4px_4px_0px_0px_#FF00FF] transition-all hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-neo md:hover:shadow-neo-lg dark:hover:shadow-[4px_4px_0px_0px_#FF00FF] md:dark:hover:shadow-[8px_8px_0px_0px_#FF00FF] hover:scale-[1.02] active:scale-[0.98] duration-200">
              {/* Preview Area - Clickable */}
              <div
                className="relative h-48 bg-slate-50 dark:bg-black/20 border-b-4 border-charcoal dark:border-neon-pink cursor-pointer group-hover:opacity-95 transition-opacity overflow-hidden"
                onClick={() => onViewSite(site)}
              >
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className={`px-3 py-1.5 rounded-md border-2 border-charcoal dark:border-cyber-black text-[10px] font-bold uppercase tracking-wider shadow-neo-sm ${site.published ? 'bg-pop-green dark:bg-neon-green text-charcoal' : 'bg-white dark:bg-cyber-gray text-charcoal dark:text-white'}`}>
                    {site.published ? t('common.live') : t('common.draft')}
                  </span>
                </div>

                {site.htmlContent ? (
                  <iframe
                    srcDoc={site.htmlContent}
                    className="w-[200%] h-[200%] transform scale-50 origin-top-left pointer-events-none select-none"
                    title={site.title}
                    tabIndex={-1}
                    loading="lazy"
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
                    <div className="flex items-center px-2 py-1 rounded-md bg-pop-pink/10 dark:bg-neon-pink/10 border border-charcoal/10 dark:border-neon-pink/30 text-xs font-bold text-charcoal/60 dark:text-neon-pink">
                      <Heart className="w-3 h-3 mr-1 text-pop-pink dark:text-neon-pink" />
                      <span>{site.likes || 0}</span>
                    </div>
                    <div className="flex items-center px-2 py-1 rounded-md bg-pop-blue/10 dark:bg-neon-blue/10 border border-charcoal/10 dark:border-neon-blue/30 text-xs font-bold text-charcoal/60 dark:text-neon-blue">
                      <Bookmark className="w-3 h-3 mr-1 text-pop-blue dark:text-neon-blue" />
                      <span>{site.favorites || 0}</span>
                    </div>
                    <div className="flex items-center px-2 py-1 rounded-md bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 text-xs font-bold text-charcoal/60 dark:text-white/60">
                      <Eye className="w-3 h-3 mr-1 text-charcoal/60 dark:text-white/60" />
                      <span>{site.views || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditSite(site); }}
                      className="p-2 rounded-lg border-2 border-charcoal dark:border-neon-yellow bg-pop-yellow dark:bg-neon-yellow text-charcoal shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                      title={t('common.edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewSite(site); }}
                      className="p-2 rounded-lg border-2 border-charcoal dark:border-neon-blue bg-pop-blue dark:bg-neon-blue text-charcoal shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                      title={t('common.view')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteSite(site.id); }}
                      className="p-2 rounded-lg border-2 border-charcoal dark:border-white bg-white dark:bg-cyber-black text-charcoal dark:text-white hover:bg-red-500 hover:text-white shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
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
