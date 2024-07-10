let user;
let config

async function initApp() {
    user = await getUser();
    const response = await fetch('/config');
    config = await response.json();

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadPage(e.currentTarget.dataset.page || 'home');
        });
    });
    loadPage('home');
}

async function loadPage(pageName) {
    try {
        const response = await fetch(`/content/${pageName}`);
        const content = await response.text();

        // Parse the content
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        // Extract HTML content
        const htmlContent = doc.getElementById('page-content').innerHTML;
        document.getElementById('content').innerHTML = htmlContent;

        // Extract and execute JavaScript
        const scripts = doc.getElementsByTagName('script');
        console.log(scripts);
        if (scripts.length > 0) {
            const scriptContent = scripts[0].textContent;
            const scriptElement = document.createElement('script');
            scriptElement.textContent = scriptContent;
            document.body.appendChild(scriptElement);

            // Call the init function if it exists
            if (typeof init === 'function') {
                init(user, config, debounce(updateData, 900));
            }
        }
    } catch (error) {
        console.error('Error loading page:', error);
    }
}

function updateData(data) {
    // Send updated data to the server
    fetch(`/api/user/${data.id}/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).catch(error => {
        console.error('Error updating data:', error);
    });
};

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.addEventListener('load', initApp);