const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
});

function initializeLoginForm() {
    const form = document.getElementById('loginForm');
    
    if (!form) {
        console.error('Форма входа не найдена');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (await validateLoginForm()) {
            loginUser();
        }
    });

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (emailInput) emailInput.addEventListener('input', validateLoginEmail);
    if (passwordInput) passwordInput.addEventListener('input', validateLoginPassword);
}

function validateLoginEmail() {
    const emailInput = document.getElementById('loginEmail');
    const errorElement = document.getElementById('loginEmailError');
    
    if (!emailInput || !errorElement) return false;
    
    const email = emailInput.value;
    
    if (!email) {
        showError(errorElement, getTranslation('loginEmailRequired'));
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateLoginPassword() {
    const passwordInput = document.getElementById('loginPassword');
    const errorElement = document.getElementById('loginPasswordError');
    
    if (!passwordInput || !errorElement) return false;
    
    const password = passwordInput.value;
    
    if (!password) {
        showError(errorElement, getTranslation('passwordRequired'));
        return false;
    }
    
    hideError(errorElement);
    return true;
}

async function validateLoginForm() {
    const isValid = validateLoginEmail() && validateLoginPassword();
    const loginButton = document.getElementById('loginButton');
    
    if (loginButton) {
        loginButton.disabled = !isValid;
    }
    
    return isValid;
}

async function loginUser() {
    const login = document.getElementById('loginEmail')?.value || '';
    const password = document.getElementById('loginPassword')?.value || '';
    
    try {
        const responseEmail = await fetch(`${API_URL}/users?email=${encodeURIComponent(login)}`);
        const responseNickname = await fetch(`${API_URL}/users?nickname=${encodeURIComponent(login)}`);
        
        const usersByEmail = await responseEmail.json();
        const usersByNickname = await responseNickname.json();

        const users = [...usersByEmail, ...usersByNickname];
        
        if (users.length === 0) {
            showError(document.getElementById('loginEmailError'), getTranslation('userNotFound'));
            return;
        }
        
        const user = users[0];
        
        if (user.password !== password) {
            showError(document.getElementById('loginPasswordError'), getTranslation('invalidPassword'));
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        }));
        
        if (typeof updateHeaderAuthState === 'function') {
            updateHeaderAuthState();
        }
        
        alert(getTranslation('loginSuccess'));
        window.location.href = 'home.html';
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        alert(getTranslation('loginError'));
    }
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideError(element) {
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
    }
}

function updateLoginTranslation(lang) {
    const emailInput = document.getElementById('loginEmail');
    if (emailInput) {
        emailInput.placeholder = getTranslation('loginEmailPlaceholder');
    }

    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.disabled = !validateLoginForm();
    }
}