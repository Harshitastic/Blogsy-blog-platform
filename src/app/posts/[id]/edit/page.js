'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import EditorForm from '@/components/EditorForm';
import { useToast } from '@/components/ToastProvider';
import { Loader2 } from 'lucide-react';

export default function EditPostPage({ params }) {
  // Unwrap parameters hook in Next.js 15
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const router = useRouter();
  const { showToast } = useToast();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) throw new Error('Post not found');
        const data = await res.json();
        setPost(data.post);
      } catch (error) {
        console.error(error);
        showToast('error', 'Failed to retrieve post details');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id, router, showToast]);

  const handleSubmit = async (postData) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      showToast('success', 'Post updated successfully!');
      router.push(`/posts/${id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      showToast('error', error.message || 'Failed to save changes');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <Loader2 size={36} className="logo-icon" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading post editor...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="editor-wrapper container">
      <h1 className="text-gradient-style" style={{ fontSize: '2.5rem', marginBottom: '24px', fontWeight: '800' }}>
        Edit Post
      </h1>
      {post && (
        <EditorForm 
          initialData={post} 
          onSubmit={handleSubmit} 
          submitting={submitting} 
          submitLabel="Save Changes" 
        />
      )}
    </div>
  );
}
