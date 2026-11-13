import { requireSignIn, signOut } from './auth.js'

const userNameElement = document.getElementById('user-display-name')
const userSection = document.querySelector('[data-testid="user-name"]')
const signOutButton = document.getElementById('sign-out-button')
const authStatus = document.getElementById('auth-status')

async function initPage() {
  if (!userNameElement || !userSection || !signOutButton || !authStatus) {
    console.error(
      'My Schedule authentication elements are missing from the page.'
    )
    return
  }

  signOutButton.disabled = true
  authStatus.textContent = 'Checking your sign-in with KMUTT account...'
  authStatus.hidden = false

  try {
    // Anonymous visitors are redirected to Keycloak. Successful sign-in uses PKCE S256.
    const user = await requireSignIn()

    userNameElement.textContent = user.name || user.username
    userSection.hidden = false
    authStatus.hidden = true
    signOutButton.disabled = false

    signOutButton.addEventListener('click', async () => {
      signOutButton.disabled = true
      try {
        await signOut()
      } catch (error) {
        console.error('Unable to sign out from Keycloak:', error)
        authStatus.textContent = 'Unable to sign out. Please try again.'
        authStatus.hidden = false
        signOutButton.disabled = false
      }
    })
  } catch (error) {
    console.error('My Schedule sign-in failed:', error)
    authStatus.textContent =
      'Unable to sign in. Please reload the page or contact the administrator.'
    authStatus.hidden = false
    userSection.hidden = true
  }
}

initPage()
