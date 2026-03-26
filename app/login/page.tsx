import SignInClient from '@/components/pages/SignInClient'
import AuthGuard from '@/components/AuthGuard'

export default function Page() {
  return (
    <AuthGuard type="public">
      <SignInClient />
    </AuthGuard>
  )
}