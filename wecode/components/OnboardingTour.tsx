import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles, Code, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './Button';

interface OnboardingTourProps {
    onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Delay showing to allow animation
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const steps = [
        {
            title: "Welcome to HostGenie Editor",
            description: "Create stunning websites with the power of AI and clean code.",
            icon: <Sparkles className="w-12 h-12 text-pop-yellow" />,
            color: "bg-charcoal"
        },
        {
            title: "AI Web Designer",
            description: "Describe what you want in the AI Panel, and watch your site come to life instantly.",
            icon: <Sparkles className="w-12 h-12 text-neon-pink" />,
            color: "bg-pop-purple"
        },
        {
            title: "Live Code Editor",
            description: "Fine-tune the generated HTML/CSS directly. Changes update in real-time.",
            icon: <Code className="w-12 h-12 text-neon-blue" />,
            color: "bg-pop-blue"
        },
        {
            title: "Instant Preview",
            description: "Switch to Preview mode to see how your site looks on different devices.",
            icon: <Eye className="w-12 h-12 text-neon-green" />,
            color: "bg-pop-green"
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            setIsVisible(false);
            setTimeout(onComplete, 300);
        }
    };

    if (!isVisible && step === 0) return null;

    const currentStep = steps[step];

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative w-full max-w-md mx-4">
                {/* Card */}
                <div className="bg-white dark:bg-cyber-gray border-4 border-charcoal dark:border-neon-yellow shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#E2F546] rounded-xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-300">

                    {/* Step Indicator */}
                    <div className="absolute top-4 left-4 flex space-x-2">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full border border-charcoal ${i === step ? 'bg-pop-yellow dark:bg-neon-yellow' : 'bg-gray-200 dark:bg-gray-700'}`}
                            />
                        ))}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onComplete}
                        className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-charcoal dark:text-white" />
                    </button>

                    {/* Icon */}
                    <div className="flex justify-center mb-6 mt-4">
                        <div className={`w-24 h-24 rounded-full border-4 border-charcoal dark:border-white flex items-center justify-center bg-white dark:bg-cyber-black shadow-neo dark:shadow-[4px_4px_0px_0px_#FFFFFF]`}>
                            {currentStep.icon}
                        </div>
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-bold text-charcoal dark:text-white mb-3">
                        {currentStep.title}
                    </h2>
                    <p className="text-charcoal/70 dark:text-white/70 mb-8 leading-relaxed">
                        {currentStep.description}
                    </p>

                    {/* Action */}
                    <Button
                        onClick={handleNext}
                        variant="primary"
                        className="w-full py-4 text-lg font-bold shadow-neo dark:shadow-[4px_4px_0px_0px_#E2F546]"
                    >
                        {step === steps.length - 1 ? "Get Started" : "Next"}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
