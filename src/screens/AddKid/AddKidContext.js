import { createContext, useContext, useLayoutEffect, useRef } from 'react'

// Shared state + chrome controls for the Add a child flow.
//   data / update(patch)            — the child being set up (see INITIAL_DATA in steps.js)
//   goNext() / goBack() / goTo(id)  — navigation (goTo keeps history, so Back returns)
//   showToast(message)              — red M-Toast at the top (A5 error states)
//   setKeyboard('text'|'numpad'|null) — raises the drawn keyboard on desktop (fields do this)
//   requestClose()                  — header ✕ → close confirmation
export const AddKidContext = createContext(null)

const FALLBACK = { setKeyboard: () => {} }

export function useAddKid() {
  return useContext(AddKidContext) ?? FALLBACK
}

// Declare the footer for the current step. Re-declare on every render; only the visual
// parts (layout, labels, disabled, hidden) trigger an update, handlers are read live.
//   useStepFooter({
//     layout: 'stacked' | 'row',          // default 'row'
//     primary:   { label: 'Continue', disabled, onClick },
//     secondary: { label: 'Back', onClick },   // omit for stacked single button
//     top: <ReactNode>,                   // optional line above the buttons
//     hidden: false,
//   })
export function useStepFooter(config) {
  const ctx = useContext(AddKidContext)
  const handlers = useRef(config)
  handlers.current = config
  const { layout = 'row', primary, secondary, hidden = false, top } = config
  const key = JSON.stringify([layout, primary?.label, !!primary?.disabled, secondary?.label, !!secondary?.disabled, hidden, !!top])
  useLayoutEffect(() => {
    ctx?.setFooter({ ...handlers.current, handlers, stepId: ctx.step })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, top, ctx?.step])
}

// Override the step's hero (title / subtitle / illustration) — e.g. "Confirm email".
export function useStepHero(hero) {
  const ctx = useContext(AddKidContext)
  const key = JSON.stringify(hero ?? null)
  useLayoutEffect(() => {
    ctx?.setHeroOverride(hero ?? null)
    return () => ctx?.setHeroOverride(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
