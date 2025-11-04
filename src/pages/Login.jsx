import React, { useState } from 'react'
import AuthForm from '../components/Auth/AuthForm'

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (credentials) => {
    setIsLoading(true)
    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Login attempt:', credentials)
      // Redirect to dashboard on success
      window.location.href = '/'
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Rover Control Access</h2>
          <p className="mt-2 text-gray-300">Sign in to your rover dashboard</p>
        </div>
        <AuthForm onSubmit={handleLogin} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default Login