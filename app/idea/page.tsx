import React from 'react';
import IdeaInput from '@/components/IdeaInput';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Launch Your Idea | UseLaunchLab',
  description: 'Transform your entrepreneurial vision into reality. Get AI-powered insights for your startup idea.',
};

export default function IdeaPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <IdeaInput />
    </main>
  );
}
