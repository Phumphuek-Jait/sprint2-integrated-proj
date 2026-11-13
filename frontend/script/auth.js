import Keycloak from './vendor/keycloak.js'
import { keycloakConfig } from './config.js'

const keycloak = new Keycloak(keycloakConfig)

export async function requireSignIn() {
  await keycloak.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false
  })
  const token = keycloak.tokenParsed

  if (!token) {
    throw new Error('Keycloak did not return user information.')
  }

  const username = token.preferred_username?.trim() || token.email?.trim() || ''
  const firstName = token.given_name?.trim() || ''
  const lastName = token.family_name?.trim() || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const name = token.name?.trim() || fullName || username || 'User'

  return {
    username,
    name,
    roles: token.realm_access?.roles ?? []
  }
}

export function signOut() {
  return keycloak.logout({ redirectUri: new URL('./', location.href).href })
}

export async function authFetch(url, options = {}) {
  await keycloak.updateToken(30)
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${keycloak.token}`)
  return fetch(url, { ...options, headers })
}
