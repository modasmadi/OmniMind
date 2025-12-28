class OmniMind {
    constructor() {
        this.selectedModel = 'auto';
        this.queryCount = 0;
        this.apiUrl = 'http://localhost:3000/api/query';
        this.statusUrl = 'http://localhost:3000/api/status';
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        await this.checkStatus();
        this.updateActiveModel();
    }
    
    bindEvents() {
        // اختيار النموذج
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectModel(e.target.closest('.model-btn'));
            });
        });
        
        // إرسال الرسالة
        const sendButton = document.getElementById('sendButton');
        const userInput = document.getElementById('userInput');
        
        sendButton.addEventListener('click', () => this.sendMessage());
        
        userInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    selectModel(button) {
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        this.selectedModel = button.dataset.model;
        this.updateActiveModel();
    }
    
    async sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // إضافة رسالة المستخدم
        this.addMessage('user', message);
        input.value = '';
        
        // إظهار مؤشر التحميل
        const loadingId = this.showLoading();
        
        try {
            const response = await this.queryAPI(message);
            
            // إخفاء مؤشر التحميل
            this.hideLoading(loadingId);
            
            // إضافة رد الذكاء الاصطناعي
            this.addMessage('ai', response.response, response.model);
            
            // تحديث العداد
            this.queryCount++;
            document.getElementById('queryCount').textContent = this.queryCount;
            
        } catch (error) {
            this.hideLoading(loadingId);
            this.addMessage('ai', `عذراً، حدث خطأ: ${error.message}`, 'system');
        }
    }
    
    async queryAPI(prompt) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                model: this.selectedModel
            })
        });
        
        if (!response.ok) {
            throw new Error(`خطأ في الخادم: ${response.status}`);
        }
        
        return await response.json();
    }
    
    addMessage(type, content, model = null) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const timestamp = new Date().toLocaleTimeString('ar-EG');
        const modelName = model ? ` (${model})` : '';
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span>${type === 'user' ? '👤 أنت' : `🤖 Omni-Mind${modelName}`}</span>
                <span>${timestamp}</span>
            </div>
            <div class="message-content">${content}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    showLoading() {
        const chatMessages = document.getElementById('chatMessages');
        const loadingDiv = document.createElement('div');
        const loadingId = 'loading-' + Date.now();
        loadingDiv.id = loadingId;
        loadingDiv.className = 'message ai-message';
        loadingDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-spinner fa-spin"></i> جاري التفكير...
            </div>
        `;
        
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return loadingId;
    }
    
    hideLoading(loadingId) {
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    async checkStatus() {
        try {
            const response = await fetch(this.statusUrl);
            const data = await response.json();
            
            data.models.forEach(model => {
                const statusElement = document.getElementById(`${model.name.toLowerCase()}Status`);
                if (statusElement) {
                    statusElement.textContent = model.configured ? 'مفعل' : 'غير مفعل';
                    statusElement.style.color = model.configured ? '#28a745' : '#dc3545';
                }
            });
        } catch (error) {
            console.error('Error checking status:', error);
        }
    }
    
    updateActiveModel() {
        const modelNames = {
            'auto': 'التوجيه الذكي',
            'deepseek': 'DeepSeek',
            'gemini': 'Gemini',
            'claude': 'Claude',
            'chatgpt': 'ChatGPT'
        };
        
        const activeModelElement = document.getElementById('activeModel');
        if (activeModelElement) {
            activeModelElement.textContent = modelNames[this.selectedModel];
        }
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.omniMind = new OmniMind();
});