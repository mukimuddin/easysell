/**
 * Tab-scoped session markers. sessionStorage is cleared when the tab/window
 * closes, so a surviving httpOnly cookie alone cannot reopen the panel in a new tab.
 */

export const ADMIN_TAB_SESSION_KEY = 'ytm_admin_tab_session';
export const BUYER_TAB_SESSION_KEY = 'ytm_buyer_tab_session';

export function markAdminTabSession() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(ADMIN_TAB_SESSION_KEY, String(Date.now()));
  }
}

export function markBuyerTabSession() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(BUYER_TAB_SESSION_KEY, String(Date.now()));
  }
}

export function clearAdminTabSession() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(ADMIN_TAB_SESSION_KEY);
  }
}

export function clearBuyerTabSession() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(BUYER_TAB_SESSION_KEY);
  }
}
