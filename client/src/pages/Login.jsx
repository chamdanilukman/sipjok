import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, isAuthenticated } from '../config/supabase'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Check if already authenticated
  useEffect(() => {
    isAuthenticated().then((authenticated) => {
      if (authenticated) {
        navigate('/')
      }
    })
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      console.log('✅ Login successful!')
      navigate('/')
    } catch (err) {
      console.error('❌ Login failed:', err)
      setError(err.message || 'Login gagal. Periksa email dan password Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <i className="fas fa-running text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SIPJOK</h1>
          <p className="text-gray-600">Sistem Informasi PJOK</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <i className="fas fa-envelope mr-2 text-gray-400"></i>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="nama@email.com"
              required
              autoComplete="email"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <i className="fas fa-lock mr-2 text-gray-400"></i>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded" />
              Ingat saya
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Lupa password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Logging in...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <i className="fas fa-sign-in-alt mr-2"></i>
                Login
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2024 SIPJOK - Sistem Informasi PJOK</p>
          <p className="mt-1">Untuk Guru PJOK SD</p>
        </div>


      </div>
    </div>
  )
}

export default Login

