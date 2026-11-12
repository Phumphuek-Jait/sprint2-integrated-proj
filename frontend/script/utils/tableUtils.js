export function createCell(testId, value) {
  const cell = document.createElement('td')
  cell.dataset.testid = testId
  cell.textContent = value ?? ''
  return cell
}

export function toCapitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
