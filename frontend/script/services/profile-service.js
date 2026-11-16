import { authFetch } from '../auth.js'

// API Base URL
const apiURL = '/intproj26/line-yikrom3lkhmf3mmrxc2flibk/api/v1/students'

// Get student profile
export async function loadStudentProfile(studentId) {
  const url = `${apiURL}/${encodeURIComponent(studentId)}`

  const response = await authFetch(url)

  // Student is not in BSc.IT program
  if (response.status === 404) {
    const error = new Error('Student profile not found')
    error.status = 404

    throw error
  }

  // Other API errors
  if (response.status !== 200) {
    const error = new Error(
      `Failed to load student profile: ${response.status}`
    )

    error.status = response.status

    throw error
  }

  // Convert JSON response to JavaScript object
  return await response.json()
}

export { loadStudentProfile }
