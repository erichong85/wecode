import React, { useState, useEffect, useRef } from 'react';
import { Save, ArrowLeft, Settings, Upload, Sparkles, Rocket, FileText, Utensils, Paintbrush, Undo, Redo } from 'lucide-react';
import { HostedSite } from '../types';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { generateHtmlCode } from '../services/geminiService';
import { VisualEditor } from '../components/VisualEditor';
import { PopLoader } from '../components/PopLoader';
import { OnboardingTour } from '../components/OnboardingTour';

interface EditorProps {
  initialSite: HostedSite | null;
  initialPrompt?: string;
  onSave: (site: {
    id?: string;
    title: string;
    description?: string;
    htmlContent: string;
    published: boolean;
    isPublic: boolean;
    allowSourceDownload: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

// Draft storage key
const DRAFT_KEY = 'hg_editor_draft';

const PRESET_FONTS = [
  { name: '默认', value: 'inherit', category: '基础' },
  { name: 'Arial', value: 'Arial, sans-serif', category: '无衬线字体' },
  { name: '微软雅黑', value: "'Microsoft YaHei', sans-serif", category: '无衬线字体' },
  { name: '黑体', value: "'SimHei', sans-serif", category: '无衬线字体' },
  { name: 'Times New Roman', value: "'Times New Roman', serif", category: '衬线字体' },
  { name: '宋体', value: "'SimSun', serif", category: '衬线字体' },
  { name: '楷体', value: "'KaiTi', serif", category: '衬线字体' },
  { name: 'Georgia', value: 'Georgia, serif', category: '衬线字体' },
  { name: 'Courier New', value: "'Courier New', monospace", category: '等宽字体' },
  // Free Commercial Fonts
  { name: '思源黑体 (Noto Sans SC)', value: "'Noto Sans SC', sans-serif", category: '免费商用字体' },
  { name: '思源宋体 (Noto Serif SC)', value: "'Noto Serif SC', serif", category: '免费商用字体' },
  { name: '站酷庆科黄油体', value: "'ZCOOL QingKe HuangYou', cursive", category: '免费商用字体' },
  { name: '站酷小薇LOGO体', value: "'ZCOOL XiaoWei', serif", category: '免费商用字体' },
  { name: '站酷快乐体', value: "'ZCOOL KuaiLe', cursive", category: '免费商用字体' },
  { name: '马善政毛笔书法', value: "'Ma Shan Zheng', cursive", category: '免费商用字体' },
];

const GOOGLE_FONTS_MAP: Record<string, string> = {
  "'Noto Sans SC', sans-serif": "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap",
  "'Noto Serif SC', serif": "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap",
  "'ZCOOL QingKe HuangYou', cursive": "https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&display=swap",
  "'ZCOOL XiaoWei', serif": "https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap",
  "'ZCOOL KuaiLe', cursive": "https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap",
  "'Ma Shan Zheng', cursive": "https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap",
};

// Draft data structure (excluding htmlContent to avoid quota issues)
interface EditorDraft {
  title: string;
  description: string;
  prompt: string;
  savedAt: number;
  customFonts: string[];
}

// Helper functions for draft management
const saveDraft = (draft: EditorDraft) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
};

const loadDraft = (): EditorDraft | null => {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load draft:', error);
  }
  return null;
};

const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}


const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'kimi-k2-thinking-cc', name: 'kimi k2 thinking' },
  { id: 'deepseek-v3.2-cc', name: 'DeepSeek-V3.2' },
  { id: 'glm-4.6-cc', name: 'GLM 4.6' },
];

export const Editor: React.FC<EditorProps> = ({ initialSite, initialPrompt, onSave, onCancel }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState(initialSite?.title || '');
  const [description, setDescription] = useState(initialSite?.description || '');
  const [htmlContent, setHtmlContent] = useState(initialSite?.htmlContent || '');
  // Separate preview content to prevent iframe reload on every keystroke
  const [previewContent, setPreviewContent] = useState(initialSite?.htmlContent || '');
  const [isPublic, setIsPublic] = useState(initialSite?.isPublic ?? true);
  const [allowSourceDownload, setAllowSourceDownload] = useState(initialSite?.allowSourceDownload ?? true);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>(initialSite ? 'preview' : 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hg_has_seen_tour');
    if (!hasSeenTour) {
      setShowTour(true);
    }
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('hg_has_seen_tour', 'true');
  };
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [isVisualMode, setIsVisualMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  // Undo/Redo states
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const MAX_HISTORY = 50;

  // Custom fonts state
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load draft on mount (only for new sites)
  useEffect(() => {
    if (!initialSite) {
      const draft = loadDraft();
      if (draft) {
        setTitle(draft.title);
        setDescription(draft.description);
        setPrompt(draft.prompt);
        setHasDraft(true);
        setDraftSavedAt(draft.savedAt);
        if (draft.customFonts) {
          setCustomFonts(draft.customFonts);
        }
        // Set default template for new sites
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
      } else {
        // Default template if new site and no draft
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
    }
  }, [initialSite]);

  // Sync preview content with html content when not in visual mode or when switching tabs
  useEffect(() => {
    if (!isVisualMode || activeTab === 'edit') {
      setPreviewContent(htmlContent);
    }
  }, [htmlContent, isVisualMode, activeTab]);

  // Auto-save draft with debounce (only for new sites)
  useEffect(() => {
    // Don't save draft if editing existing site
    if (initialSite) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Only save if there's meaningful content
    if (title || htmlContent || prompt) {
      saveTimeoutRef.current = setTimeout(() => {
        const draft: EditorDraft = {
          title,
          description,
          // htmlContent excluded to avoid localStorage quota issues
          prompt,
          savedAt: Date.now(),
          customFonts
        };
        saveDraft(draft);
        setHasDraft(true);
        setDraftSavedAt(Date.now());
      }, 1000); // Debounce for 1 second
    }

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, description, htmlContent, prompt, initialSite, customFonts]);

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
    try {
      await onSave({
        id: initialSite?.id,
        title,
        description,
        htmlContent,
        published: true,
        isPublic,
        allowSourceDownload
      });
      // Clear draft after successful save
      if (!initialSite) {
        clearDraft();
        setHasDraft(false);
        setDraftSavedAt(null);
      }
    } finally {
      setIsSaving(false);
    }
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
      const code = await generateHtmlCode(prompt, selectedModel);
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

  // Undo/Redo: Add to history
  const addToHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo: Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setHtmlContent(history[newIndex]);
      setPreviewContent(history[newIndex]);
    }
  };

  // Undo/Redo: Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setHtmlContent(history[newIndex]);
      setPreviewContent(history[newIndex]);
    }
  };

  // Initialize history with current content
  useEffect(() => {
    if (htmlContent && history.length === 0) {
      setHistory([htmlContent]);
      setHistoryIndex(0);
    }
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && isVisualMode) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, isVisualMode]);

  // Visual Editor: postMessage listener for element selection and image events
  useEffect(() => {
    if (!isVisualMode) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ELEMENT_SELECTED') {
        setSelectedElement(event.data.data);
      } else if (event.data.type === 'IMAGE_PASTED') {
        // Handle pasted image
        handleImagePaste(event.data.data.imageUrl, event.data.data.x, event.data.data.y);
      } else if (event.data.type === 'IMAGE_MOVED') {
        // Handle image position change
        handleImageMove(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isVisualMode, htmlContent]);

  // Visual Editor: Generate element selector
  const getElementSelector = (element: Element): string => {
    if (element.id) return `#${element.id}`;

    const path: string[] = [];
    let current: Element | null = element;

    while (current && current.tagName !== 'BODY') {
      let selector = current.tagName.toLowerCase();

      // Use nth-of-type for reliable positioning
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          el => el.tagName === current!.tagName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  };

  // Visual Editor: Handle text change
  const handleTextChange = (newText: string) => {
    if (!selectedElement) return;

    try {
      // 1. Update iframe DOM directly
      const iframeDoc = iframeRef.current?.contentDocument;
      if (iframeDoc) {
        const element = iframeDoc.querySelector(selectedElement.selector);
        if (element) {
          if (element.children.length === 0) {
            element.textContent = newText;
          } else {
            const textNode = Array.from(element.childNodes).find(
              (node): node is Text => (node as Node).nodeType === Node.TEXT_NODE
            );
            if (textNode) {
              textNode.textContent = newText;
            }
          }
        }
      }

      // 2. Update source of truth
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const element = doc.querySelector(selectedElement.selector);

      if (element) {
        // Update text content while preserving child elements
        if (element.children.length === 0) {
          element.textContent = newText;
        } else {
          // If has children, update first text node
          const textNode = Array.from(element.childNodes).find(
            (node): node is Text => (node as Node).nodeType === Node.TEXT_NODE
          );
          if (textNode) {
            textNode.textContent = newText;
          }
        }

        const newContent = doc.documentElement.outerHTML;
        addToHistory(newContent);
        setHtmlContent(newContent);
      }
    } catch (error) {
      console.error('Failed to update text:', error);
    }
  };

  // Visual Editor: Handle style change
  const handleStyleChange = (styles: Record<string, string>) => {
    if (!selectedElement) return;

    try {
      // Check for Google Fonts injection
      if (styles.fontFamily && GOOGLE_FONTS_MAP[styles.fontFamily]) {
        const fontUrl = GOOGLE_FONTS_MAP[styles.fontFamily];

        // 1. Inject into iframe directly
        const iframeDoc = iframeRef.current?.contentDocument;
        if (iframeDoc && !iframeDoc.querySelector(`link[href="${fontUrl}"]`)) {
          const link = iframeDoc.createElement('link');
          link.rel = 'stylesheet';
          link.href = fontUrl;
          iframeDoc.head.appendChild(link);
        }

        // 2. Inject into source htmlContent
        if (!htmlContent.includes(fontUrl)) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          if (!doc.querySelector(`link[href="${fontUrl}"]`)) {
            const link = doc.createElement('link');
            link.rel = 'stylesheet';
            link.href = fontUrl;
            doc.head.appendChild(link);
            // Update htmlContent immediately so the subsequent style update uses the new content
            setHtmlContent(doc.documentElement.outerHTML);
            // Note: We don't return here, we continue to apply the style
          }
        }
      }

      // 1. Update iframe DOM directly
      const iframeDoc = iframeRef.current?.contentDocument;
      if (iframeDoc) {
        const element = iframeDoc.querySelector(selectedElement.selector) as HTMLElement;
        if (element) {
          Object.entries(styles).forEach(([key, value]) => {
            element.style[key as any] = value;
          });
        }
      }

      // 2. Update source of truth
      const parser = new DOMParser();
      // Use current htmlContent (which might have just been updated with the font link)
      // Actually, since setHtmlContent is async, we should re-parse the *latest* content if we updated it.
      // But we can't easily access the pending state.
      // However, for the style update, we can just parse `htmlContent` again. 
      // If we injected the link, `htmlContent` in this render cycle is still old.
      // So we should inject the link into the `doc` we are about to modify for style update.

      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Re-inject link if needed (since we are parsing from potentially old htmlContent)
      if (styles.fontFamily && GOOGLE_FONTS_MAP[styles.fontFamily]) {
        const fontUrl = GOOGLE_FONTS_MAP[styles.fontFamily];
        if (!doc.querySelector(`link[href="${fontUrl}"]`)) {
          const link = doc.createElement('link');
          link.rel = 'stylesheet';
          link.href = fontUrl;
          doc.head.appendChild(link);
        }
      }

      const element = doc.querySelector(selectedElement.selector) as HTMLElement;

      if (element) {
        Object.entries(styles).forEach(([key, value]) => {
          element.style[key as any] = value;
        });

        const newContent = doc.documentElement.outerHTML;
        addToHistory(newContent);
        setHtmlContent(newContent);
      }
    } catch (error) {
      console.error('Failed to update style:', error);
    }
  };

  // Visual Editor: Handle image upload
  const handleImageUpload = (file: File) => {
    if (!selectedElement) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;

      try {
        // 1. Update iframe DOM directly
        const iframeDoc = iframeRef.current?.contentDocument;
        if (iframeDoc) {
          const element = iframeDoc.querySelector(selectedElement.selector) as HTMLElement;
          if (element) {
            if (element.tagName === 'IMG') {
              element.setAttribute('src', base64);
            } else {
              element.style.backgroundImage = `url(${base64})`;
              element.style.backgroundSize = 'cover';
              element.style.backgroundPosition = 'center';
            }
          }
        }

        // 2. Update source of truth
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const element = doc.querySelector(selectedElement.selector) as HTMLElement;

        if (element) {
          if (element.tagName === 'IMG') {
            element.setAttribute('src', base64);
          } else {
            element.style.backgroundImage = `url(${base64})`;
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
          }

          const newContent = doc.documentElement.outerHTML;
          addToHistory(newContent);
          setHtmlContent(newContent);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    };

    reader.readAsDataURL(file);
  };

  // Visual Editor: Handle image paste
  const handleImagePaste = (imageUrl: string, x: number, y: number) => {
    try {
      // 1. Update iframe DOM directly
      const iframeDoc = iframeRef.current?.contentDocument;
      if (iframeDoc) {
        const img = iframeDoc.createElement('img');
        img.src = imageUrl;
        img.style.position = 'absolute';
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
        img.style.maxWidth = '300px';
        img.style.cursor = 'move';
        img.style.zIndex = '1000';
        img.className = 'draggable-image';
        img.setAttribute('data-draggable', 'true');
        iframeDoc.body.appendChild(img);
      }

      // 2. Update source of truth
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Create draggable image element
      const img = doc.createElement('img');
      img.src = imageUrl;
      img.style.position = 'absolute';
      img.style.left = `${x}px`;
      img.style.top = `${y}px`;
      img.style.maxWidth = '300px';
      img.style.cursor = 'move';
      img.style.zIndex = '1000';
      img.className = 'draggable-image';
      img.setAttribute('data-draggable', 'true');

      doc.body.appendChild(img);

      const newContent = doc.documentElement.outerHTML;
      addToHistory(newContent);
      setHtmlContent(newContent);
    } catch (error) {
      console.error('Failed to paste image:', error);
    }
  };

  // Visual Editor: Handle image move
  const handleImageMove = (data: { selector: string; left: string; top: string }) => {
    try {
      // 1. Update iframe DOM directly for instant feedback
      const iframeDoc = iframeRef.current?.contentDocument;
      if (iframeDoc) {
        const element = iframeDoc.querySelector(data.selector) as HTMLElement;
        if (element) {
          element.style.left = data.left;
          element.style.top = data.top;
        }
      }

      // 2. Update source of truth
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const element = doc.querySelector(data.selector) as HTMLElement;

      if (element) {
        element.style.left = data.left;
        element.style.top = data.top;

        const newContent = doc.documentElement.outerHTML;
        addToHistory(newContent);
        setHtmlContent(newContent);
      }
    } catch (error) {
      console.error('Failed to move image:', error);
    }
  };

  // Visual Editor: Handle custom font addition
  const handleAddFont = (name: string, fontData: string) => {
    try {
      // 1. Update iframe DOM directly
      const iframeDoc = iframeRef.current?.contentDocument;
      if (iframeDoc) {
        const style = iframeDoc.createElement('style');
        style.textContent = `
          @font-face {
            font-family: '${name}';
            src: url('${fontData}');
          }
        `;
        iframeDoc.head.appendChild(style);
      }

      // 2. Update source of truth
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Create style element for font face
      const style = doc.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${name}';
          src: url('${fontData}');
        }
      `;

      // Append to head
      doc.head.appendChild(style);

      const newContent = doc.documentElement.outerHTML;
      addToHistory(newContent);
      setHtmlContent(newContent);

      // Update custom fonts list
      setCustomFonts(prev => [...prev, name]);
    } catch (error) {
      console.error('Failed to add custom font:', error);
    }
  };

  // Visual Editor: Inject interaction script into preview
  const getEnhancedHtml = (content: string = htmlContent) => {
    if (!isVisualMode || activeTab !== 'preview') {
      return content;
    }

    const interactionScript = `
      <script>
        (function() {
          let selectedElement = null;
          
          document.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (selectedElement) {
              selectedElement.style.outline = '';
            }
            
            selectedElement = e.target;
            selectedElement.style.outline = '2px solid #4f46e5';
            selectedElement.style.outlineOffset = '2px';
            
            const computedStyles = window.getComputedStyle(selectedElement);
            
            window.parent.postMessage({
              type: 'ELEMENT_SELECTED',
              data: {
                selector: getElementSelector(selectedElement),
                tagName: selectedElement.tagName,
                textContent: selectedElement.textContent?.trim() || '',
                innerHTML: selectedElement.innerHTML,
                styles: {
                  color: computedStyles.color,
                  backgroundColor: computedStyles.backgroundColor,
                  fontSize: computedStyles.fontSize,
                  fontWeight: computedStyles.fontWeight,
                  backgroundImage: computedStyles.backgroundImage
                }
              }
            }, '*');
          }, true);
          
          function getElementSelector(element) {
            if (element.id) return '#' + element.id;
            
            const path = [];
            let current = element;
            
            while (current && current.tagName !== 'BODY') {
              let selector = current.tagName.toLowerCase();
              
              // Use nth-of-type for reliable positioning
              const parent = current.parentElement;
              if (parent) {
                const siblings = Array.from(parent.children).filter(
                  el => el.tagName === current.tagName
                );
                if (siblings.length > 1) {
                  const index = siblings.indexOf(current) + 1;
                  selector += ':nth-of-type(' + index + ')';
                }
              }
              
              path.unshift(selector);
              current = current.parentElement;
            }
            
            return path.join(' > ');
          }

          // Image paste listener
          document.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
              if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                  const imageUrl = event.target.result;
                  window.parent.postMessage({
                    type: 'IMAGE_PASTED',
                    data: { 
                      imageUrl: imageUrl, 
                      x: e.clientX || 100, 
                      y: e.clientY || 100 
                    }
                  }, '*');
                };
                reader.readAsDataURL(blob);
                break;
              }
            }
          });

          // Drag and drop for images
          let draggedElement = null;
          let offsetX = 0, offsetY = 0;

          document.addEventListener('mousedown', (e) => {
            if (e.target.hasAttribute && e.target.hasAttribute('data-draggable')) {
              draggedElement = e.target;
              offsetX = e.clientX - parseInt(draggedElement.style.left || 0);
              offsetY = e.clientY - parseInt(draggedElement.style.top || 0);
              draggedElement.style.cursor = 'grabbing';
            }
          });

          document.addEventListener('mousemove', (e) => {
            if (draggedElement) {
              e.preventDefault();
              draggedElement.style.left = (e.clientX - offsetX) + 'px';
              draggedElement.style.top = (e.clientY - offsetY) + 'px';
            }
          });

          document.addEventListener('mouseup', () => {
            if (draggedElement) {
              draggedElement.style.cursor = 'move';
              
              // Notify parent window about position change
              const elementId = draggedElement.getAttribute('data-draggable-id');
              window.parent.postMessage({
                type: 'IMAGE_MOVED',
                data: {
                  id: elementId,
                  left: draggedElement.style.left,
                  top: draggedElement.style.top
                }
              }, '*');
              
              draggedElement = null;
            }
          });
        })();
      </script>
    `;

    return content.replace('</body>', interactionScript + '</body>');
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-cyber-black transition-colors duration-300">
      {/* Toolbar */}
      <div className="h-16 border-b-4 border-charcoal dark:border-neon-blue flex items-center justify-between px-6 bg-white dark:bg-cyber-black shrink-0 transition-colors duration-300">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-charcoal dark:text-white hover:bg-charcoal/5 dark:hover:bg-white/10 border-2 border-transparent hover:border-charcoal dark:hover:border-neon-pink font-bold transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <div className="h-8 w-0.5 bg-charcoal/20 dark:bg-white/20"></div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('editor.siteTitle')}
            className="bg-transparent border-2 border-transparent hover:border-charcoal/20 dark:hover:border-white/20 focus:border-charcoal dark:focus:border-neon-yellow focus:ring-0 rounded-lg px-2 py-1 text-lg font-bold text-charcoal dark:text-white placeholder-charcoal/30 dark:placeholder-white/30 w-64 transition-all"
          />
          {hasDraft && !initialSite && (
            <div className="flex items-center space-x-2 text-xs font-bold text-charcoal dark:text-charcoal bg-pop-yellow dark:bg-neon-yellow px-3 py-1.5 rounded-md border-2 border-charcoal dark:border-neon-yellow shadow-neo-sm">
              <span>草稿</span>
              {draftSavedAt && (
                <span className="opacity-70">
                  {new Date(draftSavedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-charcoal/5 dark:bg-white/10 rounded-lg p-1 border-2 border-charcoal/10 dark:border-white/10">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all border-2 ${activeTab === 'edit' ? 'bg-pop-yellow dark:bg-neon-yellow border-charcoal dark:border-neon-yellow text-charcoal shadow-neo-sm' : 'border-transparent text-charcoal/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white'}`}
            >
              Code
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all border-2 ${activeTab === 'preview' ? 'bg-pop-blue dark:bg-neon-blue border-charcoal dark:border-neon-blue text-charcoal shadow-neo-sm' : 'border-transparent text-charcoal/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white'}`}
            >
              {t('editor.preview')}
            </button>
          </div>

          <div className="h-8 w-0.5 bg-charcoal/10 dark:bg-white/10 mx-2"></div>

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
            className="bg-white dark:bg-cyber-gray border-2 border-charcoal dark:border-white text-charcoal dark:text-white hover:bg-charcoal/5 dark:hover:bg-white/10 flex items-center gap-2 px-3 shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            title={t('editor.uploadHtml')}
          >
            <Upload className="w-4 h-4" />
            <span className="text-xs font-bold">{t('editor.uploadHtml')}</span>
          </Button>

          {/* AI Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={`border-2 transition-all ${isAiPanelOpen ? 'bg-pop-purple dark:bg-neon-purple border-charcoal dark:border-neon-purple text-charcoal dark:text-white shadow-neo-sm' : 'border-transparent text-charcoal/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white hover:border-charcoal dark:hover:border-white'}`}
            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            title={t('editor.aiDesigner')}
          >
            <Sparkles className="w-4 h-4" />
          </Button>

          {/* Visual Editor Toggle */}
          {activeTab === 'preview' && (
            <Button
              variant="ghost"
              size="sm"
              className={`border-2 transition-all ${isVisualMode ? 'bg-pop-pink dark:bg-neon-pink border-charcoal dark:border-neon-pink text-charcoal dark:text-white shadow-neo-sm' : 'border-transparent text-charcoal/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white hover:border-charcoal dark:hover:border-white'}`}
              onClick={() => {
                setIsVisualMode(!isVisualMode);
                if (!isVisualMode) {
                  setIsAiPanelOpen(false);
                  setSelectedElement(null);
                }
              }}
              title="可视化编辑"
            >
              <Paintbrush className="w-4 h-4" />
            </Button>
          )}

          {/* Undo/Redo Buttons (only in visual mode) */}
          {isVisualMode && activeTab === 'preview' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="text-charcoal/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border-2 border-transparent hover:border-charcoal dark:hover:border-white"
                title="撤销 (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="text-charcoal/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border-2 border-transparent hover:border-charcoal dark:hover:border-white"
                title="重做 (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <Button
              variant="ghost"
              size="sm"
              className={`border-2 transition-all ${isSettingsOpen ? 'bg-pop-blue dark:bg-neon-blue border-charcoal dark:border-neon-blue text-charcoal dark:text-white shadow-neo-sm' : 'border-transparent text-charcoal/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white hover:border-charcoal dark:hover:border-white'}`}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <Settings className="w-4 h-4" />
            </Button>

            {isSettingsOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-cyber-gray rounded-xl shadow-neo dark:shadow-[4px_4px_0px_0px_#00FFFF] border-4 border-charcoal dark:border-neon-blue p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                <h4 className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-4 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  {t('editor.settings')}
                </h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-bold text-charcoal dark:text-white group-hover:underline">{t('editor.public')}</span>
                    <div className={`w-12 h-7 rounded-full transition-colors relative border-2 border-charcoal dark:border-white ${isPublic ? 'bg-pop-green dark:bg-neon-green' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="hidden" />
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform border border-charcoal ${isPublic ? 'left-6' : 'left-1'}`}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-bold text-charcoal dark:text-white group-hover:underline">{t('editor.allowDownload')}</span>
                    <div className={`w-12 h-7 rounded-full transition-colors relative border-2 border-charcoal dark:border-white ${allowSourceDownload ? 'bg-pop-green dark:bg-neon-green' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <input type="checkbox" checked={allowSourceDownload} onChange={(e) => setAllowSourceDownload(e.target.checked)} className="hidden" />
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform border border-charcoal ${allowSourceDownload ? 'left-6' : 'left-1'}`}></div>
                    </div>
                  </label>

                  <div className="border-t-2 border-charcoal/10 dark:border-white/10 pt-4">
                    <label className="block">
                      <span className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider mb-2 block">{t('editor.description')}</span>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('editor.descriptionPlaceholder')}
                        className="w-full px-3 py-2 text-sm border-2 border-charcoal dark:border-white rounded-lg resize-none focus:outline-none focus:shadow-neo-sm bg-white dark:bg-cyber-black text-charcoal dark:text-white transition-all"
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
            className="rounded-lg ml-2 bg-pop-yellow dark:bg-neon-yellow text-charcoal dark:text-charcoal border-2 border-charcoal dark:border-neon-yellow shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] font-bold"
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
                className="w-full h-full p-6 font-mono text-sm resize-none focus:ring-0 border-none bg-[#1e1e1e] text-[#d4d4d4] dark:bg-cyber-black dark:text-white"
                spellCheck={false}
              />
            ) : (
              <iframe
                ref={iframeRef}
                srcDoc={getEnhancedHtml(previewContent)}
                className="w-full h-full bg-white dark:bg-white"
                title="Preview"
              />
            )}
          </div>
        </div>

        {/* Right: AI Web Designer Panel or Visual Editor */}
        {isVisualMode && activeTab === 'preview' ? (
          <VisualEditor
            selectedElement={selectedElement}
            onClose={() => {
              setIsVisualMode(false);
              setSelectedElement(null);
            }}
            onTextChange={handleTextChange}
            onStyleChange={handleStyleChange}
            onImageUpload={handleImageUpload}
            customFonts={customFonts}
            onAddFont={handleAddFont}
            presetFonts={PRESET_FONTS}
          />
        ) : isAiPanelOpen && (
          <div className="w-80 border-l-4 border-charcoal dark:border-neon-blue bg-white dark:bg-cyber-gray flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b-4 border-charcoal dark:border-neon-blue bg-pop-purple dark:bg-cyber-black">
              <div className="flex items-center space-x-2 text-charcoal dark:text-white mb-2">
                <Sparkles className="w-6 h-6 fill-white dark:fill-neon-yellow" />
                <h3 className="font-bold text-lg">{t('editor.aiDesigner')}</h3>
              </div>
              <p className="text-xs text-charcoal/80 dark:text-white/80 font-bold leading-relaxed">
                {t('editor.aiDescription')}
              </p>
            </div>

            <div className="p-6 flex-grow overflow-y-auto">
              <div className="mb-4">
                <label className="block text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-2">
                  {t('editor.aiModel')}
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-charcoal dark:border-white rounded-lg focus:outline-none focus:shadow-neo-sm bg-white dark:bg-cyber-black text-charcoal dark:text-white font-medium"
                >
                  {AVAILABLE_MODELS.map(model => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-3">
                  {t('editor.aiDesigner')}
                </label>
                <textarea
                  className="w-full h-32 p-3 rounded-xl border-2 border-charcoal dark:border-white bg-white dark:bg-cyber-black text-sm focus:outline-none focus:shadow-neo-sm resize-none placeholder-charcoal/30 dark:placeholder-white/30 transition-all font-medium text-charcoal dark:text-white"
                  placeholder={t('editor.aiPlaceholder')}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className={`w-full mt-4 rounded-xl py-3 flex items-center justify-center transition-all border-2 border-charcoal dark:border-neon-purple ${isGenerating ? 'bg-slate-200 dark:bg-slate-700 text-charcoal/50 dark:text-white/50' : 'bg-pop-purple dark:bg-neon-purple text-charcoal dark:text-white shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'} font-bold`}
                >
                  {isGenerating ? (
                    <>
                      <PopLoader className="mr-2" />
                      {t('editor.generating')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('editor.generate')}
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-6 border-t-4 border-charcoal/10 dark:border-white/10">
                <label className="block text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-4 flex items-center">
                  <Rocket className="w-3 h-3 mr-2" />
                  {t('editor.quickStart')}
                </label>

                <div className="space-y-3">
                  <button
                    onClick={() => applyTemplate('startup')}
                    className="w-full flex items-center p-3 rounded-xl bg-white dark:bg-cyber-black border-2 border-charcoal dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all group text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-pop-yellow dark:bg-neon-yellow border-2 border-charcoal dark:border-white flex items-center justify-center mr-3 group-hover:rotate-3 transition-transform">
                      <Rocket className="w-5 h-5 text-charcoal" />
                    </div>
                    <span className="text-sm font-bold text-charcoal dark:text-white">{t('editor.templates.startup')}</span>
                  </button>

                  <button
                    onClick={() => applyTemplate('resume')}
                    className="w-full flex items-center p-3 rounded-xl bg-white dark:bg-cyber-black border-2 border-charcoal dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all group text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-pop-blue dark:bg-neon-blue border-2 border-charcoal dark:border-white flex items-center justify-center mr-3 group-hover:-rotate-3 transition-transform">
                      <FileText className="w-5 h-5 text-charcoal" />
                    </div>
                    <span className="text-sm font-bold text-charcoal dark:text-white">{t('editor.templates.resume')}</span>
                  </button>

                  <button
                    onClick={() => applyTemplate('menu')}
                    className="w-full flex items-center p-3 rounded-xl bg-white dark:bg-cyber-black border-2 border-charcoal dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all group text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-pop-green dark:bg-neon-green border-2 border-charcoal dark:border-white flex items-center justify-center mr-3 group-hover:rotate-3 transition-transform">
                      <Utensils className="w-5 h-5 text-charcoal" />
                    </div>
                    <span className="text-sm font-bold text-charcoal dark:text-white">{t('editor.templates.menu')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Onboarding Tour */}
      {showTour && <OnboardingTour onComplete={handleTourComplete} />}
    </div>
  );
};
