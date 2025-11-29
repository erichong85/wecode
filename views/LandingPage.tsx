
import React from 'react';
import { Upload, Code, Zap, Globe, Shield, Eye, User as UserIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { HostedSite } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
  publicSites: HostedSite[];
  onViewSite: (site: HostedSite) => void;
  isLoggedIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, publicSites, onViewSite, isLoggedIn }) => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-20 space-y-24">
        <div className="relative">
          <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24">
            <div className="px-4 max-w-xl mx-auto sm:px-6 lg:py-16 lg:max-w-none lg:mx-0 lg:px-0">
              <div>
                <div>
                  <span className="h-12 w-12 rounded-md flex items-center justify-center bg-indigo-600">
                    <Globe className="h-6 w-6 text-white" />
                  </span>
                </div>
                <div className="mt-6">
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    即时、智能的网页托管服务。
                  </h2>
                  <p className="mt-4 text-lg text-slate-500">
                    上传 HTML 文件或让 AI 为你构建网站。即刻获得访问链接和二维码。无需配置服务器。
                  </p>
                  <div className="mt-6">
                    <Button size="lg" onClick={onGetStarted}>
                      {isLoggedIn ? '进入控制台' : '免费开始'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 sm:mt-16 lg:mt-0">
              <div className="pl-4 -mr-48 sm:pl-6 md:-mr-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
                <img
                  className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
                  src="/hero-preview.png"
                  alt="App interface preview"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">功能特性</h2>
            <p className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl sm:tracking-tight">
              上线所需的一切。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">轻松上传</h3>
              <p className="text-slate-500">拖拽 HTML 文件或直接粘贴源代码到编辑器中。</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">AI 生成</h3>
              <p className="text-slate-500">没有灵感？让 Gemini “创建一个作品集网页”，见证代码奇迹般生成。</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">即时二维码</h3>
              <p className="text-slate-500">每个网站都有唯一的链接和二维码。微信扫一扫即可访问。</p>
            </div>
          </div>
        </div>

        {/* Community Sites Section */}
        {publicSites && publicSites.length > 0 && (
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white py-12">
            <div className="text-center mb-12">
              <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">社区精选</h2>
              <p className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl sm:tracking-tight">
                探索用户创造的精彩网站
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publicSites.slice(0, 6).map((site) => (
                <div key={site.id} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col group h-full">
                  {/* Preview Thumbnail */}
                  <div
                    className="h-56 bg-slate-100 relative overflow-hidden border-b border-slate-100 cursor-pointer"
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
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg font-bold text-indigo-600">
                        点击预览
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1" title={site.title}>
                        {site.title}
                      </h3>
                      <div className="flex items-center text-sm text-slate-500 mb-4">
                        <UserIcon className="w-4 h-4 mr-1 text-slate-400" />
                        <span className="truncate">{site.authorName || '匿名用户'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                      <div className="flex items-center text-xs text-slate-400">
                        <Eye className="w-3 h-3 mr-1" />
                        {site.views.toLocaleString()} 次浏览
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => onViewSite(site)} className="text-indigo-600 hover:text-indigo-800 p-0 hover:bg-transparent">
                        查看详情 →
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" onClick={onGetStarted}>
                {isLoggedIn ? '创建新网站' : '创建你自己的网站'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-slate-400">
              &copy; 2024 HostGenie. 版权所有。基于 Gemini & React 构建。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
