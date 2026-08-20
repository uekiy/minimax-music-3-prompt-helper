document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-json-btn');
    const tagBtns = document.querySelectorAll('.tag-btn');
    const lyricsArea = document.getElementById('lyrics');
    
    const apiProviderSelect = document.getElementById('api-provider');
    const apiKeyInput = document.getElementById('api-key');
    const rememberApiKeyInput = document.getElementById('remember-api-key');
    const clearApiKeysBtn = document.getElementById('clear-api-keys-btn');

    // Load saved provider and keys
    let savedProvider = localStorage.getItem('mm_music3_api_provider') || 'gemini';
    apiProviderSelect.value = savedProvider;
    
    const savedKeys = {
        gemini: localStorage.getItem('mm_music3_gemini_key') || '',
        openai: localStorage.getItem('mm_music3_openai_key') || '',
        anthropic: localStorage.getItem('mm_music3_anthropic_key') || ''
    };
    apiKeyInput.value = savedKeys[savedProvider];
    rememberApiKeyInput.checked = Boolean(savedKeys[savedProvider]);

    // Handle provider change
    apiProviderSelect.addEventListener('change', () => {
        // Save current key before switching
        savedKeys[savedProvider] = apiKeyInput.value.trim();
        if (rememberApiKeyInput.checked && savedKeys[savedProvider]) {
            localStorage.setItem(`mm_music3_${savedProvider}_key`, savedKeys[savedProvider]);
        } else if (!rememberApiKeyInput.checked) {
            localStorage.removeItem(`mm_music3_${savedProvider}_key`);
        }

        // Switch to new provider
        savedProvider = apiProviderSelect.value;
        localStorage.setItem('mm_music3_api_provider', savedProvider);
        apiKeyInput.value = savedKeys[savedProvider];
        rememberApiKeyInput.checked = Boolean(savedKeys[savedProvider]);
    });

    // Handle key input save
    apiKeyInput.addEventListener('change', () => {
        const key = apiKeyInput.value.trim();
        savedKeys[savedProvider] = key;
        if (rememberApiKeyInput.checked && key) {
            localStorage.setItem(`mm_music3_${savedProvider}_key`, key);
        } else {
            localStorage.removeItem(`mm_music3_${savedProvider}_key`);
        }
    });

    rememberApiKeyInput.addEventListener('change', () => {
        const key = apiKeyInput.value.trim();
        if (rememberApiKeyInput.checked && key) {
            savedKeys[savedProvider] = key;
            localStorage.setItem(`mm_music3_${savedProvider}_key`, key);
        } else if (!rememberApiKeyInput.checked) {
            localStorage.removeItem(`mm_music3_${savedProvider}_key`);
        }
    });

    clearApiKeysBtn.addEventListener('click', () => {
        Object.keys(savedKeys).forEach(provider => {
            savedKeys[provider] = '';
            localStorage.removeItem(`mm_music3_${provider}_key`);
        });
        apiKeyInput.value = '';
        rememberApiKeyInput.checked = false;
        clearApiKeysBtn.textContent = 'Saved API keys cleared';
        setTimeout(() => {
            clearApiKeysBtn.textContent = 'Clear saved API keys';
        }, 2000);
    });

    // Tag buttons interaction
    tagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tag = btn.getAttribute('data-tag');
            insertTextAtCursor(lyricsArea, tag + '\n');
        });
    });

    // Pastel pill buttons interaction
    document.querySelectorAll('.pill').forEach(btn => {
        btn.addEventListener('click', () => {
            const container = btn.closest('.pill-container');
            if (container) {
                const targetId = container.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                if (targetInput) {
                    let currentVal = targetInput.value.trim();
                    const tagText = btn.textContent;
                    if (currentVal.length > 0) {
                        if (!currentVal.includes(tagText)) {
                            targetInput.value = currentVal + ', ' + tagText;
                        }
                    } else {
                        targetInput.value = tagText;
                    }
                }
            }
        });
    });

    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl.value) {
                navigator.clipboard.writeText(targetEl.value)
                    .then(() => {
                        const originalText = btn.textContent;
                        btn.textContent = 'Copied!';
                        setTimeout(() => btn.textContent = originalText, 2000);
                    });
            }
        });
    });

    function insertTextAtCursor(el, text) {
        const val = el.value;
        const endIndex = el.selectionEnd;
        el.value = val.slice(0, endIndex) + text + val.slice(endIndex);
        el.selectionStart = el.selectionEnd = endIndex + text.length;
        el.focus();
    }

    generateBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Please enter your API key.');
            return;
        }
        
        savedKeys[savedProvider] = apiKey;
        if (rememberApiKeyInput.checked) {
            localStorage.setItem(`mm_music3_${savedProvider}_key`, apiKey);
        }

        const genre = document.getElementById('genre').value.trim();
        const mood = document.getElementById('mood').value.trim();
        const vocals = document.getElementById('vocals').value.trim();
        const lyrics = document.getElementById('lyrics').value.trim();

        if (!genre && !mood && !lyrics) {
            alert('Please enter at least some genre, mood, or lyrics.');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        try {
            const result = await callLLMAPI(savedProvider, apiKey, genre, mood, vocals, lyrics);
            
            try {
                // simple json extraction if wrapped in ```json
                let jsonStr = result;
                const match = jsonStr.match(/```json([\s\S]*?)```/);
                if (match) {
                    jsonStr = match[1];
                } else if (jsonStr.includes('```')) {
                    jsonStr = jsonStr.replace(/```[\s\S]*?\n/g, '').replace(/```/g, '');
                }
                
                const parsed = JSON.parse(jsonStr.trim());
                
                document.getElementById('out-caption').value = parsed.caption || result;
                document.getElementById('out-lyrics').value = parsed.lyrics || lyrics;
            } catch (e) {
                // Fallback
                document.getElementById('out-caption').value = result;
                document.getElementById('out-lyrics').value = lyrics;
            }

            downloadBtn.disabled = false;
        } catch (error) {
            alert('Error generating prompt: ' + error.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Prompt';
        }
    });

    downloadBtn.addEventListener('click', () => {
        const caption = document.getElementById('out-caption').value;
        const lyrics = document.getElementById('out-lyrics').value;
        
        const data = {
            caption: caption,
            lyrics: lyrics
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'minimax_music3_prompt.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    async function callLLMAPI(provider, apiKey, genre, mood, vocals, lyrics) {
        const systemInstruction = `You are the Music Caption Rewriter Skill for MiniMax Music 3.
Your task is to transform the user's musical intent into a highly structured caption, strictly adhering to the MiniMax Music 3 format.

The "caption" MUST be formatted exactly in these three sections:
Global Metadata: [Genre, subgenre, mood, tempo, tempo pacing, core instruments, production quality]
Vocal Details: [Vocal presence, gender, register, timbre, delivery, emotional tone. Write 'Instrumental' if no vocals]
Arrangement: [A section-by-section timeline of how the song develops, e.g., Intro (acoustic guitar), Verse (piano joins, calm), Chorus (full band, energetic)]

Output the result STRICTLY as a JSON object with two keys: 'caption' and 'lyrics'. Do not include markdown formatting like \`\`\`json.
Example format:
{
  "caption": "Global Metadata: ...\\nVocal Details: ...\\nArrangement: ...",
  "lyrics": "[intro]\\n[verse]"
}`;
        
        const userPrompt = `
User Intent:
- Genre/Style: ${genre || 'Unspecified'}
- Mood/Emotion: ${mood || 'Unspecified'}
- Vocal Details: ${vocals || 'Unspecified'}
- Lyrics/Tags: ${lyrics || 'None'}
`;

        if (provider === 'gemini') {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ parts: [{ text: userPrompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Gemini API request failed');
            }
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;

        } else if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: userPrompt }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'OpenAI API request failed');
            }
            const data = await response.json();
            return data.choices[0].message.content;

        } else if (provider === 'anthropic') {
            // Note: Anthropic API does not support CORS from browser typically without a proxy,
            // but we provide the logic in case it's used locally with a CORS workaround or proxy.
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-6",
                    system: systemInstruction,
                    messages: [{ role: "user", content: userPrompt }],
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Anthropic API request failed');
            }
            const data = await response.json();
            return data.content[0].text;
        }

        throw new Error('Unsupported provider');
    }
});
