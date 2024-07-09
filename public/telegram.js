// public/telegram.js
function sendTelegramUserToServer() {
    if (window.Telegram && window.Telegram.WebApp) {
        console.log('Telegram is loaded')
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        if (user) {
            fetch('/api/telegram-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
        }
    } else {
        console.log('Telegram is not loaded')
    }
}

window.addEventListener('load', sendTelegramUserToServer);