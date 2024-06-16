'use client'
import LoginForm from '@repo/ui/src/components/LoginForm'
import LoginLayout from '@repo/ui/src/components/LoginLayout'

// export default function Page() {
//   function handleForm(formData: FormData) {
//     log({
//       email: formData.get('email'),
//       password: formData.get('password'),
//     })
//   }
//   return (
//     <form action={handleForm}>
//       <input type="email" name="email" placeholder="Email" required />
//       <input type="password" name="password" placeholder="Password" required />
//       <button type="submit">Login</button>
//     </form>
//   )
// }

export default function Page() {
  return (
    <LoginLayout>
      <LoginForm />
    </LoginLayout>
  )
}
