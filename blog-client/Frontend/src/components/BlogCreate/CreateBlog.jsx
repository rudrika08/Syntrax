import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CreateBlog.scss';
import { apiPost } from '../../utils/authUtils'; 

const categories = [
    'All Categories',
    'Tech & Programming',
    'Business & Finance',
    'Health & Fitness',
    'Travel & Adventure',
    'Lifestyle & Fashion',
    'Food & Cooking',
];

const toneOptions = [
    { value: 'professional', label: '💼 Professional', description: 'Formal and business-like' },
    { value: 'casual', label: '😊 Casual', description: 'Relaxed and conversational' },
    { value: 'friendly', label: '🤝 Friendly', description: 'Warm and approachable' },
    { value: 'informative', label: '📚 Informative', description: 'Educational and detailed' },
    { value: 'persuasive', label: '🎯 Persuasive', description: 'Compelling and convincing' },
    { value: 'humorous', label: '😄 Humorous', description: 'Light-hearted and funny' },
];

const sentimentOptions = [
    { value: 'positive', label: '✨ Positive', description: 'Optimistic and uplifting' },
    { value: 'neutral', label: '⚖️ Neutral', description: 'Balanced and objective' },
    { value: 'inspiring', label: '🚀 Inspiring', description: 'Motivational and encouraging' },
    { value: 'thoughtful', label: '🤔 Thoughtful', description: 'Reflective and deep' },
];

const CreateBlog = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const navigate = useNavigate();

    // AI Generation States
    const [aiPrompt, setAiPrompt] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [selectedTone, setSelectedTone] = useState('professional');
    const [selectedSentiment, setSelectedSentiment] = useState('neutral');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [suggestedTitles, setSuggestedTitles] = useState([]);
    const [generatedImageUrl, setGeneratedImageUrl] = useState('');
    const [imageLoading, setImageLoading] = useState(false);

    // AI Image Generation via Hugging Face
    const generateImage = async () => {
        if (!aiPrompt.trim() && !title.trim()) {
            toast.warning('Please enter a topic or title first');
            return;
        }

        setIsGeneratingImage(true);
        setImageLoading(true);
        setGeneratedImageUrl('');
        try {
            const response = await apiPost(`${import.meta.env.VITE_BACKEND_URI}/api/ai/generate-image`, {
                prompt: aiPrompt || title,
                category: selectedCategory,
                style: 'professional blog header image, modern, vibrant colors',
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle model loading state
                if (response.status === 503) {
                    toast.info('Model is loading... Retrying in 5 seconds');
                    setTimeout(() => generateImage(), 5000);
                    return;
                }
                throw new Error(data.message || 'Failed to generate image');
            }

            setGeneratedImageUrl(data.imageUrl);
            setImageLoading(false);
            toast.success('🖼️ Image generated successfully!');
        } catch (error) {
            console.error('Image Generation Error:', error);
            toast.error('Failed to generate image. Please try again.');
            setImageLoading(false);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    // AI Content Generation via Backend
    const generateContent = async () => {
        if (!aiPrompt.trim()) {
            toast.warning('Please enter a topic or prompt for AI generation');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await apiPost(`${import.meta.env.VITE_BACKEND_URI}/api/ai/generate`, {
                type: 'content',
                prompt: aiPrompt,
                sourceUrl: sourceUrl.trim() || undefined,
                category: selectedCategory,
                tone: selectedTone,
                sentiment: selectedSentiment,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate content');
            }

            setContent(data.content);
            toast.success('✨ Content generated successfully!');
        } catch (error) {
            console.error('AI Generation Error:', error);
            toast.error('Failed to generate content. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Generate Title Suggestions
    const generateTitleSuggestions = async () => {
        if (!aiPrompt.trim() && !content.trim()) {
            toast.warning('Please enter a topic or some content first');
            return;
        }

        setIsGeneratingTitle(true);
        try {
            const response = await apiPost(`${import.meta.env.VITE_BACKEND_URI}/api/ai/generate`, {
                type: 'titles',
                prompt: aiPrompt || content.substring(0, 500),
                category: selectedCategory,
                tone: selectedTone,
                sentiment: selectedSentiment,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate titles');
            }

            setSuggestedTitles(data.titles || []);
            toast.success('📝 Title suggestions generated!');
        } catch (error) {
            console.error('Title Generation Error:', error);
            toast.error('Failed to generate titles. Please try again.');
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    // Adjust Content Sentiment/Tone
    const adjustContent = async (adjustmentType) => {
        if (!content.trim()) {
            toast.warning('Please add some content first');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await apiPost(`${import.meta.env.VITE_BACKEND_URI}/api/ai/generate`, {
                type: 'adjust',
                adjustmentType,
                content,
                category: selectedCategory,
                tone: selectedTone,
                sentiment: selectedSentiment,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to adjust content');
            }

            setContent(data.content);
            toast.success(`🎨 Content ${adjustmentType} adjusted!`);
        } catch (error) {
            console.error('Content Adjustment Error:', error);
            toast.error('Failed to adjust content.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await apiPost(`${import.meta.env.VITE_BACKEND_URI}/api/blogCreate`, {
                title,
                content,
                image,
                category: selectedCategory,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create blog');
            }

            toast.success('Blog created successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.message || 'Error creating blog');
        }
    };

    return (
        <div className="create-blog-container">
            {/* Background decorative elements */}
            <div className="bg-decoration bg-decoration-1"></div>
            <div className="bg-decoration bg-decoration-2"></div>
            <div className="bg-decoration bg-decoration-3"></div>
            
            <div className="create-blog-content">
                <div className="header-section">
                    <h1 className="main-title">Create New</h1>
                    <h2 className="sub-title">Blog</h2>
                    <p className="description">Share your thoughts and insights with the community</p>
                </div>

                {/* AI Generation Panel Toggle */}
                <button 
                    type="button" 
                    className={`ai-toggle-btn ${showAiPanel ? 'active' : ''}`}
                    onClick={() => setShowAiPanel(!showAiPanel)}
                >
                    <span className="ai-icon">🤖</span>
                    <span>AI Content Assistant</span>
                    <span className="toggle-arrow">{showAiPanel ? '▲' : '▼'}</span>
                </button>

                {/* AI Generation Panel */}
                {showAiPanel && (
                    <div className="ai-panel">
                        <div className="ai-panel-header">
                            <h3>✨ AI Content Generation</h3>
                            <p>Generate blog content, adjust tone, and get title suggestions</p>
                        </div>

                        <div className="ai-prompt-section">
                            <label htmlFor="ai-prompt">What would you like to write about?</label>
                            <textarea
                                id="ai-prompt"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Enter your topic or describe what you want to write about... e.g., 'The future of artificial intelligence in healthcare'"
                                className="ai-prompt-input"
                                rows="3"
                            />
                        </div>

                        <div className="ai-url-section">
                            <label htmlFor="source-url">
                                <span>🔗 Reference URL (Optional)</span>
                                <span className="url-hint">AI will use content from this URL as reference</span>
                            </label>
                            <input
                                id="source-url"
                                type="url"
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                                placeholder="https://example.com/article-to-reference"
                                className="ai-url-input"
                            />
                        </div>

                        <div className="ai-controls-grid">
                            <div className="ai-control-group">
                                <label>Tone</label>
                                <div className="tone-options">
                                    {toneOptions.map((tone) => (
                                        <button
                                            key={tone.value}
                                            type="button"
                                            className={`tone-btn ${selectedTone === tone.value ? 'active' : ''}`}
                                            onClick={() => setSelectedTone(tone.value)}
                                            title={tone.description}
                                        >
                                            {tone.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="ai-control-group">
                                <label>Sentiment</label>
                                <div className="sentiment-options">
                                    {sentimentOptions.map((sentiment) => (
                                        <button
                                            key={sentiment.value}
                                            type="button"
                                            className={`sentiment-btn ${selectedSentiment === sentiment.value ? 'active' : ''}`}
                                            onClick={() => setSelectedSentiment(sentiment.value)}
                                            title={sentiment.description}
                                        >
                                            {sentiment.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="ai-actions">
                            <button
                                type="button"
                                className="ai-btn ai-btn-primary"
                                onClick={generateContent}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="spinner"></span>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        <span>Generate Content</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className="ai-btn ai-btn-secondary"
                                onClick={generateTitleSuggestions}
                                disabled={isGeneratingTitle}
                            >
                                {isGeneratingTitle ? (
                                    <>
                                        <span className="spinner"></span>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>📝</span>
                                        <span>Suggest Titles</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className="ai-btn ai-btn-outline"
                                onClick={() => adjustContent('tone')}
                                disabled={isGenerating || !content}
                            >
                                <span>🎨</span>
                                <span>Adjust Tone</span>
                            </button>

                            <button
                                type="button"
                                className="ai-btn ai-btn-outline"
                                onClick={() => adjustContent('sentiment')}
                                disabled={isGenerating || !content}
                            >
                                <span>💫</span>
                                <span>Adjust Sentiment</span>
                            </button>

                            <button
                                type="button"
                                className="ai-btn ai-btn-image"
                                onClick={generateImage}
                                disabled={isGeneratingImage}
                            >
                                {isGeneratingImage ? (
                                    <>
                                        <span className="spinner"></span>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🖼️</span>
                                        <span>Generate Image</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Generated Image Preview */}
                        {generatedImageUrl && (
                            <div className="generated-image-section">
                                <h4>🖼️ Generated Featured Image</h4>
                                <div className="image-preview-container">
                                    {imageLoading && (
                                        <div className="image-loading-overlay">
                                            <div className="spinner"></div>
                                            <p>Generating image... This may take 10-20 seconds</p>
                                        </div>
                                    )}
                                    <img 
                                        src={generatedImageUrl} 
                                        alt="AI Generated" 
                                        className={`generated-image-preview ${imageLoading ? 'loading' : ''}`}
                                        onLoad={() => {
                                            setImageLoading(false);
                                            toast.success('🖼️ Image loaded successfully!');
                                        }}
                                        onError={() => {
                                            setImageLoading(false);
                                            toast.error('Failed to load image. Try regenerating.');
                                        }}
                                    />
                                    {!imageLoading && (
                                        <div className="image-actions">
                                            <button
                                                type="button"
                                                className="use-image-btn"
                                                onClick={() => {
                                                    setImage(generatedImageUrl);
                                                    toast.success('Image set as featured image!');
                                                }}
                                            >
                                                ✓ Use This Image
                                            </button>
                                            <button
                                                type="button"
                                                className="regenerate-btn"
                                                onClick={generateImage}
                                                disabled={isGeneratingImage}
                                            >
                                                🔄 Regenerate
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Suggested Titles */}
                        {suggestedTitles.length > 0 && (
                            <div className="suggested-titles">
                                <h4>📋 Suggested Titles</h4>
                                <div className="titles-list">
                                    {suggestedTitles.map((suggestedTitle, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className="title-suggestion"
                                            onClick={() => {
                                                setTitle(suggestedTitle);
                                                toast.info('Title applied!');
                                            }}
                                        >
                                            <span className="title-number">{index + 1}</span>
                                            <span className="title-text">{suggestedTitle}</span>
                                            <span className="use-btn">Use</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="blog-form">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label htmlFor="title">Article Title</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter your blog title..."
                                required
                                className="input-field"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <div className="select-wrapper">
                                <select
                                    id="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="select-field"
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="image">Featured Image</label>
                            <input
                                id="image"
                                type="url"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                required
                                className="input-field"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="content">Content</label>
                            <div className="editor-wrapper">
                                <ReactQuill
                                    value={content}
                                    onChange={setContent}
                                    className="quill-editor"
                                    placeholder="Start writing your blog content here..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            <span>Publish Blog</span>
                            <div className="btn-glow"></div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBlog;