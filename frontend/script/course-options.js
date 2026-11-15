import { createCell, toCapitalize } from './utils/tableUtils.js'

export function showCourseOptions(schedules, selections, onSelect) {
  const section = document.getElementById('course-options-section')
  const body = document.getElementById('course-options-body')
  const selectedCourseIds = new Set(selections.map((selection) => selection.courseId))
  const options = schedules.filter(
    (schedule) => !schedule.fixed && !selectedCourseIds.has(schedule.course.id)
  )

  const rows = document.createDocumentFragment()
  for (const schedule of options) {
    const row = document.createElement('tr')
    row.dataset.testid = 'schedule-row'

    const cells = {
      code: schedule.course.code,
      title: schedule.course.title,
      type: schedule.course.type,
      section: schedule.section,
      group: schedule.studentGroup,
      day: toCapitalize(schedule.dayOfWeek),
      time: `${schedule.startTime}-${schedule.endTime}`,
      weeks: `${schedule.startWeek}-${schedule.endWeek}`,
      room: schedule.room,
      remarks: schedule.remarks
    }

    for (const [testId, value] of Object.entries(cells)) {
      row.append(createCell(testId, value))
    }
    const action = document.createElement('td')
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Select'
    button.addEventListener('click', () => onSelect(schedule.course.id, schedule.section, button))
    action.append(button)
    row.append(action)
    rows.append(row)
  }

  body.replaceChildren(rows)
  section.hidden = options.length === 0
}
