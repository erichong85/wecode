
import React, { useState, useRef, useEffect } from 'react';
import { Save, Upload, Code as CodeIcon, Sparkles, Play, ArrowLeft, Settings, Download, Globe, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { generateHtmlCode } from '../services/geminiService';
import { HostedSite } from '../types';

interface EditorProps {
  initialSite?: HostedSite | null;
  onSave: (data: { id?: string, title: string, htmlContent: string, isPublic: boolean, allowSourceDownload: boolean }) => void;
  onCancel: () => void;
}

export const Editor: React.FC<EditorProps> = ({ initialSite, onSave, onCancel }) => {
  const [html, setHtml] = useState<string>(
    `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的网站</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 class="text-4xl font-bold text-indigo-600 mb-4">你好，世界</h1>
        <p class="text-gray-600">欢迎来到我的个人主页。</p>
    </div>
</body>
</html>`
  );
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [allowSourceDownload, setAllowSourceDownload] = useState(true);

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [mode, setMode] = useState<'CODE' | 'PREVIEW'>('CODE');
  const [showSettings, setShowSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with existing site data if in edit mode
  useEffect(() => {
    if (initialSite) {
      setTitle(initialSite.title);
      setHtml(initialSite.htmlContent);
      setIsPublic(initialSite.isPublic !== undefined ? initialSite.isPublic : true);
      setAllowSourceDownload(initialSite.allowSourceDownload !== undefined ? initialSite.allowSourceDownload : true);
    }
  }, [initialSite]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setHtml(event.target.result);
        if (!title && !initialSite) setTitle(file.name.replace('.html', ''));
      }
    };
    reader.readAsText(file);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const generatedCode = await generateHtmlCode(aiPrompt);
      setHtml(generatedCode);
      if (!title && !initialSite) setTitle("AI 生成的网站");
    } catch (err) {
      alert("生成代码失败。请检查您的 API Key 并重试。");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSave = () => {
    // Extract title from HTML content
    let extractedTitle = '';
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      extractedTitle = titleMatch[1].trim();
    }

    onSave({
      id: initialSite?.id, // Pass ID if updating
      title: extractedTitle || title || '未命名网站',
      htmlContent: html,
      isPublic,
      allowSourceDownload
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 relative">

      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-20 relative">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="h-6 w-px bg-slate-300"></div>
          <input
            type="text"
            placeholder="网站标题 (例如：我的作品集)"
            className="border-none focus:ring-0 text-lg font-semibold placeholder-slate-400 w-64"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-100 rounded-lg p-1 mr-4">
            <button
              onClick={() => setMode('CODE')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'CODE' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CodeIcon className="w-4 h-4 inline mr-1" /> 代码
            </button>
            <button
              onClick={() => setMode('PREVIEW')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'PREVIEW' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Play className="w-4 h-4 inline mr-1" /> 预览
            </button>
          </div>

          <input
            type="file"
            accept=".html"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            上传文件
          </Button>

          {/* Settings Toggle */}
          <div className="relative">
            <Button
              variant={showSettings ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              title="发布设置"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* Settings Dropdown */}
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50">
                <h3 className="font-bold text-slate-900 mb-3">发布设置</h3>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isPublic"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="isPublic" className="font-medium text-slate-700 flex items-center">
                        {isPublic ? <Globe className="w-3 h-3 mr-1 text-green-500" /> : <Lock className="w-3 h-3 mr-1 text-slate-400" />}
                        公开展示
                      </label>
                      <p className="text-slate-500 text-xs mt-1">
                        {isPublic
                          ? "您的网站将显示在社区精选列表中，所有人可见。"
                          : "仅拥有链接的人可以访问您的网站（私有）。"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="allowDownload"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                        checked={allowSourceDownload}
                        onChange={(e) => setAllowSourceDownload(e.target.checked)}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="allowDownload" className="font-medium text-slate-700 flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        允许下载源代码
                      </label>
                      <p className="text-slate-500 text-xs mt-1">
                        允许访问者直接下载您的 HTML 源代码文件。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button variant="primary" size="sm" onClick={handleSave} disabled={!html.trim()}>
            <Save className="w-4 h-4 mr-2" />
            {initialSite ? '更新网站' : '发布网站'}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* Editor / Preview Area */}
        <div className={`flex-1 relative ${mode === 'CODE' ? 'p-0' : 'p-4 bg-slate-200'}`}>
          {mode === 'CODE' ? (
            <textarea
              className="w-full h-full resize-none p-6 font-mono text-sm bg-slate-900 text-slate-100 outline-none custom-scrollbar leading-relaxed"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              spellCheck={false}
            />
          ) : (
            <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
              <iframe
                srcDoc={html}
                title="preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            </div>
          )}
        </div>

        {/* AI Sidebar (Only in Code Mode) */}
        {mode === 'CODE' && (
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-lg z-10">
            <div className="p-4 border-b border-slate-100 bg-indigo-50">
              <div className="flex items-center text-indigo-800 font-semibold mb-1">
                <Sparkles className="w-5 h-5 mr-2" />
                AI 网页设计师
              </div>
              <p className="text-xs text-indigo-600">描述你的需求，Gemini 为你构建。</p>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <label className="block text-sm font-medium text-slate-700 mb-2">提示词</label>
              <textarea
                className="w-full border border-slate-300 rounded-md p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 h-32 resize-none mb-3"
                placeholder="例如：一个摄影师的个人主页，深色主题，包含画廊..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleAiGenerate}
                isLoading={isAiGenerating}
                disabled={!aiPrompt.trim()}
              >
                生成代码
              </Button>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">快速开始</p>
                <div className="space-y-2">
                  <button
                    className="w-full text-left text-sm p-2 hover:bg-slate-50 rounded text-slate-600 transition-colors"
                    onClick={() => setAiPrompt("一个现代化的创业公司落地页，包含首屏大图、特性网格介绍和价格表。")}
                  >
                    🚀 创业公司落地页
                  </button>
                  <button
                    className="w-full text-left text-sm p-2 hover:bg-slate-50 rounded text-slate-600 transition-colors"
                    onClick={() => setAiPrompt("一个极简风格的个人电子简历，包含联系方式、技能列表和工作经历。")}
                  >
                    📄 电子简历
                  </button>
                  <button
                    className="w-full text-left text-sm p-2 hover:bg-slate-50 rounded text-slate-600 transition-colors"
                    onClick={() => setAiPrompt("一个餐厅菜单页面，包含诱人的美食图片和价格列表。")}
                  >
                    🍔 餐厅菜单
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
