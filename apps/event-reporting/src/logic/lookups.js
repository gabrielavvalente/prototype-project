// Small helpers to read the fixed lists (organization and reference data).

export function findById(items, id) {
  return items.find((item) => item.id === id) || null;
}

export function getLabel(items, id) {
  const item = findById(items, id);
  return item ? item.label || item.name : '';
}

export function getReferenceList(reference, listName) {
  return reference.filter((item) => item.list === listName);
}

export function getChildren(organization, parentId) {
  return organization.filter((node) => node.parentId === parentId);
}

export function findFamilyByCode(reference, familyCode) {
  return reference.find((item) => item.list === 'family' && item.code === familyCode) || null;
}

export function findLevelByCode(reference, levelCode) {
  return reference.find((item) => item.list === 'level' && item.code === levelCode) || null;
}

// Today's date as YYYY-MM-DD in the user's own time zone.
export function toDateString(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// The current time as HH:MM in the user's own time zone.
export function toTimeString(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
