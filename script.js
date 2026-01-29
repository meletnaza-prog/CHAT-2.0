// AI Chat Application JavaScript
class AIChatApp {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.isTyping = false;
        
        // ** (NEW) Flowise API Endpoint **
this.flowiseEndpoint = "https://cloud.flowiseai.com/api/v1/prediction/3a44ea4c-5cc3-4496-bbd9-3d3eef81eec8";
        this.initializeEventListeners();
        this.setupAutoResize();
        this.loadChatHistory();
    }

    initializeEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key (Shift+Enter for new line)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.updateSendButtonState();
        });
        
        // Chat item selection
        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectChatItem(e.currentTarget);
            });
        });
        
        // Voice input button
        document.querySelector('.voice-btn').addEventListener('click', () => {
            this.toggleVoiceInput();
        });
        
        // Attachment button
        document.querySelector('.attachment-btn').addEventListener('click', () => {
            this.handleAttachment();
        });
        
        // New chat button
        document.querySelector('.btn-primary').addEventListener('click', () => {
            this.startNewChat();
        });
        
        // Clear history button
        document.querySelector('.btn-outline').addEventListener('click', () => {
            this.clearChatHistory();
        });
    }

    setupAutoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    updateSendButtonState() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText || this.isTyping;
        
        if (hasText && !this.isTyping) {
            this.sendButton.style.opacity = '1';
        } else {
            this.sendButton.style.opacity = '0.5';
        }
    }

    // ** (NEW) Function to communicate with the Flowise API **
    async queryFlowise(question) {
        // Use getCurrentChatId() as sessionId to maintain conversation history
        const sessionId = this.getCurrentChatId(); 

        const data = {
            question: question,
            // Flowise uses overrideConfig to pass the sessionId
            overrideConfig: {
                sessionId: sessionId
            }
        };

        try {
            const response = await fetch(
                this.flowiseEndpoint,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

            if (!response.ok) {
                // If response is not 200 (OK), throw an error
                throw new Error(`Flowise API returned status ${response.status}`);
            }

            const result = await response.json();
            
            // Flowise returns the response text in the 'text' property
            return result.text || "No valid response was received from the bot.";

        } catch (error) {
            console.error("Error communicating with Flowise:", error);
            // Return a user-friendly error message
            return "Sorry, there was a problem connecting with the AI assistant. Please try again.";
        }
    }

    // ** (MODIFIED) Main message sending logic **
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        // 1. Add the user message to the chat
        this.addMessage(message, 'user');
        
        // 2. Clear input and update state
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.updateSendButtonState();
        
        // 3. Show loading indicator
        this.showLoading();
        
        // 4. Call the Flowise API
        try {
            const aiResponse = await this.queryFlowise(message);
            
            // 5. Hide loading and display the bot response
            this.hideLoading();
            this.addMessage(aiResponse, 'ai');
            
        } catch (error) {
            // Handle API failure errors
            this.hideLoading();
            console.error("Error sending or receiving from Flowise:", error);
            // Display an appropriate error message
            this.addMessage(error.message.includes('status') ? "Connection error with Flowise." : error.message, 'ai');
        }
    }

    addMessage(content, sender, timestamp = null) {
        const messageGroup = document.createElement('div');
        messageGroup.className = 'message-group';
        
        const message = document.createElement('div');
        message.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.innerHTML = this.formatMessage(content);
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = timestamp || this.getCurrentTime();
        
        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);
        
        if (sender === 'ai') {
            message.appendChild(avatar);
            message.appendChild(messageContent);
        } else {
            message.appendChild(messageContent);
            message.appendChild(avatar);
        }
        
        messageGroup.appendChild(message);
        this.chatMessages.appendChild(messageGroup);
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Save to chat history
        this.saveToHistory(content, sender, messageTime.textContent);
    }

    formatMessage(content) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        content = content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Convert line breaks to <br>
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }

    // *** REMOVED: generateAIResponse() and getAIResponses() are no longer needed ***

    showLoading() {
        this.isTyping = true;
        this.loadingOverlay.classList.add('show');
        this.updateSendButtonState();
    }

    hideLoading() {
        this.isTyping = false;
        this.loadingOverlay.classList.remove('show');
        this.updateSendButtonState();
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    selectChatItem(item) {
        // Remove active class from all items
        document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
        
        // Add active class to selected item
        item.classList.add('active');
        
        // Update chat title
        const chatTitle = item.querySelector('h4').textContent;
        document.querySelector('.chat-title h2').textContent = chatTitle;
        
        // Load chat history for this conversation
        this.loadChatForItem(item);
    }

    loadChatForItem(item) {
        // Clear current messages
        this.chatMessages.innerHTML = '';
        
        // Load messages for this chat
        const chatId = this.getCurrentChatId();
        const history = this.getChatHistory();
        const chatMessages = history[chatId];

        if (chatMessages && chatMessages.length > 0) {
            chatMessages.forEach(msg => {
                this.addMessage(msg.content, msg.sender, msg.timestamp);
            });
        } else {
            // Welcome message if the chat is empty
            this.addMessage(`Hello! I'm your ${chatId} powered by Flowise. How can I help you today?`, 'ai', this.getCurrentTime());
        }
        
        this.scrollToBottom();
    }

    startNewChat() {
        // ... (rest of startNewChat code remains the same)
        const chatList = document.querySelector('.chat-list');
        const newChatItem = document.createElement('div');
        newChatItem.className = 'chat-item';
        
        const timestamp = this.getCurrentTime();
        // Added a unique ID suffix to the chat title for better history tracking
        newChatItem.innerHTML = `
            <div class="chat-icon">
                <i class="fas fa-comments"></i>
            </div>
            <div class="chat-info">
                <h4>New Chat ${Date.now().toString().slice(-4)}</h4> 
                <p>Start a new conversation</p>
            </div>
            <div class="chat-time">${timestamp}</div>
        `;
        
        // Add click listener
        newChatItem.addEventListener('click', () => this.selectChatItem(newChatItem));
        
        // Insert at top
        chatList.insertBefore(newChatItem, chatList.firstChild);
        
        // Select the new chat
        this.selectChatItem(newChatItem);
        
        // Clear input
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.updateSendButtonState();
    }

    clearChatHistory() {
        if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
            // Clear chat list
            const chatList = document.querySelector('.chat-list');
            chatList.innerHTML = '';
            
            // Clear current messages
            this.chatMessages.innerHTML = '';
            
            // Reset to default chat
            this.startNewChat();
            
            // Clear localStorage
            localStorage.removeItem('aiChatHistory');
        }
    }

    toggleVoiceInput() {
        // Voice input functionality (simplified)
        const voiceBtn = document.querySelector('.voice-btn');
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US'; 
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.messageInput.value = transcript;
                this.autoResizeTextarea();
                this.updateSendButtonState();
            };
            
            recognition.onend = () => {
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            };

            // Event listener handling for starting/stopping
            if (!voiceBtn.hasClickListener) {
                voiceBtn.addEventListener('click', () => {
                    if (voiceBtn.classList.contains('recording')) {
                        recognition.stop();
                        voiceBtn.classList.remove('recording');
                        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                    } else {
                        recognition.start();
                        voiceBtn.classList.add('recording');
                        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
                    }
                });
                voiceBtn.hasClickListener = true;
            }
            
        } else {
            alert('Voice input is not supported in your browser.');
        }
    }

    handleAttachment() {
        // File attachment functionality (simplified)
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf,.txt,.doc,.docx';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // In a real app, you would upload the file and get a URL
                this.addMessage(`📎 Attached: ${file.name}`, 'user');
                // Inform the user about file handling
                this.addMessage(`I received "${file.name}". If your Flowise chatflow is configured to handle files, I will process the question in the next step.`, 'ai');
            }
        };
        
        input.click();
    }

    saveToHistory(content, sender, timestamp) {
        const history = this.getChatHistory();
        const currentChat = this.getCurrentChatId();
        
        if (!history[currentChat]) {
            history[currentChat] = [];
        }
        
        history[currentChat].push({
            content,
            sender,
            timestamp,
            id: Date.now()
        });
        
        localStorage.setItem('aiChatHistory', JSON.stringify(history));
    }

    loadChatHistory() {
        const history = this.getChatHistory();
        // Load the default active chat on startup
        const defaultChat = document.querySelector('.chat-item.active');
        if (defaultChat) {
             this.loadChatForItem(defaultChat);
        } else {
            // If no active chat, start a new one
            this.startNewChat();
        }
    }

    getChatHistory() {
        const history = localStorage.getItem('aiChatHistory');
        return history ? JSON.parse(history) : {};
    }

    getCurrentChatId() {
        const activeChat = document.querySelector('.chat-item.active');
        // Use the chat title as the session identifier
        return activeChat ? activeChat.querySelector('h4').textContent : 'default';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIChatApp();
});

// Add some utility functions
window.AIChatUtils = {
    // Export chat history
    exportChat: () => {
        const history = JSON.parse(localStorage.getItem('aiChatHistory') || '{}');
        const dataStr = JSON.stringify(history, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ai-chat-history.json';
        link.click();
        URL.revokeObjectURL(url);
    },
    
    // Import chat history
    importChat: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const history = JSON.parse(e.target.result);
                        localStorage.setItem('aiChatHistory', JSON.stringify(history));
                        location.reload();
                    } catch (error) {
                        alert('Invalid chat history file.');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
};
