const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
});

function initializeLoginForm() {
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (await validateLoginForm()) {
            loginUser(); 
        }
    });

    document.getElementById('loginEmail').addEventListener('input', validateLoginEmail);
    document.getElementById('loginPassword').addEventListener('input', validateLoginPassword);
}

function validateLoginEmail() {
    const email = document.getElementById('loginEmail').value;
    const errorElement = document.getElementById('loginEmailError');
    
    if (!email) {
        showError(errorElement, 'Email или никнейм обязателен');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateLoginPassword() {
    const password = document.getElementById('loginPassword').value;
    const errorElement = document.getElementById('loginPasswordError');
    
    if (!password) {
        showError(errorElement, 'Пароль обязателен');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

async function validateLoginForm() {
    const isValid = validateLoginEmail() && validateLoginPassword();
    document.getElementById('loginButton').disabled = !isValid;
    return isValid;
}

async function loginUser() {
    const login = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const responseEmail = await fetch(`${API_URL}/users?email=${encodeURIComponent(login)}`);
        const responseNickname = await fetch(`${API_URL}/users?nickname=${encodeURIComponent(login)}`);
        
        const usersByEmail = await responseEmail.json();
        const usersByNickname = await responseNickname.json();

        const users = [...usersByEmail, ...usersByNickname];
        
        if (users.length === 0) {
            showError(document.getElementById('loginEmailError'), 'Пользователь не найден');
            return;
        }
        
        const user = users[0];
        
        if (user.password !== password) {
            showError(document.getElementById('loginPasswordError'), 'Неверный пароль');
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
        alert('Вход выполнен успешно!');
        window.location.href = 'home.html';
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        alert('Произошла ошибка при входе. Попробуйте еще раз.');
    }
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function hideError(element) {
    element.textContent = '';
    element.style.display = 'none';
}