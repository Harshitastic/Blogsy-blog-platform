'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Heading2, Heading3, 
  List, ListOrdered, Quote, Code, Link as LinkIcon, 
  AlignLeft, AlignCenter, AlignRight, Image, Trash2, 
  Save, Eye, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function EditorForm({ initialData = null, onSubmit, submitting, submitLabel = 'Publish Post' }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [published, setPublished] = useState(initialData?.published !== undefined ? initialData.published : true);
  
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Set initial content on mount
  useEffect(() => {
    if (editorRef.current && initialData?.content) {
      editorRef.current.innerHTML = initialData.content;
    }
  }, [initialData]);

  // Prevent focus loss when clicking toolbar buttons
  const handleToolbarAction = (e, command, value = null) => {
    e.preventDefault();
    if (!editorRef.current) return;
    
    // Execute editor action
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const handleLinkAction = (e) => {
    e.preventDefault();
    const url = prompt('Enter the link URL (e.g. https://google.com):');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  // Image Upload Logic
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setCoverImage(data.url);
    } catch (error) {
      console.error(error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleFileUpload(file);
  };

  // Drag and Drop handles
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    
    const content = editorRef.current?.innerHTML || '';
    if (!content.trim() || content === '<br>') {
      alert('Post content is required');
      return;
    }

    onSubmit({
      title: title.trim(),
      content,
      coverImage,
      published,
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="editor-form animate-fade-in">
      <div className="editor-actions-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '-10px' }}>
        <Link href={initialData ? `/posts/${initialData.id}` : '/dashboard'} className="btn-secondary">
          <ArrowLeft size={16} />
          <span>Back</span>
        </Link>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <input 
              type="checkbox" 
              checked={published} 
              onChange={(e) => setPublished(e.target.checked)}
              style={{ accentColor: 'var(--accent-cyan)' }}
            />
            <span>Publish immediately</span>
          </label>

          <button type="submit" className="btn-primary" disabled={submitting || uploading}>
            <Save size={16} />
            <span>{submitting ? 'Saving...' : submitLabel}</span>
          </button>
        </div>
      </div>

      <div className="glass-panel editor-main-card">
        {/* Cover Upload Area */}
        <div style={{ marginBottom: '32px' }}>
          {coverImage ? (
            <div className="cover-preview-wrapper">
              <img src={coverImage} alt="Cover Preview" className="cover-preview-image" />
              <button type="button" onClick={removeCoverImage} className="btn-remove-cover">
                <Trash2 size={14} />
                <span>Remove Cover</span>
              </button>
            </div>
          ) : (
            <div 
              className={`cover-upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleFileChange}
              />
              <Image size={32} className="cover-upload-icon" />
              <span className="cover-upload-text">
                {uploading ? 'Uploading image...' : 'Drag & drop a cover image here, or click to upload'}
              </span>
              <span className="cover-upload-subtext">Supports PNG, JPG, JPEG (Max 5MB)</span>
            </div>
          )}
        </div>

        {/* Title Input */}
        <input 
          type="text" 
          placeholder="Title of your post..." 
          className="editor-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <div style={{ borderBottom: '1px solid var(--border-glass)', marginBottom: '24px' }}></div>

        {/* Rich Text Editor Toolbar */}
        <div className="editor-toolbar">
          <button type="button" className="toolbar-btn" onMouseDown={(e) => handleToolbarAction(e, 'bold')} title="Bold">
            <Bold size={16} />
          </button>
          <button type="button" className="toolbar-btn" onMouseDown={(e) => handleToolbarAction(e, 'italic')} title="Italic">
            <Italic size={16} />
          </button>
          <button type="button" className="toolbar-btn" onMouseDown={(e) => handleToolbarAction(e, 'underline')} title="Underline">
            <Underline size={16} />
          </button>
          
          <div className="toolbar-divider"></div>
          
          <button type="button" className="toolbar-btn" onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'h2')} title="Heading 2">
            <Heading2 size={16} />
          </button>
          <button type="button" className="toolbar-btn" onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'h3')} title="Heading 3">
            <Heading3 size={16} />
          </button>
          
          <div className="toolbar-divider"></div>
          
          <button type="button" className="toolbar-btn" onMouseDown={(e) => handleToolbarAction(e, 'insertUnorderedList')} title="Bullet List">
            <List size={16} />
          </button>
          <button type="button" className="toolbar-btn" onMouseDown={(e) => handleToolbarAction(e, 'insertOrderedList')} title="Numbered List">
            <ListOrdered size={16} />
          </button>
          <button type="button" className="toolbar-btn" onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'blockquote')} title="Quote">
            <Quote size={16} />
          </button>
          <button type="button" className="toolbar-btn" onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'pre')} title="Code Block">
            <Code size={16} />
          </button>
          
          <div className="toolbar-divider"></div>
          
          <button type="button" className="toolbar-btn" onMouseDown={handleLinkAction} title="Insert Link">
            <LinkIcon size={16} />
          </button>

          <div className="toolbar-divider"></div>

          <button type="button" className="toolbar-btn" onMouseDown={(e) => handleToolbarAction(e, 'justifyLeft')} title="Align Left">
            <AlignLeft size={16} />
          </button>
          <button type="button" className="toolbar-btn" onMouseDown={(e) => handleToolbarAction(e, 'justifyCenter')} title="Align Center">
            <AlignCenter size={16} />
          </button>
          <button type="button" className="toolbar-btn" onMouseDown={(e) => handleToolbarAction(e, 'justifyRight')} title="Align Right">
            <AlignRight size={16} />
          </button>
        </div>

        {/* contentEditable Workspace */}
        <div 
          ref={editorRef}
          contentEditable 
          className="editor-content-area"
          placeholder="Start writing your masterpiece here..."
          suppressContentEditableWarning
        ></div>
      </div>
    </form>
  );
}
