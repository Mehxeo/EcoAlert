async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    const chatMessages = document.getElementById('chat-messages');
    const thinkingIndicator = document.getElementById('thinking-indicator');
    
    if (message) {
        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';
        
        // Show thinking indicator
        thinkingIndicator.classList.remove('hidden');
        chatMessages.appendChild(thinkingIndicator);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });
            
            const data = await response.json();
            
            // Hide thinking indicator
            thinkingIndicator.classList.add('hidden');
            
            // Add AI response to chat
            addMessage(data.response, 'ai');
        } catch (error) {
            console.error('Error:', error);
            // Hide thinking indicator
            thinkingIndicator.classList.add('hidden');
            addMessage('Sorry, there was an error processing your request.', 'ai');
        }
    }
}

function addMessage(text, type) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const messageText = document.createElement('p');
    messageText.textContent = text;
    messageDiv.appendChild(messageText);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
} 