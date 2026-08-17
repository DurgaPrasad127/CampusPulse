export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('campuspulse_user') || 'null'); }
  catch { return null; }
};
export const saveSession = (token, user) => {
  localStorage.setItem('campuspulse_token', token);
  localStorage.setItem('campuspulse_user', JSON.stringify(user));
};
export const clearSession = () => {
  localStorage.removeItem('campuspulse_token');
  localStorage.removeItem('campuspulse_user');
};
