const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// تعريف النماذج ووظائف الاتصال بها

const models = {
    deepseek: {
        name: 'DeepSeek',
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        getHeaders: () => ({
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
        }),
        body: (prompt) => ({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000
        })
    },
    gemini: {
        name: 'Gemini',
        endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        getHeaders: () => ({
            'Content-Type': 'application/json'
        }),
        body: (prompt) => ({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    },
    claude: {
        name: 'Claude',
        endpoint: 'https://api.anthropic.com/v1/messages',
        getHeaders: () => ({
            'x-api-key': process.env.CLAUDE_API_KEY,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        }),
        body: (prompt) => ({
            model: 'claude-3-opus-20240229',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }]
        })
    },
    chatgpt: {
        name: 'ChatGPT',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        getHeaders: () => ({
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }),
        body: (prompt) => ({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000
        })
    }
};

// وظيفة للاتصال بأي نموذج
async function queryModel(model, prompt) {
    try {
        const response = await axios.post(model.endpoint, model.body(prompt), {
            headers: model.getHeaders()
        });
        return response.data;
    } catch (error) {
        console.error(`Error querying ${model.name}:`, error.response?.data || error.message);
        throw error;
    }
}

// معالج للردود المختلفة
function parseResponse(modelName, data) {
    switch (modelName) {
        case 'DeepSeek':
            return data.choices[0].message.content;
        case 'Gemini':
            return data.candidates[0].content.parts[0].text;
        case 'Claude':
            return data.content[0].text;
        case 'ChatGPT':
            return data.choices[0].message.content;
        default:
            return data;
    }
}

// نظام التوجيه الذكي
function intelligentRouter(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // إذا كان السؤال عن البرمجة
    if (lowerPrompt.includes('كود') || lowerPrompt.includes('برمجة') || 
        lowerPrompt.includes('code') || lowerPrompt.includes('programming')) {
        return 'deepseek';
    }
    // إذا كان سؤالاً إبداعياً
    else if (lowerPrompt.includes('قصة') || lowerPrompt.includes('رواية') || 
             lowerPrompt.includes('كتابة') || lowerPrompt.includes('creative')) {
        return 'claude';
    }
    // إذا كان سؤالاً بحثياً
    else if (lowerPrompt.includes('بحث') || lowerPrompt.includes('معلومات') || 
             lowerPrompt.includes('بحث') || lowerPrompt.includes('research')) {
        return 'gemini';
    }
    // في الحالات الأخرى نستخدم ChatGPT
    else {
        return 'chatgpt';
    }
}

// نقطة النهاية للاستعلام
app.post('/api/query', async (req, res) => {
    const { prompt, model } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        let selectedModel = model;
        
        // إذا لم يتم تحديد نموذج، نستخدم التوجيه الذكي
        if (!selectedModel || selectedModel === 'auto') {
            selectedModel = intelligentRouter(prompt);
        }

        const modelConfig = models[selectedModel];
        if (!modelConfig) {
            return res.status(400).json({ error: 'Invalid model specified' });
        }

        const responseData = await queryModel(modelConfig, prompt);
        const responseText = parseResponse(modelConfig.name, responseData);

        res.json({
            model: modelConfig.name,
            response: responseText
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// نقطة النهاية للحصول على حالة الخادم
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        models: Object.keys(models).map(key => ({
            name: models[key].name,
            configured: process.env[`${key.toUpperCase()}_API_KEY`] ? true : false
        }))
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});