// public/telegram.js
function sendTelegramUserToServer() {
    if (window.Telegram && window.Telegram.WebApp) {
        let user = window.Telegram.WebApp.initDataUnsafe.user;
        if (!user) {
            console.log('Telegram WebApp not available, using mock data');
            user = { id: 1, first_name: 'Test', last_name: 'User', username: 'test' };
        }
        fetch('/api/telegram-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
                console.log('Success:', data);
        })
        .catch(error => {
                console.error('Error:', error);
        });
    } else {
        console.log('Telegram file not included')
    }
}

window.addEventListener('load', sendTelegramUserToServer);