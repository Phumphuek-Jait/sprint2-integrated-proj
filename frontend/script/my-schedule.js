import { requireSignIn, signOut } from './auth.js'

const userNameElement = document.getElementById('user-display-name')
const userSection = document.getElementById('user-info')
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
    // Authenticate user with Keycloak
    const user = await requireSignIn()

    // Display the user's name
    userNameElement.textContent = user.name || user.username || 'User'

    // Show the entire user section
    userSection.hidden = false

    // Hide authentication status
    authStatus.hidden = true

    // Enable Sign Out button
    signOutButton.disabled = false

    // Handle Sign Out
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

    // Hide the entire user section if authentication fails
    userSection.hidden = true
    signOutButton.disabled = true
  }
}

initPage()
