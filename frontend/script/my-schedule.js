import { requireSignIn, signOut } from './auth.js'

import { loadStudentProfile } from './services/profile-service.js'

// HTML Elements
const userAccount = document.getElementById('user-account')
const userDisplayName = document.getElementById('user-display-name')
const signOutButton = document.getElementById('sign-out-button')

const studentProfile = document.getElementById('student-profile')
const notStudentMessage = document.getElementById('not-student-message')
const lecturerMessage = document.getElementById('lecturer-message')

const errorModal = document.getElementById('error-modal')

// Prevent closing error dialog with Escape
errorModal.addEventListener('cancel', (event) => {
  event.preventDefault()
})

// Show error dialog
function showErrorModal() {
  if (!errorModal.open) {
    errorModal.showModal()
  }
}

// Display user information
function displayUser(user) {
  userDisplayName.textContent = user.name ?? ''

  userAccount.hidden = false
}

// Handle Sign Out
signOutButton.addEventListener('click', () => {
  signOut()
})

// Display student profile
async function displayStudentProfile(studentId) {
  try {
    const profile = await loadStudentProfile(studentId)

    studentProfile.textContent = `Year ${profile.yearLevel} · Group ${profile.studentGroup}`

    studentProfile.hidden = false
  } catch (error) {
    console.error(error)

    // Student ID does not belong to BSc.IT
    if (error.status === 404) {
      notStudentMessage.hidden = false

      return
    }

    // Other errors
    showErrorModal()
  }
}

// Initialize My Schedule page
async function initPage() {
  try {
    // Require Keycloak Sign In
    const user = await requireSignIn()

    // Display full name
    displayUser(user)

    // Get user's roles
    const roles = Array.isArray(user.roles) ? user.roles : []

    // Check Lecturer Role
    if (roles.includes('lecturer')) {
      lecturerMessage.hidden = false

      return
    }

    // Check Student Role
    if (!roles.includes('student')) {
      notStudentMessage.hidden = false

      return
    }

    // Get Student Profile using Keycloak username
    await displayStudentProfile(user.username)
  } catch (error) {
    console.error('My Schedule initialization failed:', error)

    showErrorModal()
  }
}

// Start application
initPage()
