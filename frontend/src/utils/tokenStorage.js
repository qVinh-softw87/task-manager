const TOKEN_KEY = "token";

// get current token from localStorage
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}


// store token in localStorage with key (TOKEN_KEY) value: token
export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

// remove token when logout
export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}