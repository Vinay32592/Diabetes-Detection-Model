import { useMemo, useState } from 'react'
import { ClipboardPaste, RotateCcw, Sparkles } from 'lucide-react'
import { FIELD_CONFIG, SAMPLE_DATA } from '../constants/fields.ts'
import type { PatientInputs } from '../types'

type FormState = Record<keyof PatientInputs, string>
type FormErrors = Partial<Record<keyof PatientInputs, string>>
type TouchedState = Partial<Record<keyof PatientInputs, boolean>>

const INITIAL_FORM: FormState = FIELD_CONFIG.reduce<FormState>((acc, field) => {
  acc[field.name] = ''
  return acc
}, {} as FormState)

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {}

  FIELD_CONFIG.forEach(({ name, label, min }) => {
    const value = form[name]

    if (value === '' || value === null || value === undefined) {
      errors[name] = `${label} is required.`
      return
    }

    const numericValue = Number(value)

    if (Number.isNaN(numericValue)) {
      errors[name] = `${label} must be a number.`
      return
    }

    if (name === 'age' && numericValue <= 0) {
      errors[name] = 'Age must be greater than 0.'
      return
    }

    if (numericValue < min) {
      errors[name] = `${label} cannot be negative.`
    }
  })

  return errors
}

interface PredictionFormProps {
  onSubmit: (data: PatientInputs) => void
  onReset: () => void
  loading: boolean
}

function PredictionForm({ onSubmit, onReset, loading }: PredictionFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<TouchedState>({})

  const filledCount = useMemo(
    () => FIELD_CONFIG.filter(({ name }) => form[name] !== '').length,
    [form],
  )

  const progress = (filledCount / FIELD_CONFIG.length) * 100

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    const key = name as keyof PatientInputs
    setForm((prev) => ({ ...prev, [key]: value }))

    if (touched[key]) {
      setErrors(validateForm({ ...form, [key]: value }))
    }
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const key = event.target.name as keyof PatientInputs
    setTouched((prev) => ({ ...prev, [key]: true }))
    setErrors(validateForm(form))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validateForm(form)
    setErrors(validationErrors)
    setTouched(
      FIELD_CONFIG.reduce<TouchedState>((acc, field) => {
        acc[field.name] = true
        return acc
      }, {}),
    )

    if (Object.keys(validationErrors).length > 0) return

    onSubmit({
      pregnancies:                 Number(form.pregnancies),
      glucose:                     Number(form.glucose),
      blood_pressure:              Number(form.blood_pressure),
      skin_thickness:              Number(form.skin_thickness),
      insulin:                     Number(form.insulin),
      bmi:                         Number(form.bmi),
      diabetes_pedigree_function:  Number(form.diabetes_pedigree_function),
      age:                         Number(form.age),
    })
  }

  function handleReset() {
    setForm(INITIAL_FORM)
    setErrors({})
    setTouched({})
    onReset()
  }

  function loadSampleData() {
    const sampleForm = FIELD_CONFIG.reduce<FormState>((acc, field) => {
      acc[field.name] = String(SAMPLE_DATA[field.name])
      return acc
    }, {} as FormState)
    setForm(sampleForm)
    setErrors({})
    setTouched({})
  }

  return (
    <form className="prediction-form" onSubmit={handleSubmit} noValidate>
      <div className="form-progress" aria-hidden="true">
        <div className="form-progress-track">
          <div className="form-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="form-progress-label">
          {filledCount} of {FIELD_CONFIG.length} fields completed
        </span>
      </div>

      <div className="form-grid">
        {FIELD_CONFIG.map((field, index) => {
          const hasValue = form[field.name] !== ''
          const hasError = Boolean(errors[field.name])

          return (
            <div
              key={field.name}
              className={`form-group ${hasValue ? 'is-filled' : ''} ${hasError ? 'has-error' : ''}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="form-label-row">
                <label htmlFor={field.name}>{field.label}</label>
                <span className="field-unit-badge">{field.unit}</span>
              </div>
              <p className="field-hint">{field.description}</p>
              <div className="input-with-unit">
                <input
                  id={field.name}
                  name={field.name}
                  type="number"
                  inputMode="decimal"
                  min={field.min}
                  step={field.step}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${field.name}-error` : `${field.name}-unit`}
                  disabled={loading}
                />
                <span id={`${field.name}-unit`} className="input-unit">
                  {field.unitShort}
                </span>
              </div>
              {errors[field.name] && (
                <span id={`${field.name}-error`} className="field-error" role="alert">
                  {errors[field.name]}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-glow" disabled={loading}>
          <Sparkles size={18} aria-hidden="true" />
          {loading ? 'Evaluating ML Model...' : 'Run ML Risk Prediction'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={loadSampleData}
          disabled={loading}
        >
          <ClipboardPaste size={18} aria-hidden="true" />
          Load Sample
        </button>
        <button type="button" className="btn btn-ghost" onClick={handleReset} disabled={loading}>
          <RotateCcw size={18} aria-hidden="true" />
          Reset
        </button>
      </div>
    </form>
  )
}

export default PredictionForm
