import { requireSignIn, signOut } from './auth.js'

import { loadStudentProfile } from './services/profile-service.js'

import { loadCourseSchedules } from './services/course-options-service.js'

import {
  loadStudentSelections,
  createStudentSelection,
  deleteStudentSelection,
  changeStudentSelection
} from './services/student-selection-service.js'

import { createCell, toCapitalize } from './utils/tableUtils.js'

import { showCourseOptions } from './course-options.js'

// Authentication Elements
const userSection = document.getElementById('user-info')
const userNameElement = document.getElementById('user-display-name')
const signOutButton = document.getElementById('sign-out-button')
const authStatus = document.getElementById('auth-status')

// Profile Elements
const studentProfile = document.getElementById('student-profile')
const notStudentMessage = document.getElementById('not-student')
const lecturerMessage = document.getElementById('lecturer-message')

// Schedule Elements
const myScheduleSection = document.getElementById('my-schedule-section')
const myScheduleBody = document.getElementById('my-schedule-body')

const courseOptionsSection = document.getElementById('course-options-section')
const courseOptionsBody = document.getElementById('course-options-body')

// Dialog Elements
const errorModal = document.getElementById('error-modal')
const selectionDialog = document.getElementById('selection-message')
const selectionMessageText = document.getElementById('selection-message-text')
const selectionMessageOk = document.getElementById('selection-message-ok')
const changeDialog = document.getElementById('change-dialog')
const changeForm = document.getElementById('change-form')
const changeCourse = document.getElementById('change-course')
const changeCurrent = document.getElementById('change-current')
const changeOptions = document.getElementById('change-options')
const changeConfirm = document.getElementById('change-confirm')
const changeCancel = document.getElementById('change-cancel')
const removeDialog = document.getElementById('remove-dialog')
const removeDialogText = document.getElementById('remove-dialog-text')
const removeDialogConfirm = document.getElementById('remove-dialog-confirm')
const removeDialogCancel = document.getElementById('remove-dialog-cancel')

// Application State
let studentId = null
let schedules = []
let selections = []
let refreshSelectionsAfterDialogClose = false
let pendingRemoveCourseId = null
let pendingChangeCourseId = null

// Get Safe Display Name
function getDisplayName(user) {
  const name = typeof user?.name === 'string' ? user.name.trim() : ''

  const username =
    typeof user?.username === 'string' ? user.username.trim() : ''

  return name || username || 'User'
}

// Show Error Dialog
function showErrorModal() {
  if (errorModal && !errorModal.open) {
    errorModal.showModal()
  }
}

// Show Selection Message
function showSelectionMessage(message, refreshAfterClose = false) {
  selectionMessageText.textContent = message

  refreshSelectionsAfterDialogClose = refreshAfterClose

  if (!selectionDialog.open) {
    selectionDialog.showModal()
  }
}

// Get Course ID from different response formats
function getCourseId(item) {
  return Number(item?.courseId ?? item?.course?.id)
}

// Render My Schedule
function renderMySchedule() {
  const selectedSections = new Map(
    selections.map((selection) => [
      getCourseId(selection),
      Number(selection.section)
    ])
  )

  // Fixed courses + selected option sections
  const myScheduleItems = schedules.filter((schedule) => {
    if (schedule.fixed) {
      return true
    }

    const courseId = getCourseId(schedule)

    const selectedSection = selectedSections.get(courseId)

    return selectedSection === Number(schedule.section)
  })

  myScheduleBody.replaceChildren()

  // Empty message
  if (myScheduleItems.length === 0) {
    const row = document.createElement('tr')
    const cell = document.createElement('td')

    cell.colSpan = 11

    cell.dataset.testid = 'my-schedule-empty'

    cell.textContent = 'No classes yet. Choose from Courses to Choose.'

    row.append(cell)

    myScheduleBody.append(row)
  } else {
    const rows = document.createDocumentFragment()

    myScheduleItems.forEach((schedule) => {
      const row = document.createElement('tr')
      const actionCell = document.createElement('td')

      if(!schedule.fixed){
        const removeButton = document.createElement('button')
        removeButton.type = 'button'
        removeButton.textContent = 'Remove'
        removeButton.addEventListener('click', () => {
          openRemoveDialog(schedule)
        })
        actionCell.append(removeButton)
        if (getAlternativeSections(schedule).length > 0) {
          const changeButton = document.createElement('button')
          changeButton.type = 'button'
          changeButton.textContent = 'Change'
          changeButton.addEventListener('click', () => openChangeDialog(schedule))
          actionCell.append(changeButton)
        }
      }

      row.dataset.testid = 'schedule-row'

      row.append(
        createCell('code', schedule.course?.code),
        createCell('title', schedule.course?.title),
        createCell('type', schedule.course?.type),
        createCell('section', schedule.section),
        createCell('group', schedule.studentGroup),
        createCell('day', toCapitalize(schedule.dayOfWeek)),
        createCell(
          'time',
          `${schedule.startTime ?? ''}-${schedule.endTime ?? ''}`
        ),
        createCell(
          'weeks',
          `${schedule.startWeek ?? ''}-${schedule.endWeek ?? ''}`
        ),
        createCell('room', schedule.room),
        createCell('remarks', schedule.remarks),
        actionCell
      )

      rows.append(row)
    })

    myScheduleBody.append(rows)
  }

  myScheduleSection.hidden = false
}

function getAlternativeSections(schedule) {
  const options = new Map()
  for (const item of schedules) {
    if (!item.fixed && getCourseId(item) === getCourseId(schedule) &&
        Number(item.section) !== Number(schedule.section) && !options.has(Number(item.section))) {
      options.set(Number(item.section), item)
    }
  }
  return [...options.values()].sort((a, b) => Number(a.section) - Number(b.section))
}

function openChangeDialog(schedule) {
  pendingChangeCourseId = getCourseId(schedule)
  changeCourse.textContent = `${schedule.course?.code ?? ''} ${schedule.course?.title ?? ''}`
  changeCurrent.textContent = `Current section: ${schedule.section}`
  changeOptions.replaceChildren()
  changeConfirm.disabled = true
  for (const option of getAlternativeSections(schedule)) {
    const label = document.createElement('label')
    const radio = document.createElement('input')
    radio.type = 'radio'
    radio.name = 'section'
    radio.value = String(option.section)
    radio.addEventListener('change', () => { changeConfirm.disabled = false })
    label.append(radio, document.createTextNode(`Section ${option.section}: ${toCapitalize(option.dayOfWeek)} ${option.startTime}-${option.endTime}`))
    changeOptions.append(label, document.createElement('br'))
  }
  changeDialog.showModal()
}

async function handleChange(event) {
  event.preventDefault()
  const selected = changeOptions.querySelector('input[name="section"]:checked')
  if (!selected || pendingChangeCourseId === null) return
  const courseId = pendingChangeCourseId
  const section = Number(selected.value)
  changeConfirm.disabled = true
  changeCancel.disabled = true
  try {
    const updated = await changeStudentSelection(studentId, courseId, section)
    selections = selections.map((selection) => getCourseId(selection) === courseId ? updated : selection)
    changeDialog.close()
    renderTables()
  } catch (error) {
    changeDialog.close()
    if (error.status === 404) {
      showSelectionMessage('This course is not in your schedule or the section is no longer available to you.', true)
    } else {
      showSelectionMessage('There is a problem. Please try again later.')
    }
  } finally {
    changeCancel.disabled = false
    pendingChangeCourseId = null
  }
}

function openRemoveDialog(schedule){
  pendingRemoveCourseId = getCourseId(schedule)
  removeDialogText.textContent = `Remove ${schedule.course?.code} ${schedule.course?.title} section ${schedule.section}?`
  removeDialog.showModal()
}

async function handleConfirmRemove(){
  const courseId = pendingRemoveCourseId
  pendingRemoveCourseId = null
  removeDialog.close()

  try{
    await deleteStudentSelection(studentId, courseId)
    selections = selections.filter((s) => getCourseId(s) !== courseId)
    renderTables()
  }catch(error){
    if(error.status === 404){
      showSelectionMessage('This course is not in your schedule.', true)
    }else{
      showSelectionMessage('There is a problem. Please try again later.')
    }
  }
}

// Render Both Tables
function renderTables() {
  // Render My Schedule
  renderMySchedule()

  // Render Courses to Choose
  showCourseOptions(schedules, selections, handleSelect)
}

// Handle Select Button
async function handleSelect(schedule, button) {
  const courseId = getCourseId(schedule)
  const section = Number(schedule.section)

  button.disabled = true

  try {
    // Create Selection through Backend API
    const newSelection = await createStudentSelection(
      studentId,
      courseId,
      section
    )

    // Update local selections
    selections = [
      ...selections.filter((selection) => getCourseId(selection) !== courseId),
      newSelection
    ]

    // Re-render without page reload or additional GET requests
    renderTables()
  } catch (error) {
    console.error('Unable to select course:', error)

    if (error.status === 409) {
      showSelectionMessage('This course is already in your schedule.', true)
    } else {
      showSelectionMessage('There is a problem. Please try again later.')
    }
  } finally {
    if (button.isConnected) {
      button.disabled = false
    }
  }
}

// Refresh Selections after Conflict
async function refreshSelections() {
  try {
    selections = await loadStudentSelections(studentId)

    renderTables()
  } catch (error) {
    console.error('Unable to refresh selections:', error)

    showErrorModal()
  }
}

// Initialize Page
async function initPage() {
  // Check Required HTML Elements
  const requiredElements = [
    userSection,
    userNameElement,
    signOutButton,
    authStatus,
    studentProfile,
    notStudentMessage,
    lecturerMessage,
    myScheduleSection,
    myScheduleBody,
    courseOptionsSection,
    courseOptionsBody,
    errorModal,
    selectionDialog,
    selectionMessageText,
    selectionMessageOk,
    changeDialog, changeForm, changeCourse, changeCurrent, changeOptions, changeConfirm, changeCancel,
    removeDialog,
    removeDialogText,
    removeDialogConfirm,
    removeDialogCancel
  ]

  if (requiredElements.some((element) => !element)) {
    console.error('My Schedule HTML elements are missing.')
    return
  }

  // Initial State
  userSection.hidden = true
  signOutButton.disabled = true

  studentProfile.hidden = true
  notStudentMessage.hidden = true
  lecturerMessage.hidden = true

  myScheduleSection.hidden = true
  courseOptionsSection.hidden = true

  // Error Dialog cannot close with Escape
  errorModal.addEventListener('cancel', (event) => {
    event.preventDefault()
  })

  // Selection Dialog: OK Button
  selectionMessageOk.addEventListener('click', () => {
    selectionDialog.close()
  })

  // Selection Dialog: Close Event
  selectionDialog.addEventListener('close', () => {
    if (refreshSelectionsAfterDialogClose) {
      refreshSelectionsAfterDialogClose = false

      void refreshSelections()
    }
  })

  changeForm.addEventListener('submit', handleChange)
  changeCancel.addEventListener('click', () => changeDialog.close())
  changeDialog.addEventListener('cancel', (event) => {
    if (changeCancel.disabled) event.preventDefault()
  })

  removeDialogConfirm.addEventListener('click', () => {
    void handleConfirmRemove()
  })

  removeDialogCancel.addEventListener('click', () => {
    pendingRemoveCourseId = null
    removeDialog.close()
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

  // 1. Authenticate User
  let user

  try {
    user = await requireSignIn()
  } catch (error) {
    console.error('My Schedule sign-in failed:', error)

    authStatus.textContent =
      'Unable to sign in. Please reload the page or contact the administrator.'

    authStatus.hidden = false

    return
  }

  // 2. Display User Information
  studentId = user.username

  userNameElement.textContent = getDisplayName(user)

  userSection.hidden = false

  signOutButton.disabled = false

  authStatus.hidden = true

  // 3. Check User Roles
  const roles = Array.isArray(user.roles)
    ? user.roles.map((role) =>
        typeof role === 'string' ? role.toLowerCase() : ''
      )
    : []

  // Lecturer
  if (roles.includes('lecturer')) {
    lecturerMessage.hidden = false

    // Lecturer does not request student data
    return
  }

  // Not a Student
  if (!roles.includes('student')) {
    notStudentMessage.hidden = false

    return
  }

  // 4. Load Student Profile
  let profile

  try {
    profile = await loadStudentProfile(studentId)
  } catch (error) {
    console.error('Unable to load student profile:', error)

    if (error.status === 404) {
      notStudentMessage.hidden = false
    } else {
      showErrorModal()
    }

    return
  }

  // 5. Display Year and Group
  studentProfile.textContent = `Year ${profile.yearLevel} · Group ${profile.studentGroup}`

  studentProfile.hidden = false

  // 6. Load Schedules and Selections Exactly Once
  try {
    const [scheduleData, selectionData] = await Promise.all([
      loadCourseSchedules(profile.yearLevel, profile.studentGroup),

      loadStudentSelections(studentId)
    ])

    if (!Array.isArray(scheduleData) || !Array.isArray(selectionData)) {
      throw new Error(
        'The schedules or selections API returned an invalid response.'
      )
    }

    schedules = scheduleData
    selections = selectionData

    // 7. Render Both Tables
    renderTables()
  } catch (error) {
    console.error('Unable to load student schedules:', error)

    showErrorModal()
  }
}

// Start Application
initPage()
