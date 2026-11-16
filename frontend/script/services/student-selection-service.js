import { authFetch } from '../auth.js'

// Student Selection API
const apiURL = '/intproj26/line-yikrom3lkhmf3mmrxc2flibk/api/v1/students'

// Get student selections
async function loadStudentSelections(studentId) {
  const url = `${apiURL}/${encodeURIComponent(studentId)}/selections`

  const response = await authFetch(url)

  if (response.status !== 200) {
    const error = new Error(`Unable to load selections: ${response.status}`)
    error.status = response.status
    throw error
  }

  return await response.json()
}

// Create student selection
async function createStudentSelection(studentId, courseId, section) {
  const url = `${apiURL}/${encodeURIComponent(studentId)}/selections`

  const response = await authFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      courseId,
      section
    })
  })

  if (response.status !== 201) {
    const error = new Error(`Unable to select course: ${response.status}`)
    error.status = response.status
    throw error
  }

  return await response.json()
}

export { loadStudentSelections, createStudentSelection }
