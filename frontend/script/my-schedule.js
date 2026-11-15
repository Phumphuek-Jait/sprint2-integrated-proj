import { requireSignIn, signOut } from './auth.js'

const userSection = document.getElementById('user-info')
const userNameElement = document.getElementById('user-display-name')
const signOutButton = document.getElementById('sign-out-button')
const userNameError = document.getElementById('user-name-error')

function getDisplayName(user) {
  const name = typeof user?.name === 'string' ? user.name.trim() : ''
  const username =
    typeof user?.username === 'string' ? user.username.trim() : ''

  return name || username || 'User'
}

async function initPage() {
  if (!userSection || !userNameElement || !signOutButton || !userNameError) {
    console.error('My Schedule user-name elements are missing from the page.')
    return
  }

  userSection.hidden = true
  signOutButton.disabled = true
  userNameError.hidden = true

  try {
    const user = await requireSignIn()
    userNameElement.textContent = getDisplayName(user)
    userSection.hidden = false
    signOutButton.disabled = false

    signOutButton.addEventListener('click', async () => {
      signOutButton.disabled = true
      try {
        await signOut()
      } catch (error) {
        console.error('Unable to sign out from Keycloak:', error)
        userNameError.textContent = 'Unable to sign out. Please try again.'
        userNameError.hidden = false
        signOutButton.disabled = false
      }
    })
  } catch (error) {
    console.error('Unable to retrieve the signed-in user:', error)
    userNameError.textContent =
      'Unable to load your user name. Please reload the page or contact the administrator.'
    userNameError.hidden = false
  }
}

initPage()
