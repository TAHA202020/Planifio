export function isAuthenticated() {
    // check for access_token in cookies
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];
    if (token) {
        return true;
    }
    return false;
}