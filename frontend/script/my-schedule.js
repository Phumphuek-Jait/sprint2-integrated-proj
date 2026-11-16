import { requireSignIn, signOut } from './auth.js'
import { loadStudentProfile } from './services/profile-service.js'

// HTML Elements
const userSection = document.getElementById('user-info')
const userNameElement = document.getElementById('user-display-name')
const signOutButton = document.getElementById('sign-out-button')

const authStatus = document.getElementById('auth-status')
const studentProfile = document.getElementById('student-profile')
const notStudentMessage = document.getElementById('not-student')
const lecturerMessage = document.getElementById('lecturer-message')
const errorModal = document.getElementById('error-modal')

// Get a safe display name
function getDisplayName(user) {
  const name = typeof user?.name === 'string' ? user.name.trim() : ''

  const username =
    typeof user?.username === 'string' ? user.username.trim() : ''

  return name || username || 'User'
}

// Show error dialog
function showErrorModal() {
  if (errorModal && !errorModal.open) {
    errorModal.showModal()
  }
}

// Initialize My Schedule page
async function initPage() {
  // Check required HTML elements
  if (
    !userSection ||
    !userNameElement ||
    !signOutButton ||
    !authStatus ||
    !studentProfile ||
    !notStudentMessage ||
    !lecturerMessage ||
    !errorModal
  ) {
    console.error('My Schedule HTML elements are missing.')
    return
  }

  // Initial state
  userSection.hidden = true
  signOutButton.disabled = true
  authStatus.hidden = false

  studentProfile.hidden = true
  notStudentMessage.hidden = true
  lecturerMessage.hidden = true

  // Keep error dialog open when pressing Escape
  errorModal.addEventListener('cancel', (event) => {
    event.preventDefault()
  })

  // Sign Out
  signOutButton.addEventListener('click', async () => {
    signOutButton.disabled = true

    try {
      await signOut()
    } catch (error) {
      console.error('Unable to sign out:', error)

      authStatus.textContent = 'Unable to sign out. Please try again.'

      authStatus.hidden = false
      signOutButton.disabled = false
    }
  })

  try {
    // 1. Authenticate user with Keycloak
    const user = await requireSignIn()

    // 2. Display full name
    userNameElement.textContent = getDisplayName(user)

    userSection.hidden = false
    signOutButton.disabled = false
    authStatus.hidden = true

    // 3. Get user roles
    const roles = Array.isArray(user.roles)
      ? user.roles.map((role) =>
          typeof role === 'string' ? role.toLowerCase() : ''
        )
      : []

    // 4. Check Lecturer role
    if (roles.includes('lecturer')) {
      lecturerMessage.hidden = false

      // Do not request student profile or schedules
      return
    }

    // 5. Check Student role
    if (!roles.includes('student')) {
      notStudentMessage.hidden = false

      return
    }

    // 6. Load Student Profile
    try {
      const profile = await loadStudentProfile(user.username)

      // 7. Display Year and Group from Backend
      studentProfile.textContent = `Year ${profile.yearLevel} · Group ${profile.studentGroup}`

      studentProfile.hidden = false
    } catch (error) {
      console.error('Unable to load student profile:', error)

      // Student is not in BSc.IT program
      if (error.status === 404) {
        notStudentMessage.hidden = false

        return
      }

      // Other API errors
      showErrorModal()
    }
  } catch (error) {
    console.error("My Schedule sign-in failed:", error);

    authStatus.textContent =
      "Unable to sign in. Please reload the page or contact the administrator.";

    authStatus.hidden = false;
    userSection.hidden = true;
    signOutButton.disabled = true;
  }
}

initPage();

async function loadMySchedule(studentId) {
  const notStudentEl = document.getElementById("not-student-message");
  const myScheduleSection = document.getElementById("my-schedule-section");
  const courseOptionSection = document.getElementById("course-options-section");
  const modal = document.getElementById("error-modal");

  modal.addEventListener("cancel", (event) => {
    event.preventDefault();
  });

  try {
    const student = await getStudentProfile(studentId);

    if (!student || student.notFound) {
      notStudentEl.hidden = false;
      myScheduleSection.hidden = true;
      courseOptionSection.hidden = true;
      return;
    }

    const studentProfile = document.getElementById("student-profile");
    studentProfile.textContent =
      `Year ${student.yearLevel} · Group ${student.studentGroup}`;

    userSection.hidden = true
    signOutButton.disabled = true
  }
}

// Start application
initPage()
