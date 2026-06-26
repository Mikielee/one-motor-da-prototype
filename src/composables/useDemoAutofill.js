/**
 * Demo autofill — sprint-review helper.
 *
 * The "Car Insurance" chip in the global header doubles as a demo trigger.
 * Each step page registers a fill handler in setup; clicking the chip fires all
 * registered handlers. Only the mounted page's handler is in the set at any one
 * time (handlers auto-remove on unmount), so only the current step fills.
 *
 * Handlers set the fields the customer would have typed/picked so the step's
 * "Next" enables with consistent test data.
 */
import { onUnmounted } from 'vue'

const handlers = new Set()

export function useDemoAutofill() {
  return {
    trigger() {
      handlers.forEach((fn) => {
        try { fn() } catch (e) { console.error('demo autofill handler failed', e) }
      })
    },
    // Call from setup(). Auto-removed on unmount so navigating between steps
    // never leaves a stale handler in the set.
    register(fn) {
      handlers.add(fn)
      onUnmounted(() => handlers.delete(fn))
    },
  }
}
