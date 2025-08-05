// Renderer process JavaScript
console.log('Renderer process started');

// Add some interactive functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded successfully');
    
    // Add click event to the card for demonstration
    const card = document.querySelector('.card');
    if (card) {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = 'translateY(-5px)';
            }, 150);
        });
    }
    
    // Add some dynamic content
    const statusText = document.querySelector('.status span:last-child');
    if (statusText) {
        const messages = [
            'App is running',
            'Electron is working',
            'Ready for integration',
            'Hello World!'
        ];
        
        let currentIndex = 0;
        setInterval(() => {
            statusText.textContent = messages[currentIndex];
            currentIndex = (currentIndex + 1) % messages.length;
        }, 3000);
    }
}); 