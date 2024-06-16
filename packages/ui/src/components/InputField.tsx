import TextField from '@mui/material/TextField'
import { type ChangeEvent } from 'react'

interface InputFieldProps {
  label: string
  type: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  error?: string
}

function InputField({ label, type, value, onChange, error }: InputFieldProps): JSX.Element {
  return (
    <TextField
      error={Boolean(error)}
      fullWidth
      helperText={error}
      label={label}
      margin="normal"
      onChange={onChange}
      type={type}
      value={value}
      variant="outlined"
    />
  )
}

export default InputField
