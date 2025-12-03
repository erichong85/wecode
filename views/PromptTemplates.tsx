import React, { useState, useEffect } from 'react';
import { Search, Copy, Check, Plus, Tag, Trash2, Edit2, Sparkles, Globe } from 'lucide-react';
import { PromptTemplate, User } from '../types';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface PromptTemplatesProps {
    user: User | null;
    onUsePrompt: (prompt: string) => void;
    onBack: () => void;
}

const SYSTEM_PROMPTS_ZH: PromptTemplate[] = [
    {
        id: 'sys_zh_1',
        title: '现代作品集',
        content: '为摄影师创建一个现代、极简的作品集网站。使用深色主题，配有大尺寸的高质量图片占位符。包含一个粘性导航栏，一个带有淡入动画的英雄区域，一个瀑布流画廊，一个"关于我"部分和一个联系表单。使用 Inter 字体。',
        category: '作品集',
        tags: ['深色模式', '极简', '画廊'],
        isSystem: true
    },
    {
        id: 'sys_zh_2',
        title: 'SaaS 落地页',
        content: '为名为 "TaskFlow" 的 SaaS 产品设计一个高转化率的落地页。使用干净的蓝白配色方案。包含一个带有"立即开始" CTA 的英雄区域，一个使用图标展示的"功能"部分，一个包含 3 个层级（基础版、专业版、企业版）的"价格"表，以及页脚。为按钮添加悬停效果。',
        category: '落地页',
        tags: ['商业', '简洁', '价格表'],
        isSystem: true
    },
    {
        id: 'sys_zh_3',
        title: '餐厅菜单',
        content: '为一家意大利小酒馆建立一个餐厅菜单网站。使用暖色调（奶油色、赤陶色、橄榄色）。标题应使用衬线字体显示餐厅名称。将菜品分为"开胃菜"、"头盘"、"主菜"和"甜点"。每道菜都应有名称、描述和价格。添加一个"预订座位"按钮。',
        category: '餐饮',
        tags: ['暖色调', '菜单', '衬线体'],
        isSystem: true
    },
    {
        id: 'sys_zh_4',
        title: '博客主页',
        content: '创建一个博客主页布局。左侧侧边栏用于导航和分类。主要内容区域显示最近的文章列表，包含特色图片、标题、摘要和"阅读更多"链接。右侧侧边栏显示"热门文章"和"通讯订阅"。正文使用清晰易读的衬线字体。',
        category: '博客',
        tags: ['布局', '内容', '侧边栏'],
        isSystem: true
    },
    {
        id: 'sys_zh_5',
        title: '电商产品页',
        content: '为一款高端手表设计单个产品页面。分屏布局：左侧是大尺寸产品图片画廊，右侧是产品详情（标题、价格、描述、"加入购物车"按钮）。下方添加"相关产品"轮播图。使用奢华、时尚的设计风格。',
        category: '电商',
        tags: ['奢华', '产品', '画廊'],
        isSystem: true
    }
];

export const PromptTemplates: React.FC<PromptTemplatesProps> = ({ user, onUsePrompt, onBack }) => {
    const { t } = useLanguage();
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Prompt Form State
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newTags, setNewTags] = useState('');
    const [isSystemPrompt, setIsSystemPrompt] = useState(false);

    const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        // 1. Load System Prompts (Static)
        let allPrompts = [...SYSTEM_PROMPTS_ZH];

        // 2. Load from Supabase (Global Prompts)
        if (supabase) {
            const { data } = await supabase
                .from('prompts')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                const dbPrompts: PromptTemplate[] = data.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    content: p.content,
                    category: p.category,
                    tags: p.tags || [],
                    author: p.author_name,
                    isSystem: p.is_system
                }));
                // Merge DB prompts
                // Filter out static system prompts if they exist in DB to avoid duplicates if we decide to migrate them
                allPrompts = [...allPrompts, ...dbPrompts];
            }
        }

        // 3. Load from LocalStorage (Personal Prompts)
        const saved = localStorage.getItem('hg_user_prompts');
        if (saved) {
            try {
                const localPrompts = JSON.parse(saved);
                allPrompts = [...allPrompts, ...localPrompts];
            } catch (e) {
                console.error('Failed to parse user prompts', e);
            }
        }

        setPrompts(allPrompts);
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id: string, isSystem: boolean) => {
        if (!confirm(t('prompts.deleteConfirm'))) return;

        if (id.startsWith('sys_')) {
            alert('Cannot delete built-in system prompts.');
            return;
        }

        // Try delete from Supabase first
        if (supabase && (isSystem || !id.startsWith('usr_'))) {
            const { error } = await supabase.from('prompts').delete().eq('id', id);
            if (error) {
                alert('Failed to delete: ' + error.message);
                return;
            }
        } else {
            // Delete from LocalStorage
            const saved = localStorage.getItem('hg_user_prompts');
            if (saved) {
                const localPrompts = JSON.parse(saved);
                const updated = localPrompts.filter((p: any) => p.id !== id);
                localStorage.setItem('hg_user_prompts', JSON.stringify(updated));
            }
        }

        // Update UI
        setPrompts(prompts.filter(p => p.id !== id));
    };

    const handleEditPrompt = (prompt: PromptTemplate) => {
        if (prompt.id.startsWith('sys_')) {
            alert('Cannot edit built-in system prompts.');
            return;
        }
        setEditingPrompt(prompt);
        setNewTitle(prompt.title);
        setNewContent(prompt.content);
        setNewCategory(prompt.category);
        setNewTags(prompt.tags.join(', '));
        setIsSystemPrompt(!!prompt.isSystem);
        setIsModalOpen(true);
    };

    const handleSavePrompt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !newContent) return;

        const promptData = {
            title: newTitle,
            content: newContent,
            category: newCategory || 'Custom',
            tags: newTags.split(/[,，]/).map(t => t.trim()).filter(t => t),
            author_id: user?.id,
            author_name: user?.name || 'User',
            is_system: isSystemPrompt && user?.role === 'admin'
        };

        if (editingPrompt) {
            // UPDATE EXISTING
            if (supabase && (editingPrompt.isSystem || !editingPrompt.id.startsWith('usr_'))) {
                const { error } = await supabase
                    .from('prompts')
                    .update(promptData)
                    .eq('id', editingPrompt.id);

                if (error) {
                    alert('Failed to update: ' + error.message);
                    return;
                }

                // Update local state
                setPrompts(prompts.map(p => p.id === editingPrompt.id ? { ...p, ...promptData, tags: promptData.tags } : p));
            } else {
                // Update LocalStorage
                const saved = localStorage.getItem('hg_user_prompts');
                if (saved) {
                    const localPrompts = JSON.parse(saved);
                    const updated = localPrompts.map((p: any) => p.id === editingPrompt.id ? { ...p, ...promptData, tags: promptData.tags } : p);
                    localStorage.setItem('hg_user_prompts', JSON.stringify(updated));

                    // Update local state
                    setPrompts(prompts.map(p => p.id === editingPrompt.id ? { ...p, ...promptData, tags: promptData.tags } : p));
                }
            }
        } else {
            // CREATE NEW
            if (supabase && (isSystemPrompt || user)) {
                const { data, error } = await supabase
                    .from('prompts')
                    .insert(promptData)
                    .select()
                    .single();

                if (error) {
                    alert('Failed to save: ' + error.message);
                    return;
                }

                if (data) {
                    const newPrompt: PromptTemplate = {
                        id: data.id,
                        title: data.title,
                        content: data.content,
                        category: data.category,
                        tags: data.tags,
                        author: data.author_name,
                        isSystem: data.is_system
                    };
                    setPrompts([newPrompt, ...prompts]);
                }
            } else {
                const newPrompt: PromptTemplate = {
                    id: 'usr_' + Date.now(),
                    title: newTitle,
                    content: newContent,
                    category: newCategory || 'Custom',
                    tags: promptData.tags,
                    author: user?.name || 'User',
                    isSystem: false
                };

                const saved = localStorage.getItem('hg_user_prompts');
                const localPrompts = saved ? JSON.parse(saved) : [];
                localStorage.setItem('hg_user_prompts', JSON.stringify([...localPrompts, newPrompt]));
                setPrompts([newPrompt, ...prompts]);
            }
        }

        // Reset and close
        setNewTitle('');
        setNewContent('');
        setNewCategory('');
        setNewTags('');
        setIsSystemPrompt(false);
        setEditingPrompt(null);
        setIsModalOpen(false);
    };

    const categories = ['All', ...Array.from(new Set(prompts.map(p => p.category)))];

    const filteredPrompts = prompts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
            {/* Header */}
            <div className="bg-white border-b-4 border-charcoal sticky top-16 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Button variant="ghost" onClick={onBack} className="mr-4 text-charcoal hover:bg-charcoal/5">
                                <span className="font-bold">← {t('common.back')}</span>
                            </Button>
                            <h1 className="text-2xl font-bold text-charcoal flex items-center">
                                <Sparkles className="w-6 h-6 mr-2 text-pop-purple fill-current" />
                                {t('prompts.title')}
                            </h1>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-1 gap-4 items-center w-full overflow-hidden">
                            <div className="relative flex-grow max-w-md min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder={t('prompts.searchPlaceholder')}
                                    className="w-full pl-10 pr-4 py-2 border-2 border-charcoal rounded-lg focus:outline-none focus:ring-0 shadow-neo-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border-2 border-charcoal transition-all ${selectedCategory === cat
                                            ? 'bg-pop-blue text-charcoal shadow-neo-sm'
                                            : 'bg-white text-charcoal hover:bg-slate-50'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button onClick={() => {
                            setEditingPrompt(null);
                            setNewTitle('');
                            setNewContent('');
                            setNewCategory('');
                            setNewTags('');
                            setIsSystemPrompt(false);
                            setIsModalOpen(true);
                        }} className="shrink-0 ml-4 bg-pop-yellow text-charcoal border-2 border-charcoal shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('prompts.add')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrompts.map(prompt => (
                        <div key={prompt.id} className="bg-white rounded-xl border-4 border-charcoal shadow-neo hover:shadow-neo-lg transition-all hover:-translate-y-1 flex flex-col h-full group">
                            <div className="p-6 flex-grow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="inline-block px-2 py-1 text-xs font-bold bg-pop-purple border-2 border-charcoal text-charcoal rounded-md mb-2 shadow-neo-sm">
                                            {prompt.category}
                                        </span>
                                        <h3 className="text-lg font-bold text-charcoal line-clamp-1">{prompt.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {/* Edit Button */}
                                        {(user?.role === 'admin' || (!prompt.isSystem && !prompt.id.startsWith('sys_'))) && (
                                            <button
                                                onClick={() => handleEditPrompt(prompt)}
                                                className="text-charcoal hover:text-pop-blue opacity-0 group-hover:opacity-100 transition-opacity p-1 border-2 border-transparent hover:border-charcoal rounded"
                                                title={t('common.edit')}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        {/* Delete Button */}
                                        {(user?.role === 'admin' || !prompt.isSystem) && !prompt.id.startsWith('sys_') && (
                                            <button
                                                onClick={() => handleDelete(prompt.id, !!prompt.isSystem)}
                                                className="text-charcoal hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 border-2 border-transparent hover:border-charcoal rounded"
                                                title={t('common.delete')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <p className="text-charcoal/80 text-sm leading-relaxed mb-4 line-clamp-4 whitespace-pre-wrap font-medium">
                                    {prompt.content}
                                </p>

                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {prompt.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center text-xs font-bold text-charcoal/60 bg-slate-100 px-2 py-1 rounded border border-charcoal/20">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {tag}
                                        </span>
                                    ))}
                                    {prompt.isSystem && (
                                        <span className="inline-flex items-center text-xs font-bold text-charcoal bg-pop-blue/20 px-2 py-1 rounded border-2 border-pop-blue">
                                            <Globe className="w-3 h-3 mr-1" />
                                            System
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t-4 border-charcoal p-4 bg-white rounded-b-lg flex justify-between items-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(prompt.content, prompt.id)}
                                    className={`font-bold ${copiedId === prompt.id ? 'text-green-600' : 'text-charcoal hover:bg-charcoal/5'}`}
                                >
                                    {copiedId === prompt.id ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            {t('prompts.copied')}
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            {t('prompts.copy')}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => onUsePrompt(prompt.content)}
                                    className="bg-pop-yellow text-charcoal border-2 border-charcoal shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    {t('prompts.use')}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredPrompts.length === 0 && (
                    <div className="text-center py-20 border-4 border-dashed border-charcoal rounded-xl mt-8">
                        <div className="bg-pop-yellow rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border-4 border-charcoal shadow-neo">
                            <Search className="w-10 h-10 text-charcoal" />
                        </div>
                        <h3 className="text-xl font-bold text-charcoal">{t('prompts.noResults')}</h3>
                        <p className="text-charcoal/60 mt-2 font-medium">{t('prompts.noResultsDesc')}</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4" id="modal-title">
                                    {editingPrompt ? 'Edit Prompt' : t('prompts.addTitle')}
                                </h3>
                                <form onSubmit={handleSavePrompt} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('prompts.formTitle')}</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="E.g., Modern Portfolio"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('prompts.formCategory')}</label>
                                        <input
                                            type="text"
                                            className="w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            placeholder="E.g., Portfolio"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('prompts.formTags')}</label>
                                        <input
                                            type="text"
                                            className="w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={newTags}
                                            onChange={(e) => setNewTags(e.target.value)}
                                            placeholder="E.g., Dark, Minimalist (comma separated)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('prompts.formContent')}</label>
                                        <textarea
                                            required
                                            rows={6}
                                            className="w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={newContent}
                                            onChange={(e) => setNewContent(e.target.value)}
                                            placeholder="Describe the website..."
                                        />
                                    </div>

                                    {user?.role === 'admin' && (
                                        <div className="flex items-center">
                                            <input
                                                id="is-system"
                                                type="checkbox"
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                checked={isSystemPrompt}
                                                onChange={(e) => setIsSystemPrompt(e.target.checked)}
                                            />
                                            <label htmlFor="is-system" className="ml-2 block text-sm text-gray-900">
                                                Set as System Prompt (Visible to all users)
                                            </label>
                                        </div>
                                    )}

                                    <div className="mt-5 sm:mt-6 flex gap-3">
                                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                            {t('common.cancel')}
                                        </Button>
                                        <Button type="submit" className="flex-1">
                                            {editingPrompt ? 'Update' : t('common.save')}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
