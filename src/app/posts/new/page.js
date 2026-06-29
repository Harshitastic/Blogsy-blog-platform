'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EditorForm from '@/components/EditorForm';
import { useToast } from '@/components/ToastProvider';
import { useAuth } from '@/components/AuthProvider';

export default function NewPostPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?callbackUrl=/posts/new');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (postData) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to publish post');
      }

      showToast('success', 'Post published successfully!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error(error);
      showToast('error', error.message || 'Failed to create post');
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verifying authorization...</p>
      </div>
    );
  }

  return (
    <div className="editor-wrapper container">
      <h1 className="text-gradient-style" style={{ fontSize: '2.5rem', marginBottom: '24px', fontWeight: '800' }}>
        Create New Post
      </h1>
      <EditorForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Publish Post" />
    </div>
  );
}
