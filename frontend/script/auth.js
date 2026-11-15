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
let initializationPromise

/**
 * Initialize Keycloak once for this page. The S256 PKCE challenge method is
 * used for the authorization-code flow; login-required redirects anonymous
 * visitors to the Keycloak sign-in page and returns them to this page.
 */
function initializeKeycloak() {
  if (!initializationPromise) {
    initializationPromise = keycloak.init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false
    })
  }

  return initializationPromise
}

export async function requireSignIn() {
  const authenticated = await initializeKeycloak()

  if (!authenticated || !keycloak.authenticated || !keycloak.tokenParsed) {
    throw new Error('Keycloak did not return an authenticated user.')
  }

  const token = keycloak.tokenParsed

  return {
    username: token.preferred_username || token.email || '',
    name: token.name || token.preferred_username || token.email || 'User',
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
  // Return the user to the application root after Keycloak logout.
  const redirectUri = new URL('./', window.location.href).href
  return keycloak.logout({ redirectUri })
}

export async function authFetch(url, options = {}) {
  await initializeKeycloak()

  if (keycloak.authenticated) {
    await keycloak.updateToken(30)
  } else {
    throw new Error('A signed-in user is required to make this request.')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${keycloak.token}`)

  return fetch(url, { ...options, headers })
}
