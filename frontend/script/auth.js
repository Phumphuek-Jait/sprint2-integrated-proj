import Keycloak from './vendor/keycloak.js';
import { keycloakConfig } from './config.js';

const keycloak = new Keycloak(keycloakConfig);

export async function requireSignIn() {
  await keycloak.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',          
    checkLoginIframe: false,     
  });
  const t = keycloak.tokenParsed;
  return {
    username: t.preferred_username,                
    name: t.name,
    roles: t.realm_access?.roles ?? [],            
  };
}

export function signOut() {
  return keycloak.logout({ redirectUri: new URL('./', location.href).href });
}

export async function authFetch(url, options = {}) {
  await keycloak.updateToken(30);
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${keycloak.token}`);
  return fetch(url, { ...options, headers });
}
