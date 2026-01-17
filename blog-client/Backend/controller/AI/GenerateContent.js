// Helper function to fetch and extract content from URL
const fetchWebContent = async (url) => {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch URL');
        }
        
        const html = await response.text();
        
        // Extract text content from HTML (basic extraction)
        // Remove script and style tags
        let text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
            .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
            .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
        
        // Extract text from remaining HTML
        text = text
            .replace(/<[^>]+>/g, ' ')  // Remove HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .trim();
        
        // Limit content length to avoid token limits
        return text.substring(0, 5000);
    } catch (error) {
        console.error('Error fetching URL:', error);
        return null;
    }
};

const generateContent = async (req, res) => {
    try {
        const { prompt, category, tone, sentiment, type, sourceUrl } = req.body;

        if (!prompt && type !== 'adjust') {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // Fetch web content if URL is provided
        let webContent = '';
        if (sourceUrl && type === 'content') {
            const fetchedContent = await fetchWebContent(sourceUrl);
            if (fetchedContent) {
                webContent = `\n\nReference content from ${sourceUrl}:\n${fetchedContent}`;
            }
        }

        let systemPrompt = '';
        let userPrompt = '';

        switch (type) {
            case 'content':
                systemPrompt = `You are a professional blog writer. Write in a ${tone} tone with a ${sentiment} sentiment. The content should be well-structured with proper HTML formatting including headings, paragraphs, and lists where appropriate. Make the content engaging, informative, and suitable for a ${category} blog post.${webContent ? ' Use the reference content provided to enhance your writing with accurate information, but write in your own words.' : ''}`;
                userPrompt = `Write a comprehensive blog post about: ${prompt}
Category: ${category}
${webContent}

Requirements:
- Write engaging, informative content suitable for a ${category} blog post
- Include an engaging introduction, main points with details, and a conclusion
- Format the content with proper HTML tags for headings (h2, h3), paragraphs (<p>), and bullet points (<ul><li>) where relevant
- Make it well-structured and easy to read
- Do not include the title, just the body content
${webContent ? '- Use the reference content as a source of information but rewrite everything in your own words' : ''}`;
                break;

            case 'titles':
                systemPrompt = `You are a creative headline writer specializing in ${category} content. Generate catchy, SEO-friendly blog titles with a ${tone} tone.`;
                userPrompt = `Generate 5 compelling, catchy, SEO-friendly blog title suggestions for the following:
Topic: ${prompt}
Category: ${category}
Tone: ${tone}

Return ONLY the titles, one per line, numbered 1-5. No explanations or additional text.`;
                break;

            case 'adjust':
                const { content, adjustmentType } = req.body;
                if (!content) {
                    return res.status(400).json({ message: 'Content is required for adjustment' });
                }
                systemPrompt = `You are an expert content editor. Rewrite the provided content to adjust its ${adjustmentType}. Maintain the original meaning and structure while changing the ${adjustmentType}. Keep any HTML formatting intact.`;
                userPrompt = `Rewrite this blog content with a ${adjustmentType === 'tone' ? tone : sentiment} ${adjustmentType}:

${content}

Requirements:
- Maintain the original meaning and structure
- Keep any HTML formatting intact
- Only change the ${adjustmentType}, not the content's message
- Return only the rewritten content, no explanations`;
                break;

            default:
                return res.status(400).json({ message: 'Invalid generation type' });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: type === 'titles' ? 0.8 : 0.7,
                max_tokens: type === 'titles' ? 300 : 2048,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Groq API Error:', errorData);
            return res.status(response.status).json({ 
                message: 'Failed to generate content',
                error: errorData 
            });
        }

        const data = await response.json();
        const generatedText = data.choices?.[0]?.message?.content || '';

        if (type === 'titles') {
            const titles = generatedText.split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim())
                .filter(title => title.length > 0);
            return res.json({ titles });
        }

        res.json({ content: generatedText });

    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = generateContent;
