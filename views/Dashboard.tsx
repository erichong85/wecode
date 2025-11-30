import React from 'react';
import { Plus, Trash2, Eye, Edit2, Globe } from 'lucide-react';
import { HostedSite } from '../types';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';

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
      <div className="flex justify-end items-end mb-12 border-b border-charcoal/10 pb-6">
        <Button onClick={onCreateNew} variant="primary" className="rounded-full px-6">
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.createNew')}
        </Button>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-charcoal/10">
          <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-8 h-8 text-charcoal/40" />
          </div>
          <h3 className="text-xl font-serif text-charcoal mb-2">{t('dashboard.noSites')}</h3>
          <p className="text-charcoal-light mb-8">{t('dashboard.createFirst')}</p>
          <Button onClick={onCreateNew} variant="outline" className="rounded-full border-charcoal text-charcoal hover:bg-charcoal hover:text-white">
            {t('dashboard.createNew')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sites.map((site) => (
            <div key={site.id} className="group bg-white rounded-xl overflow-hidden border border-charcoal/10 transition-all hover:shadow-md hover:-translate-y-0.5">
              {/* Preview Area - Clickable */}
              <div
                className="aspect-[16/10] bg-slate-50 relative border-b border-charcoal/5 cursor-pointer group-hover:opacity-95 transition-opacity"
                onClick={() => onEditSite(site)}
              >
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
                    <Globe className="w-10 h-10" />
                  </div>
                )}
              </div>

              {/* Card Content - Compact */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-base text-charcoal line-clamp-1" title={site.title}>
                    {site.title}
                  </h3>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${site.published ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                    {site.published ? t('common.live') : t('common.draft')}
                  </span>
                </div>

                <div className="text-[10px] text-charcoal/40 mb-3">
                  {formatDate(site.createdAt)}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-charcoal/5">
                  <div className="flex items-center text-charcoal/50 text-xs">
                    <Eye className="w-3 h-3 mr-1" /> {site.views || 0}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditSite(site); }}
                      className="p-1.5 rounded-md text-charcoal/40 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title={t('common.edit')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewSite(site); }}
                      className="p-1.5 rounded-md text-charcoal/40 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title={t('common.view')}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteSite(site.id); }}
                      className="p-1.5 rounded-md text-charcoal/40 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
