interface ToggleProps {
  label: string
  helperText?: string
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
}

export function Toggle({ label, helperText, checked, onChange, id }: ToggleProps) {
  const inputId = id ?? `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="toggle-field">
      <div className="toggle-field-text">
        <label htmlFor={inputId}>{label}</label>
        {helperText && <p className="toggle-helper">{helperText}</p>}
      </div>
      <button
        type="button"
        role="switch"
        id={inputId}
        aria-checked={checked}
        className={checked ? 'toggle toggle-on' : 'toggle'}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-thumb" />
      </button>
    </div>
  )
}
