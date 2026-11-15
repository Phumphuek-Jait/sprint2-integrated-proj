import { requireSignIn, signOut, authFetch } from './auth.js'
import { showCourseOptions } from './course-options.js'

const api = new URL('api/v1/', document.baseURI)
const errorDialog = document.getElementById('selection-error-dialog')

document.getElementById('selection-error-ok').addEventListener('click', () => errorDialog.close())

function showError() {
  if (!errorDialog.open) errorDialog.showModal()
}

async function getJson(path) {
  const response = await authFetch(new URL(path, api))
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json()
}

async function initPage() {
  try {
    const user = await requireSignIn()
    document.getElementById('user-display-name').textContent = user.name ?? ''
    document.getElementById('sign-out-button').addEventListener('click', signOut)

    if (user.roles.includes('lecturer')) return
    const studentPath = `students/${encodeURIComponent(user.username)}`
    const profile = await getJson(studentPath)
    const [schedules, selections] = await Promise.all([
      getJson(`year-levels/${encodeURIComponent(profile.yearLevel)}/schedules?studentGroup=${encodeURIComponent(profile.studentGroup)}`),
      getJson(`${studentPath}/selections`)
    ])

    showCourseOptions(schedules, selections, async (courseId, section, button) => {
      button.disabled = true
      try {
        const response = await authFetch(new URL(`${studentPath}/selections`, api), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, section })
        })
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
      } catch (error) {
        console.error(error)
        button.disabled = false
        showError()
      }
    })
  } catch (error) {
    console.error(error)
    showError()
  }
}

initPage()
