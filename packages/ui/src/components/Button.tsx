import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button'

interface ButtonProps extends MuiButtonProps {
  label: string
  isLoading?: boolean
}

function Button({ label, onClick, isLoading = false, ...rest }: ButtonProps): JSX.Element {
  return (
    <MuiButton disabled={isLoading} fullWidth onClick={onClick} variant="contained" {...rest}>
      {isLoading ? 'Loading...' : label}
    </MuiButton>
  )
}

export default Button
