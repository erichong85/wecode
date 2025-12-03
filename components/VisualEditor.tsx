import React from 'react';
import { X, Type, Palette, Image as ImageIcon, Layout, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Upload } from 'lucide-react';
import { Button } from './Button';

interface SelectedElement {
    selector: string;
    tagName: string;
    textContent: string;
    innerHTML: string;
    styles: {
        color?: string;
        backgroundColor?: string;
        fontSize?: string;
        fontWeight?: string;
        fontFamily?: string;
        fontStyle?: string;
        textDecoration?: string;
        backgroundImage?: string;
    };
}

interface VisualEditorProps {
    selectedElement: SelectedElement | null;
    onClose: () => void;
    onTextChange: (text: string) => void;
    onStyleChange: (styles: Record<string, string>) => void;
    onImageUpload: (file: File) => void;
    customFonts: string[];
    onAddFont: (name: string, fontData: string) => void;
    presetFonts?: { name: string; value: string; category: string }[];
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
    selectedElement,
    onClose,
    onTextChange,
    onStyleChange,
    onImageUpload,
    customFonts = [],
    onAddFont,
    presetFonts
}) => {
    const [editedText, setEditedText] = React.useState('');
    const [textColor, setTextColor] = React.useState('#000000');
    const [bgColor, setBgColor] = React.useState('transparent');
    const [bgType, setBgType] = React.useState<'color' | 'image'>('color');
    const [currentBgImage, setCurrentBgImage] = React.useState<string | null>(null);

    // Text styling states
    const [fontFamily, setFontFamily] = React.useState('inherit');
    const [fontSize, setFontSize] = React.useState('16');
    const [isBold, setIsBold] = React.useState(false);
    const [isItalic, setIsItalic] = React.useState(false);
    const [isUnderline, setIsUnderline] = React.useState(false);
    const [textAlign, setTextAlign] = React.useState('left');
    const [textShadow, setTextShadow] = React.useState(false);
    const [shadowColor, setShadowColor] = React.useState('#000000');

    React.useEffect(() => {
        if (selectedElement) {
            setEditedText(selectedElement.textContent);
            setTextColor(selectedElement.styles.color || '#000000');
            setBgColor(selectedElement.styles.backgroundColor || 'transparent');

            const bgImg = selectedElement.styles.backgroundImage;
            if (bgImg && bgImg !== 'none') {
                setBgType('image');
                // Extract URL from url(...)
                const match = bgImg.match(/url\(["']?(.+?)["']?\)/);
                setCurrentBgImage(match ? match[1] : null);
            } else {
                setBgType('color');
                setCurrentBgImage(null);
            }

            // Initialize text styling states
            setFontFamily(selectedElement.styles.fontFamily || 'inherit');
            const size = selectedElement.styles.fontSize || '16px';
            setFontSize(size.replace('px', ''));
            setIsBold(selectedElement.styles.fontWeight === 'bold' || parseInt(selectedElement.styles.fontWeight || '400') >= 700);
            setIsItalic(selectedElement.styles.fontStyle === 'italic');
            setIsUnderline(selectedElement.styles.textDecoration?.includes('underline') || false);
        }
    }, [selectedElement]);

    if (!selectedElement) {
        return (
            <div className="w-80 bg-white border-l border-charcoal/10 flex flex-col shadow-xl z-50 transition-all duration-300">
                <div className="h-14 border-b border-charcoal/5 flex items-center justify-between px-4 bg-cream-50">
                    <span className="font-bold text-charcoal">可视化编辑</span>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-charcoal/60">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-500">
                        <Layout className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-charcoal mb-2">选择元素进行编辑</h3>
                    <p className="text-sm">
                        点击左侧预览页面中的任意元素（文字、图片等）即可在此处进行编辑。
                    </p>
                </div>
            </div>
        );
    }

    const handleApply = () => {
        // Apply text change
        if (editedText !== selectedElement.textContent) {
            onTextChange(editedText);
        }

        // Apply style changes
        const styles: Record<string, string> = {};

        if (textColor !== selectedElement.styles.color) {
            styles.color = textColor;
        }

        if (bgType === 'color' && bgColor !== selectedElement.styles.backgroundColor) {
            styles.backgroundColor = bgColor;
            styles.backgroundImage = 'none';
        }

        // Text styling
        if (fontFamily !== (selectedElement.styles.fontFamily || 'inherit')) {
            styles.fontFamily = fontFamily;
        }

        if (`${fontSize}px` !== selectedElement.styles.fontSize) {
            styles.fontSize = `${fontSize}px`;
        }

        const currentWeight = selectedElement.styles.fontWeight === 'bold' || parseInt(selectedElement.styles.fontWeight || '400') >= 700;
        if (isBold !== currentWeight) {
            styles.fontWeight = isBold ? 'bold' : 'normal';
        }

        if (isItalic !== (selectedElement.styles.fontStyle === 'italic')) {
            styles.fontStyle = isItalic ? 'italic' : 'normal';
        }

        const currentUnderline = selectedElement.styles.textDecoration?.includes('underline') || false;
        if (isUnderline !== currentUnderline) {
            styles.textDecoration = isUnderline ? 'underline' : 'none';
        }

        if (textAlign) {
            styles.textAlign = textAlign;
        }

        if (textShadow) {
            styles.textShadow = `2px 2px 4px ${shadowColor}`;
        } else {
            styles.textShadow = 'none';
        }

        if (Object.keys(styles).length > 0) {
            onStyleChange(styles);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const fontData = event.target?.result as string;
                // Remove file extension for font name
                const fontName = file.name.replace(/\.[^/.]+$/, "");
                onAddFont(fontName, fontData);
                setFontFamily(fontName); // Auto-select new font
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveBackground = () => {
        onStyleChange({
            backgroundImage: 'none',
            backgroundColor: 'transparent'
        });
        setCurrentBgImage(null);
        setBgType('color');
    };

    const isImageElement = selectedElement.tagName === 'IMG';

    return (
        <div className="w-80 border-l border-charcoal/5 bg-white flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-charcoal/5 bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 text-indigo-600">
                        <Layout className="w-5 h-5" />
                        <h3 className="font-bold">可视化编辑</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-charcoal/40 hover:text-charcoal transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-indigo-600/70">
                    点击预览中的元素进行编辑
                </p>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {/* Element Info */}
                <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-1">
                        选中元素
                    </div>
                    <div className="text-sm font-mono text-indigo-600">
                        &lt;{selectedElement.tagName.toLowerCase()}&gt;
                    </div>
                </div>

                {/* Text Content Editor */}
                {!isImageElement && selectedElement.textContent && (
                    <div>
                        <label className="flex items-center text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                            <Type className="w-3 h-3 mr-2" />
                            文本内容
                        </label>
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-charcoal/10 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows={3}
                        />
                    </div>
                )}

                {/* Text Styling Controls */}
                {!isImageElement && selectedElement.textContent && (
                    <>
                        {/* Font Family */}
                        <div>
                            <label className="flex items-center text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                                <Type className="w-3 h-3 mr-2" />
                                字体
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={fontFamily}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFontFamily(value);
                                        onStyleChange({ fontFamily: value });
                                    }}
                                    className="flex-1 px-3 py-2 text-sm border border-charcoal/10 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="inherit">默认</option>
                                    {presetFonts && presetFonts.length > 0 ? (
                                        <>
                                            {/* Group by category */}
                                            {Array.from(new Set(presetFonts.map(f => f.category))).map(category => (
                                                <optgroup key={category} label={category}>
                                                    {presetFonts
                                                        .filter(f => f.category === category)
                                                        .map(font => (
                                                            <option key={font.value} value={font.value}>{font.name}</option>
                                                        ))}
                                                </optgroup>
                                            ))}
                                        </>
                                    ) : (
                                        <optgroup label="预设字体">
                                            <option value="Arial, sans-serif">Arial</option>
                                            <option value="'Times New Roman', serif">Times New Roman</option>
                                            <option value="'Courier New', monospace">Courier New</option>
                                            <option value="Georgia, serif">Georgia</option>
                                            <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
                                            <option value="'SimSun', serif">宋体</option>
                                            <option value="'KaiTi', serif">楷体</option>
                                            <option value="'SimHei', sans-serif">黑体</option>
                                        </optgroup>
                                    )}
                                    {customFonts.length > 0 && (
                                        <optgroup label="自定义字体">
                                            {customFonts.map(font => (
                                                <option key={font} value={`'${font}', sans-serif`}>{font}</option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".ttf,.otf,.woff,.woff2"
                                        onChange={handleFontUpload}
                                        className="hidden"
                                        id="font-upload"
                                    />
                                    <label
                                        htmlFor="font-upload"
                                        className="flex items-center justify-center w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
                                        title="上传字体文件 (.ttf, .otf, .woff)"
                                    >
                                        <Upload className="w-4 h-4" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Font Size */}
                        <div>
                            <label className="flex items-center text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                                大小
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="range"
                                    min="8"
                                    max="72"
                                    value={fontSize}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFontSize(value);
                                        onStyleChange({ fontSize: `${value}px` });
                                    }}
                                    className="flex-1"
                                />
                                <input
                                    type="number"
                                    value={fontSize}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFontSize(value);
                                        onStyleChange({ fontSize: `${value}px` });
                                    }}
                                    className="w-16 px-2 py-1 text-sm border border-charcoal/10 rounded"
                                    min="8"
                                    max="72"
                                />
                                <span className="text-xs text-charcoal/60">px</span>
                            </div>
                        </div>

                        {/* Text Style Buttons */}
                        <div>
                            <label className="flex items-center text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                                样式
                            </label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        const newValue = !isBold;
                                        setIsBold(newValue);
                                        onStyleChange({ fontWeight: newValue ? 'bold' : 'normal' });
                                    }}
                                    className={`flex-1 p-2 rounded border transition-colors ${isBold
                                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                        : 'border-charcoal/10 hover:bg-slate-50'
                                        }`}
                                    title="加粗"
                                >
                                    <Bold className="w-4 h-4 mx-auto" />
                                </button>
                                <button
                                    onClick={() => {
                                        const newValue = !isItalic;
                                        setIsItalic(newValue);
                                        onStyleChange({ fontStyle: newValue ? 'italic' : 'normal' });
                                    }}
                                    className={`flex-1 p-2 rounded border transition-colors ${isItalic
                                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                        : 'border-charcoal/10 hover:bg-slate-50'
                                        }`}
                                    title="斜体"
                                >
                                    <Italic className="w-4 h-4 mx-auto" />
                                </button>
                                <button
                                    onClick={() => {
                                        const newValue = !isUnderline;
                                        setIsUnderline(newValue);
                                        onStyleChange({ textDecoration: newValue ? 'underline' : 'none' });
                                    }}
                                    className={`flex-1 p-2 rounded border transition-colors ${isUnderline
                                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                        : 'border-charcoal/10 hover:bg-slate-50'
                                        }`}
                                    title="下划线"
                                >
                                    <Underline className="w-4 h-4 mx-auto" />
                                </button>
                            </div>
                        </div>

                        {/* Text Alignment */}
                        <div>
                            <label className="flex items-center text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                                对齐
                            </label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setTextAlign('left');
                                        onStyleChange({ textAlign: 'left' });
                                    }}
                                    className={`flex-1 p-2 rounded border transition-colors ${textAlign === 'left'
                                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                        : 'border-charcoal/10 hover:bg-slate-50'
                                        }`}
                                    title="左对齐"
                                >
                                    <AlignLeft className="w-4 h-4 mx-auto" />
                                </button>
                                <button
                                    onClick={() => {
                                        setTextAlign('center');
                                        onStyleChange({ textAlign: 'center' });
                                    }}
                                    className={`flex-1 p-2 rounded border transition-colors ${textAlign === 'center'
                                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                        : 'border-charcoal/10 hover:bg-slate-50'
                                        }`}
                                    title="居中对齐"
                                >
                                    <AlignCenter className="w-4 h-4 mx-auto" />
                                </button>
                                <button
                                    onClick={() => {
                                        setTextAlign('right');
                                        onStyleChange({ textAlign: 'right' });
                                    }}
                                    className={`flex-1 p-2 rounded border transition-colors ${textAlign === 'right'
                                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                        : 'border-charcoal/10 hover:bg-slate-50'
                                        }`}
                                    title="右对齐"
                                >
                                    <AlignRight className="w-4 h-4 mx-auto" />
                                </button>
                            </div>
                        </div>

                        {/* Text Shadow */}
                        <div>
                            <label className="flex items-center text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                                文字阴影
                            </label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={textShadow}
                                        onChange={(e) => setTextShadow(e.target.checked)}
                                        className="w-4 h-4 rounded border-charcoal/20"
                                    />
                                    <span className="text-sm">启用阴影</span>
                                </div>
                                {textShadow && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="color"
                                            value={shadowColor}
                                            onChange={(e) => setShadowColor(e.target.value)}
                                            className="w-12 h-10 rounded border border-charcoal/10 cursor-pointer"
                                        />
                                        <span className="text-xs text-charcoal/60">阴影颜色</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Image Upload */}
                {isImageElement && (
                    <div>
                        <label className="flex items-center text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                            <ImageIcon className="w-3 h-3 mr-2" />
                            图片设置
                        </label>
                        <div className="space-y-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="block w-full px-4 py-2 text-sm font-medium text-center text-indigo-600 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
                            >
                                📤 上传新图片
                            </label>
                        </div>
                    </div>
                )}

                {/* Text Color */}
                {!isImageElement && (
                    <div>
                        <label className="flex items-center text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                            <Palette className="w-3 h-3 mr-2" />
                            文字颜色
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-12 h-10 rounded border border-charcoal/10 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-charcoal/10 rounded-lg font-mono"
                            />
                        </div>
                    </div>
                )}

                {/* Background */}
                <div>
                    <label className="flex items-center text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                        <Palette className="w-3 h-3 mr-2" />
                        背景设置
                    </label>

                    <div className="space-y-3">
                        {/* Background Type */}
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setBgType('color')}
                                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${bgType === 'color'
                                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                                    : 'bg-slate-50 text-charcoal/60 hover:bg-slate-100'
                                    }`}
                            >
                                纯色
                            </button>
                            <button
                                onClick={() => setBgType('image')}
                                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${bgType === 'image'
                                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                                    : 'bg-slate-50 text-charcoal/60 hover:bg-slate-100'
                                    }`}
                            >
                                图片
                            </button>
                        </div>

                        {/* Color Picker */}
                        {bgType === 'color' && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="w-12 h-10 rounded border border-charcoal/10 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-charcoal/10 rounded-lg font-mono"
                                    placeholder="transparent"
                                />
                            </div>
                        )}

                        {/* Background Image Upload */}
                        {bgType === 'image' && (
                            <div className="space-y-3">
                                {/* Current Background Preview */}
                                {currentBgImage && (
                                    <div className="relative group">
                                        <img
                                            src={currentBgImage}
                                            alt="Background preview"
                                            className="w-full h-24 object-cover rounded-lg border border-charcoal/10"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs">当前背景</span>
                                        </div>
                                    </div>
                                )}

                                {/* Upload/Replace and Delete Buttons */}
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    const imageUrl = event.target?.result as string;
                                                    setCurrentBgImage(imageUrl);
                                                    onStyleChange({
                                                        backgroundImage: `url(${imageUrl})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                        id="bg-image-upload"
                                    />
                                    <label
                                        htmlFor="bg-image-upload"
                                        className="flex-1 px-4 py-2 text-sm font-medium text-center text-indigo-600 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
                                    >
                                        {currentBgImage ? '🔄 替换' : '📤 上传'}
                                    </label>
                                    {currentBgImage && (
                                        <button
                                            onClick={handleRemoveBackground}
                                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            🗑️ 删除
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-charcoal/5 space-y-2">
                <Button
                    onClick={handleApply}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                >
                    应用修改
                </Button>
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full text-charcoal/60"
                >
                    取消
                </Button>
            </div>
        </div>
    );
};
