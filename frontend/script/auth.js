import Keycloak from './vendor/keycloak.js'
import { keycloakConfig } from './config.js'

const keycloak = new Keycloak(keycloakConfig)

// Initialize Keycloak only once
let initializationPromise = null

/**
 * Initialize Keycloak
 */
function initializeKeycloak() {
  if (!initializationPromise) {
    initializationPromise = keycloak
      .init({
        onLoad: 'login-required',
        pkceMethod: 'S256',
        checkLoginIframe: false
      })
      .catch((error) => {
        initializationPromise = null
        throw error
      })
  }

  return initializationPromise
}

/**
 * Require user sign in and return user information
 */
export async function requireSignIn() {
  const authenticated = await initializeKeycloak()

  if (!authenticated || !keycloak.authenticated || !keycloak.tokenParsed) {
    throw new Error('Keycloak did not return an authenticated user.')
  }

  const token = keycloak.tokenParsed

  const username = token.preferred_username?.trim() || token.email?.trim() || ''

  const firstName = token.given_name?.trim() || ''
  const lastName = token.family_name?.trim() || ''

  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  const name = token.name?.trim() || fullName || username || 'User'

  const roles = token.realm_access?.roles ?? []

  return {
    username,
    name,
    roles
  }
}

/**
 * Sign out from Keycloak
 */
export function signOut() {
  return keycloak.logout({
    redirectUri: new URL('./', window.location.href).href
  })
}

/**
 * Fetch API with Keycloak access token
 */
export async function authFetch(url, options = {}) {
  await initializeKeycloak()

  if (!keycloak.authenticated) {
    throw new Error('A signed-in user is required to make this request.')
  }

  await keycloak.updateToken(30)

  const headers = new Headers(options.headers)

  headers.set('Authorization', `Bearer ${keycloak.token}`)

  return fetch(url, {
    ...options,
    headers
  })
}
