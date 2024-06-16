import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Typography, Box } from '@mui/material'
import { ApiClient } from '@repo/api-client'
import InputField from './InputField'
import Button from './Button'

const apiClient = new ApiClient()

function LoginForm(): JSX.Element {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await apiClient.authApi.login({ email, password })
      console.log('Logging in!', { email, password })
      // Redirect or handle successful login
    } catch (err) {
      setError('Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <InputField
          error={error ? 'Invalid email or password' : undefined}
          label="Email"
          onChange={(e) => {
            setEmail(e.target.value)
          }}
          type="email"
          value={email}
        />
        <InputField
          error={error ? 'Invalid email or password' : undefined}
          label="Password"
          onChange={(e) => {
            setPassword(e.target.value)
          }}
          type="password"
          value={password}
        />
        <Button color="primary" isLoading={isLoading} label="Login" type="submit" />
      </form>
      <Box mt={2}>
        <Link href="/signup" passHref>
          <Button isLoading={isLoading} label="Create Account" variant="outlined" />
        </Link>
      </Box>
      <Box mt={2}>
        <Typography variant="body2">
          Can't login?{' '}
          <Link href="/signup" passHref>
            Reset password
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default LoginForm
