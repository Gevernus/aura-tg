// public/telegram.js
async function getUser() {
    let user;
    if (window.Telegram && window.Telegram.WebApp) {
        user = window.Telegram.WebApp.initDataUnsafe.user;
        if (!user) {
            console.log('Telegram WebApp not available, using mock data');
            user = { id: 1, first_name: 'Test', last_name: 'User', username: 'test' };
        }
        try {
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.user;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    } else {
        console.log('Telegram file not included')
    }
    return user;
}