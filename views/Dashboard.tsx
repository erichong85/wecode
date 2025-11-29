
import React from 'react';
import { Plus, Eye, Trash2, Globe, Edit3, Lock } from 'lucide-react';
import { HostedSite } from '../types';
import { Button } from '../components/Button';

interface DashboardProps {
  sites: HostedSite[];
  onCreateNew: () => void;
  onViewSite: (site: HostedSite) => void;
  onEditSite: (site: HostedSite) => void;
  onDeleteSite: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ sites, onCreateNew, onViewSite, onEditSite, onDeleteSite }) => {
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">我的托管网站</h1>
          <p className="text-slate-500 mt-1">管理你的网页项目并与世界分享。</p>
        </div>
        <Button variant="primary" size="lg" onClick={onCreateNew}>
          <Plus className="w-5 h-5 mr-2" />
          新建网站
        </Button>
      </div>

      {sites.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <Globe className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-900 mb-2">暂无网站</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            从上传 HTML 文件开始，或使用我们的 AI 助手瞬间生成精美网页。
          </p>
          <Button variant="primary" onClick={onCreateNew}>
            创建你的第一个网站
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div key={site.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
              {/* Preview Thumbnail (Simulated with iframe) */}
              <div
                className="h-48 bg-slate-100 relative overflow-hidden border-b border-slate-100 cursor-pointer"
                onClick={() => onViewSite(site)}
              >
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
                    <Globe className="w-16 h-16 opacity-50" />
                  </div>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm font-medium text-slate-700 text-sm">
                    点击预览
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 flex items-center" title={site.title}>
                    {site.title}
                    {!site.isPublic && <Lock className="w-3 h-3 ml-2 text-slate-400" />}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${site.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {site.published ? '已发布' : '草稿'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4">
                  创建于 {formatDate(site.createdAt)}
                  {site.updatedAt && <span> · 更新于 {formatDate(site.updatedAt)}</span>}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-slate-500">
                      <Eye className="w-3 h-3 mr-1" />
                      {site.views}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onEditSite(site)} title="编辑代码">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onViewSite(site)} title="预览">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDeleteSite(site.id)} title="删除">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
