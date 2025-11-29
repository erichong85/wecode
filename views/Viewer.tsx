
import React, { useState } from 'react';
import { Share2, ArrowLeft, Copy, Check, Download, X, Globe } from 'lucide-react';
import { HostedSite } from '../types';
import { Button } from '../components/Button';

interface ViewerProps {
  site: HostedSite;
  onBack: () => void;
}

export const Viewer: React.FC<ViewerProps> = ({ site, onBack }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Simulate a real URL for display purposes
  // In a real app, window.location.origin would be your domain (e.g., https://hostgenie.com)
  const shareUrl = `${window.location.origin}/#site/${site.id}`;

  // Use a reliable QR code API for generation
  // Increased size for better scanning
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSource = () => {
    const blob = new Blob([site.htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.title || 'website'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadQrCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${site.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download QR", e);
      // Fallback: just open image in new tab
      window.open(qrCodeUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Viewer Header */}
      <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-300 hover:text-white hover:bg-slate-700 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-sm sm:text-base">{site.title}</h2>
            <div className="flex items-center text-xs text-slate-400">
              <span className="truncate max-w-[150px] sm:max-w-md mr-2">{shareUrl}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {site.allowSourceDownload && (
            <Button variant="outline" size="sm" onClick={handleDownloadSource} className="text-slate-300 border-slate-600 hover:bg-slate-700 hidden sm:inline-flex">
              <Download className="w-4 h-4 mr-2" />
              源码
            </Button>
          )}

          <Button variant="primary" size="sm" onClick={() => setShowShareModal(true)}>
            <Share2 className="w-4 h-4 mr-2" />
            分享 / 二维码
          </Button>
        </div>
      </div>

      {/* Actual Site Content */}
      <div className="flex-1 w-full bg-white relative">
        <iframe
          srcDoc={site.htmlContent}
          title={site.title}
          className="w-full h-full border-0 absolute inset-0"
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
        />
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">

            <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" onClick={() => setShowShareModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-middle bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-md w-full relative">
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white px-6 pt-6 pb-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                    <Share2 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">分享你的网站</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    任何人都可以通过链接或扫描下方二维码访问此网站。
                  </p>

                  {/* QR Code */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 inline-block mb-6 relative group">
                    <img
                      src={qrCodeUrl}
                      alt="Website QR Code"
                      className="w-48 h-48 mix-blend-multiply mx-auto"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-xl cursor-pointer" onClick={downloadQrCode}>
                      <span className="bg-white shadow-sm px-3 py-1 rounded-full text-xs font-medium text-slate-700 flex items-center">
                        <Download className="w-3 h-3 mr-1" /> 保存图片
                      </span>
                    </div>
                  </div>

                  {/* Link Copy */}
                  <div className="bg-slate-100 rounded-lg p-3 flex items-center justify-between mb-4">
                    <div className="flex items-center overflow-hidden mr-3">
                      <Globe className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-slate-600 truncate text-left">{shareUrl}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopy} className="shadow-sm border border-slate-200 shrink-0">
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* Localhost Warning */}
                  {window.location.hostname === 'localhost' && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 text-left">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-xs font-medium text-yellow-800">本地测试提示</h3>
                          <div className="mt-1 text-xs text-yellow-700">
                            <p>您当前在本地环境 (localhost)。手机直接扫码可能无法访问。请将 localhost 替换为电脑 IP，或将项目部署到服务器。</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
              <div className="bg-slate-50 px-4 py-3 sm:px-6 flex justify-center">
                <Button variant="outline" onClick={() => setShowShareModal(false)} className="w-full sm:w-auto">
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
