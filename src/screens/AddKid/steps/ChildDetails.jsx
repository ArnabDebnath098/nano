import { useRef, useState } from 'react'
import { useAddKid, useStepFooter } from '../AddKidContext.js'
import { ageFrom } from '../steps.js'
import TextField from '../../../components/AddKid/TextField.jsx'
import SquircleSurface from '../../../components/SquircleSurface/SquircleSurface.jsx'
import BirthdayPicker from './child/BirthdayPicker.jsx'
import { isAndroid, isNativeMobile } from '../../../lib/platform.js'
import './ChildDetails.css'

const AGE_COPY = 'nano is for kids aged 7 to 18'
// ISO yyyy-mm-dd (the stored / native date input value) → dd-mm-yyyy
const isoToDisplay = (iso) => (iso ? iso.split('-').reverse().join('-') : '')
const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const ageOk = (iso) => {
  const age = ageFrom(iso)
  return age !== null && age >= 7 && age <= 18
}

// Figma: Child details · Empty (57:1182) / Filled (18:14867) / Last name missing (18:15059) /
// Age outside 7–18 (57:1926). Name (two M-Input-alt boxes), Birthday (M-Input-alt + calendar,
// opens the date wheel sheet), Gender (two option cards with hex avatars + M-Radio).
// Continue (stacked) stays disabled until everything is valid; the A5 errors fire as the parent
// moves on: picking a birthday outside 7–18, or moving past an empty last name, shows the red
// toast, marks the field and replays the NANO field shake.
// Motion: rows rise in via the shell ([data-rise]); option cards crossfade border / fill on
// PP Fade and press to 0.98; the radio check pops 0.9 → 1 on PP Move (deselect quicker); the
// age error rises 4px into place. Reduced: fades only (press scale kept).
export default function ChildDetails() {
  const { data, update, goNext, showToast, setKeyboard } = useAddKid()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [lastError, setLastError] = useState(false)
  const [lastShake, setLastShake] = useState(0)
  const [birthdayShake, setBirthdayShake] = useState(0)

  const first = data.firstName.trim()
  const last = data.lastName.trim()
  const birthdayError = !!data.birthday && !ageOk(data.birthday)
  const lastNameError = lastError && !last
  const complete = !!first && !!last && !!data.birthday && !birthdayError && !!data.gender

  useStepFooter({
    layout: 'stacked',
    primary: { label: 'Continue', disabled: !complete, onClick: goNext },
  })

  // Moving past an empty last name (Figma 18:15059: "Add Kiaan’s last name")
  const checkLastName = () => {
    if (!first || last) return
    setLastError(true)
    setLastShake((n) => n + 1)
    showToast(`Add ${first}’s last name`)
  }

  // Birthday — iOS / Android: the system date picker (a native <input type="date"> laid
  // invisibly over the field, so a real tap lands on it). Web: the drum picker bottom sheet.
  // Either way the field shows the selected state while picking (`pickerOpen`).
  const valueAtOpen = useRef('')

  const checkAge = (iso) => {
    if (iso && !ageOk(iso)) {
      setBirthdayShake((n) => n + 1)
      showToast(AGE_COPY)
    }
  }

  const openPicker = () => {
    document.activeElement?.blur?.()
    setKeyboard(null)
    checkLastName()
    setPickerOpen(true)
  }

  const pickBirthday = (iso) => {
    setPickerOpen(false)
    update({ birthday: iso })
    checkAge(iso)
  }

  // Native: the value updates live (iOS updates it as the wheel spins), so on iOS picking ends
  // on blur (Done / tapping away). Android's dialog commits once on OK but can keep focus, so
  // the commit itself ends picking there. The age check runs only when picking ends, and only
  // if the date changed — an error shake (which rebuilds the field) never fires mid-spin.
  const endPicking = (value) => {
    setPickerOpen(false)
    if (value !== valueAtOpen.current) {
      valueAtOpen.current = value
      checkAge(value)
    }
  }
  const nativeHandlers = {
    onFocus: (e) => {
      valueAtOpen.current = e.target.value
      setKeyboard(null)
      checkLastName()
      setPickerOpen(true)
    },
    onBlur: (e) => endPicking(e.target.value),
    onClick: (e) => {
      try {
        e.currentTarget.showPicker?.()
      } catch {
        /* already open */
      }
    },
    onChange: (e) => {
      update({ birthday: e.target.value })
      if (isAndroid) {
        endPicking(e.target.value)
        e.target.blur()
      }
    },
  }

  const pickGender = (gender) => {
    update({ gender })
    checkLastName()
  }

  return (
    <div className="child-details">
      {/* Child’s name (57:1192) */}
      <section className="child-details__group" data-rise>
        <h2 className="child-details__heading">Child’s name</h2>
        <div className="child-details__names">
          <TextField
            label="First name*"
            name="nano-kid-first"
            required={false}
            value={data.firstName}
            onChange={(v) => update({ firstName: v })}
            autoComplete="off"
            placeholder
            autoCapitalize="words"
          />
          <TextField
            label="Last name*"
            name="nano-kid-last"
            required={false}
            value={data.lastName}
            onChange={(v) => update({ lastName: v })}
            error={lastNameError}
            shake={lastShake}
            autoComplete="off"
            placeholder
            autoCapitalize="words"
          />
        </div>
      </section>

      {/* Birthday (57:1210) */}
      <section className="child-details__group child-details__group--birthday" data-rise>
        <div className="child-details__intro">
          <h2 className="child-details__heading" id="child-birthday-label">
            Birthday
          </h2>
          <p className="child-details__helper">We'll make sure to make it special for them.</p>
        </div>
        <div className={`child-birthday ${birthdayError ? 'is-error' : ''}`}>
          {isNativeMobile ? (
            <div
              className={`child-birthday__field ${data.birthday ? 'is-filled' : ''} ${pickerOpen ? 'is-selected' : ''}`}
              data-shake={birthdayShake || undefined}
              key={birthdayShake}
            >
              <SquircleSurface />
              <span className="child-birthday__value" aria-hidden="true">
                {data.birthday ? isoToDisplay(data.birthday) : 'DD-MM-YYYY'}
              </span>
              <img src="/figma/add-kid/child/calendar.svg" width="20" height="20" alt="" />
              <input
                type="date"
                className="child-birthday__native"
                value={data.birthday ?? ''}
                max={todayIso()}
                aria-labelledby="child-birthday-label"
                aria-invalid={birthdayError || undefined}
                {...nativeHandlers}
              />
            </div>
          ) : (
            <button
              type="button"
              className={`child-birthday__field ${data.birthday ? 'is-filled' : ''} ${pickerOpen ? 'is-selected' : ''}`}
              data-shake={birthdayShake || undefined}
              key={birthdayShake}
              aria-labelledby="child-birthday-label child-birthday-value"
              aria-invalid={birthdayError || undefined}
              aria-haspopup="dialog"
              aria-expanded={pickerOpen}
              onClick={openPicker}
            >
              <SquircleSurface />
              <span className="child-birthday__value" id="child-birthday-value">
                {data.birthday ? isoToDisplay(data.birthday) : 'DD-MM-YYYY'}
              </span>
              <img src="/figma/add-kid/child/calendar.svg" width="20" height="20" alt="" />
            </button>
          )}
          {birthdayError && <p className="child-birthday__support">{AGE_COPY}</p>}
        </div>
      </section>

      {/* Gender (57:1215) */}
      <section className="child-details__group" data-rise>
        <h2 className="child-details__heading" id="child-gender-label">
          Gender
        </h2>
        <div className="child-details__genders" role="radiogroup" aria-labelledby="child-gender-label">
          <GenderOption kind="boy" label="Boy" selected={data.gender === 'boy'} onSelect={pickGender} />
          <GenderOption kind="girl" label="Girl" selected={data.gender === 'girl'} onSelect={pickGender} />
        </div>
      </section>

      {!isNativeMobile && (
        <BirthdayPicker open={pickerOpen} value={data.birthday} onClose={() => setPickerOpen(false)} onDone={pickBirthday} />
      )}
    </div>
  )
}

// Figma: "Search result" option card (57:1219) — hex avatar (Polygon 19 fill, masked portrait,
// Polygon 20 ring) + B14 label + M-Radio 20.
function GenderOption({ kind, label, selected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`gender-option gender-option--${kind} ${selected ? 'is-selected' : ''}`}
      onClick={() => onSelect(kind)}
    >
      <SquircleSurface />
      <span className="gender-option__lead">
        <span className="gender-option__hex" aria-hidden="true">
          <img className="gender-option__hex-bg" src={`/figma/add-kid/child/hex-${kind}-bg.svg`} alt="" />
          <span className="gender-option__portrait">
            <img src={`/figma/add-kid/avatar-${kind}.webp`} alt="" />
          </span>
          <img className="gender-option__hex-ring" src="/figma/add-kid/child/hex-ring.svg" alt="" />
        </span>
        <span className="gender-option__label">{label}</span>
      </span>
      <span className="gender-option__radio" aria-hidden="true">
        <img className="gender-option__radio-off" src="/figma/add-kid/child/radio-off.svg" width="20" height="20" alt="" />
        <img className="gender-option__radio-on" src="/figma/add-kid/child/radio-on.svg" width="20" height="20" alt="" />
      </span>
    </button>
  )
}
