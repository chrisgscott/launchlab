import React from 'react';
import IdeaInput from '@/components/IdeaInput';
import { Metadata } from 'next';
import { Rocket, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Launch Your Idea | UseLaunchLab',
  description:
    'Transform your entrepreneurial vision into reality. Get AI-powered insights for your startup idea.',
};

export default function IdeaPage() {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full mb-4 shadow-sm">
          <Rocket className="w-6 h-6 text-primary mr-2" />
          <span className="font-medium">Idea Analysis</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Let&apos;s validate your idea</h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-warning" />
          <p className="text-xl font-medium">AI-Powered Analysis</p>
          <Sparkles className="w-5 h-5 text-warning" />
        </div>
        <p className="text-lg mb-8">
          We&apos;ll help you assess market potential and identify opportunities.
        </p>
        <p className="text-xl opacity-80 max-w-2xl mx-auto leading-relaxed">
          Tell us about your idea and we&apos;ll give you detailed insights on its potential,
          challenges, and next steps.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <IdeaInput />
      </div>
    </div>
  );
}
