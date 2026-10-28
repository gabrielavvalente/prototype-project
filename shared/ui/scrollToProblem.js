// Guided corrections (feature 010): after a refused save, bring the first field with a message into
// view and move the focus to it. Plain DOM, used by every app; imports nothing (constitution).

const PROBLEMS = [
  '[aria-invalid="true"]',
  '.mantine-InputWrapper-error',
  '.mantine-Input-error',
  '.field-error',
  '.message--error',
  '[role="alert"]',
].join(', ');

const FIELDS = 'input:not([type="hidden"]), textarea, select, button, [tabindex]';

function isShown(element) {
  return element.getClientRects().length > 0;
}

// The field to focus for a problem: the invalid field itself, else the first field of its part.
function fieldOf(problem) {
  if (problem.matches(FIELDS)) return problem;
  const part = problem.closest('.mantine-InputWrapper-root, .field, section, fieldset, form') || problem.parentElement;
  return part?.querySelector(FIELDS) || null;
}

// Scrolls to the first visible problem in root (a dialog when one is open, else the page) and
// focuses it. Call it once the messages are on screen, e.g. after a state update.
export function scrollToFirstProblem(root) {
  const scope = root || document.querySelector('[role="dialog"]') || document.querySelector('main') || document.body;
  const problem = [...scope.querySelectorAll(PROBLEMS)].find(isShown);
  if (!problem) return;
  problem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const field = fieldOf(problem);
  if (field) field.focus({ preventScroll: true });
}

// Runs scrollToFirstProblem after the next paint, when the new messages have rendered.
export function scrollToFirstProblemSoon(root) {
  requestAnimationFrame(() => requestAnimationFrame(() => scrollToFirstProblem(root)));
}
