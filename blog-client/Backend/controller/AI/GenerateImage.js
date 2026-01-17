const generateImage = async (req, res) => {
    try {
        const { prompt, category, style } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // Create an enhanced prompt for better blog images
        const enhancedPrompt = `${style || 'professional blog header image'}, ${prompt}, ${category || 'general'} theme, high quality, detailed, modern design, 4k, sharp focus`;

        // Use Cloudflare Workers AI with Stable Diffusion XL
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: enhancedPrompt,
                    num_steps: 20,
                    guidance: 7.5,
                    width: 1024,
                    height: 576,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Cloudflare AI Error:', errorData);
            throw new Error(errorData.errors?.[0]?.message || 'Failed to generate image');
        }

        // Get the image as a buffer
        const imageBuffer = await response.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const imageUrl = `data:image/png;base64,${base64Image}`;

        res.json({ 
            imageUrl,
            prompt: enhancedPrompt,
            message: 'Image generated successfully'
        });

    } catch (error) {
        console.error('Image Generation Error:', error);
        res.status(500).json({ message: 'Failed to generate image', error: error.message });
    }
};

module.exports = generateImage;
