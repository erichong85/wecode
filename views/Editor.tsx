import React, { useState, useEffect, useRef } from 'react';
import { Save, ArrowLeft, Settings, Upload, Sparkles, Rocket, FileText, Utensils } from 'lucide-react';
import { HostedSite } from '../types';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { generateHtmlCode } from '../services/geminiService';

interface EditorProps {
  initialSite: HostedSite | null;
  onSave: (data: { id?: string, title: string, htmlContent: string, isPublic: boolean, allowSourceDownload: boolean }) => void;
  onCancel: () => void;
}

export const Editor: React.FC<EditorProps> = ({ initialSite, onSave, onCancel }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState(initialSite?.title || '');
  const [description, setDescription] = useState(initialSite?.description || '');
  const [htmlContent, setHtmlContent] = useState(initialSite?.htmlContent || '');
  const [isPublic, setIsPublic] = useState(initialSite?.isPublic ?? true);
  const [allowSourceDownload, setAllowSourceDownload] = useState(initialSite?.allowSourceDownload ?? true);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>(initialSite ? 'preview' : 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Default template if new site
  useEffect(() => {
    if (!initialSite && !htmlContent) {
      setHtmlContent(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 50px; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>Hello World</h1>
  <p>Welcome to my new site!</p>
</body>
</html>`);
    }
  }, [initialSite]);

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSave = async () => {
    if (!title) return alert(t('editor.siteTitle') + ' is required');
    setIsSaving(true);
    await onSave({
      id: initialSite?.id,
      title,
      description,
      htmlContent,
      published: true,
      isPublic,
      allowSourceDownload
    });
    setIsSaving(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          setHtmlContent(content);
          // Auto-extract title
          const titleMatch = content.match(/<title>(.*?)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            setTitle(titleMatch[1]);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const code = await generateHtmlCode(prompt);
      setHtmlContent(code);

      // Auto-extract title from generated code
      const titleMatch = code.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        setTitle(titleMatch[1]);
      }

      setActiveTab('preview');
    } catch (error) {
      console.error("Generation failed:", error);
      alert(t('editor.generationFailed') || "Generation failed. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const applyTemplate = (type: 'startup' | 'resume' | 'menu') => {
    let promptText = '';
    switch (type) {
      case 'startup':
        promptText = "创建一个科技初创公司的落地页。使用深色主题，包含首屏大图(Hero Section)、特性网格介绍(Feature Grid)和号召性用语(CTA)按钮。使用 Tailwind CSS 设计，风格要现代、大气。";
        break;
      case 'resume':
        promptText = "为一名软件工程师创建一个专业的个人简历/作品集网页。包含关于我、工作经历、技能专长和联系方式等板块。使用 Tailwind CSS，设计风格要简洁、极简主义。";
        break;
      case 'menu':
        promptText = "创建一个优雅的餐厅菜单页面。包含前菜、主菜和甜点板块。使用衬线字体(Serif)和温暖的色调。使用 Tailwind CSS 进行排版。";
        break;
    }
    setPrompt(promptText);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Toolbar */}
      <div className="h-16 border-b border-charcoal/5 flex items-center justify-between px-6 bg-cream-50 shrink-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-charcoal/60 hover:text-charcoal">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <div className="h-6 w-px bg-charcoal/10"></div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('editor.siteTitle')}
            className="bg-transparent border-none focus:ring-0 text-lg font-serif text-charcoal placeholder-charcoal/30 w-64"
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-charcoal/5 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'edit' ? 'bg-white shadow-sm text-charcoal' : 'text-charcoal/60 hover:text-charcoal'}`}
            >
              Code
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm text-charcoal' : 'text-charcoal/60 hover:text-charcoal'}`}
            >
              {t('editor.preview')}
            </button>
          </div>

          <div className="h-6 w-px bg-charcoal/10 mx-2"></div>

          {/* File Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".html,.htm"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border-charcoal/10 text-charcoal hover:bg-charcoal/5 flex items-center gap-2 px-3"
            title={t('editor.uploadHtml')}
          >
            <Upload className="w-4 h-4" />
            <span className="text-xs font-medium">{t('editor.uploadHtml')}</span>
          </Button>

          {/* AI Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={`text-charcoal/60 hover:text-charcoal ${isAiPanelOpen ? 'bg-charcoal/5 text-charcoal' : ''}`}
            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            title={t('editor.aiDesigner')}
          >
            <Sparkles className="w-4 h-4" />
          </Button>

          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <Button
              variant="ghost"
              size="sm"
              className={`text-charcoal/60 hover:text-charcoal ${isSettingsOpen ? 'bg-charcoal/5 text-charcoal' : ''}`}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <Settings className="w-4 h-4" />
            </Button>

            {isSettingsOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-charcoal/5 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-4 flex items-center">
                  <Settings className="w-3 h-3 mr-2" />
                  {t('editor.settings')}
                </h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-medium text-charcoal/80 group-hover:text-charcoal">{t('editor.public')}</span>
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-accent-green' : 'bg-slate-200'}`}>
                      <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="hidden" />
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${isPublic ? 'left-5' : 'left-1'}`}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-medium text-charcoal/80 group-hover:text-charcoal">{t('editor.allowDownload')}</span>
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${allowSourceDownload ? 'bg-accent-green' : 'bg-slate-200'}`}>
                      <input type="checkbox" checked={allowSourceDownload} onChange={(e) => setAllowSourceDownload(e.target.checked)} className="hidden" />
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${allowSourceDownload ? 'left-5' : 'left-1'}`}></div>
                    </div>
                  </label>

                  <div className="border-t border-charcoal/5 pt-4">
                    <label className="block">
                      <span className="text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-2 block">{t('editor.description')}</span>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('editor.descriptionPlaceholder')}
                        className="w-full px-3 py-2 text-sm border border-charcoal/10 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={3}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full ml-2"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? t('common.saving') : (initialSite ? t('editor.update') : t('editor.publish'))}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left: Editor/Preview Area */}
        <div className="flex-grow flex flex-col relative">
          {/* Tab Switcher - Floating or Top */}
          <div className="flex-grow relative">
            {activeTab === 'edit' ? (
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full h-full p-6 font-mono text-sm resize-none focus:ring-0 border-none bg-[#1e1e1e] text-[#d4d4d4]"
                spellCheck={false}
              />
            ) : (
              <iframe
                srcDoc={htmlContent}
                className="w-full h-full bg-white"
                title="Preview"
              />
            )}
          </div>
        </div>

        {/* Right: AI Web Designer Panel */}
        {isAiPanelOpen && (
          <div className="w-80 border-l border-charcoal/5 bg-white flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b border-charcoal/5 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold">{t('editor.aiDesigner')}</h3>
              </div>
              <p className="text-xs text-indigo-600/70 leading-relaxed">
                {t('editor.aiDescription')}
              </p>
            </div>

            <div className="p-6 flex-grow overflow-y-auto">
              <div className="mb-6">
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-3">
                  {t('editor.aiDesigner')}
                </label>
                <textarea
                  className="w-full h-32 p-3 rounded-xl border-charcoal/10 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder-charcoal/30 transition-all"
                  placeholder={t('editor.aiPlaceholder')}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className={`w-full mt-3 rounded-xl py-3 flex items-center justify-center transition-all ${isGenerating ? 'bg-indigo-400' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'} text-white shadow-lg shadow-indigo-200`}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('editor.generate')}
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-6 border-t border-charcoal/5">
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-4 flex items-center">
                  <Rocket className="w-3 h-3 mr-2" />
                  {t('editor.quickStart')}
                </label>

                <div className="space-y-3">
                  <button
                    onClick={() => applyTemplate('startup')}
                    className="w-full flex items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-charcoal/5 transition-all group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Rocket className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-charcoal/80 group-hover:text-charcoal">{t('editor.templates.startup')}</span>
                  </button>

                  <button
                    onClick={() => applyTemplate('resume')}
                    className="w-full flex items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-charcoal/5 transition-all group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-charcoal/80 group-hover:text-charcoal">{t('editor.templates.resume')}</span>
                  </button>

                  <button
                    onClick={() => applyTemplate('menu')}
                    className="w-full flex items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-charcoal/5 transition-all group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-charcoal/80 group-hover:text-charcoal">{t('editor.templates.menu')}</span>
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
