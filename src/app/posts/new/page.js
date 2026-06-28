'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditorForm from '@/components/EditorForm';
import { useToast } from '@/components/ToastProvider';

export default function NewPostPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="editor-wrapper container">
      <h1 className="text-gradient-style" style={{ fontSize: '2.5rem', marginBottom: '24px', fontWeight: '800' }}>
        Create New Post
      </h1>
      <EditorForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Publish Post" />
    </div>
  );
}
