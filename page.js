'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PACKAGES = {
  Standard: {
    activation: 3000,
    perCycle: 50,
    referral: 500,
  },
  Premium: {
    activation: 5000,
    perCycle: 120,
    referral: 800,
  },
}

function getCurrentCycleInfo() {
  const now = new Date()

  const lagosTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Lagos',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const hour = Number(
    lagosTime.find((part) => part.type === 'hour')?.value || 0
  )

  const minute = Number(
    lagosTime.find((part) => part.type === 'minute')?.value || 0
  )

  const second = Number(
    lagosTime.find((part) => part.type === 'second')?.value || 0
  )

  // Daily earning period: 5:00 PM → 5:00 PM
  const hoursSinceFivePM = (hour - 17 + 24) % 24

  let cycleNum = Math.floor(hoursSinceFivePM / 2) + 1

  if (cycleNum < 1) cycleNum = 1
  if (cycleNum > 12) cycleNum = 12

  const cycleStartHour = (17 + (cycleNum - 1) * 2) % 24
  const cycleEndHour = (cycleStartHour + 2) % 24

  const currentMinutes = minute + second / 60

  let minutesIntoCycle

  if (cycleStartHour === 23) {
    minutesIntoCycle = currentMinutes + 60
  } else {
    minutesIntoCycle =
      (hour - cycleStartHour) * 60 + currentMinutes
  }

  const cycleDurationMinutes = 120

  const minutesRemaining = Math.max(
    0,
    cycleDurationMinutes - minutesIntoCycle
  )

  return {
    cycleNum,
    hour,
    minute,
    second,
    cycleStartHour,
    cycleEndHour,
    minutesRemaining,
  }
}

function formatCountdown(totalMinutes) {
  const totalSeconds = Math.max(
    0,
    Math.floor(totalMinutes * 60)
  )

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${String(hours).padStart(2, '0')}:${String(
    minutes
  ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  const [wallet, setWallet] = useState({
    available_balance: 0,
  })

  const [cycleInfo, setCycleInfo] = useState(
    getCurrentCycleInfo()
  )

  const [loading, setLoading] = useState(true)

  const [authMode, setAuthMode] = useState('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')

  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          throw authError
        }

        if (!mounted) return

        setUser(user)

        // No user = show login screen
        if (!user) {
          setLoading(false)
          return
        }

        // Load profile
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Profile error:', profileError)
        }

        if (!mounted) return

        setProfile(profileData || null)

        // Load wallet
        const {
          data: walletData,
          error: walletError,
        } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (walletError) {
          console.error('Wallet error:', walletError)
        }

        if (!mounted) return

        if (walletData) {
          setWallet(walletData)
        }
      } catch (err) {
        console.error('Dashboard error:', err)

        if (mounted) {
          setError(
            'Unable to load your TapBumber account right now.'
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return

        const loggedInUser = session?.user || null

        setUser(loggedInUser)

        if (!loggedInUser) {
          setProfile(null)
          setWallet({
            available_balance: 0,
          })
          setLoading(false)
          return
        }

        // Reload the page data after login/signup
        await loadDashboard()
      }
    )

    const timer = setInterval(() => {
      setCycleInfo(getCurrentCycleInfo())
    }, 1000)

    return () => {
      mounted = false
      clearInterval(timer)
      subscription.unsubscribe()
    }
  }, [])

  async function handleAuth(event) {
    event.preventDefault()

    setAuthError('')
    setAuthMessage('')

    const cleanEmail = email.trim()

    if (!cleanEmail || !password) {
      setAuthError('Please enter your email and password.')
      return
    }

    if (password.length < 6) {
      setAuthError(
        'Password must be at least 6 characters.'
      )
      return
    }

    try {
      setAuthLoading(true)

      if (authMode === 'signup') {
        const {
          data,
          error: signUpError,
        } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        })

        if (signUpError) {
          throw signUpError
        }

        if (data.session) {
          setAuthMessage(
            'Account created successfully. Loading your TapBumber account...'
          )
        } else {
          setAuthMessage(
            'Account created! Please check your email and confirm your account before logging in.'
          )
        }
      } else {
        const {
          data,
          error: loginError,
        } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

        if (loginError) {
          throw loginError
        }

        if (!data.session) {
          throw new Error(
            'Login completed but no session was created.'
          )
        }

        setAuthMessage(
          'Login successful. Loading TapBumber...'
        )
      }
    } catch (err) {
      console.error('Authentication error:', err)

      setAuthError(
        err?.message ||
          'Authentication failed. Please try again.'
      )
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleLogout() {
    try {
      setAuthError('')
      setAuthMessage('')

      const { error: logoutError } =
        await supabase.auth.signOut()

      if (logoutError) {
        throw logoutError
      }

      setUser(null)
      setProfile(null)
      setWallet({
        available_balance: 0,
      })

      setEmail('')
      setPassword('')
    } catch (err) {
      console.error('Logout error:', err)

      setAuthError(
        'Unable to log out right now. Please try again.'
      )
    }
  }

  const selectedPackage = profile?.package
    ? PACKAGES[profile.package]
    : null

  const reward = selectedPackage?.perCycle || 0
  const maxDaily = reward * 12

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-700">
            TAPBUMBER
          </h1>

          <p className="mt-2 text-gray-600">
            Loading...
          </p>
        </div>
      </main>
    )
  }

  // =========================
  // LOGIN / SIGN UP SCREEN
  // =========================

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          <div className="bg-green-700 text-white rounded-t-2xl p-6 text-center">
            <h1 className="text-3xl font-bold">
              TAPBUMBER
            </h1>

            <p className="text-sm mt-2">
              Nigerian Naira Earning Platform
            </p>
          </div>

          <div className="bg-white rounded-b-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold text-center text-gray-800">
              {authMode === 'login'
                ? 'Welcome Back'
                : 'Create Your Account'}
            </h2>

            <p className="text-center text-gray-500 text-sm mt-2">
              {authMode === 'login'
                ? 'Log in to continue to TapBumber'
                : 'Sign up to start using TapBumber'}
            </p>

            <form
              onSubmit={handleAuth}
              className="mt-6 space-y-4"
            >

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-green-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete={
                    authMode === 'login'
                      ? 'current-password'
                      : 'new-password'
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-green-600"
                  required
                />
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  {authError}
                </div>
              )}

              {authMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
                  {authMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold"
              >
                {authLoading
                  ? 'Please wait...'
                  : authMode === 'login'
                  ? 'Log In'
                  : 'Create Account'}
              </button>

            </form>

            <div className="text-center mt-6">

              {authMode === 'login' ? (
                <p className="text-sm text-gray-600">
                  Don't have an account?
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup')
                      setAuthError('')
                      setAuthMessage('')
                    }}
                    className="ml-1 text-green-700 font-bold"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Already have an account?
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login')
                      setAuthError('')
                      setAuthMessage('')
                    }}
                    className="ml-1 text-green-700 font-bold"
                  >
                    Log In
                  </button>
                </p>
              )}

            </div>

          </div>
        </div>
      </main>
    )
  }

  // =========================
  // TAPBUMBER DASHBOARD
  // =========================

  return (
    <main className="min-h-screen bg-gray-50 pb-20">

      <header className="bg-green-700 text-white p-4">
        <div className="flex items-center justify-between gap-3">

          <div>
            <h1 className="text-2xl font-bold">
              TAPBUMBER
            </h1>

            <p className="text-sm">
              Nigerian Naira Earning Platform
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-white text-green-700 px-3 py-2 rounded-lg font-bold text-sm"
          >
            Log Out
          </button>

        </div>
      </header>

      <div className="p-4 space-y-4">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            {error}
          </div>
        )}

        {/* WALLET */}

        <section className="bg-white rounded-xl shadow p-4">

          <p className="text-gray-500 text-sm">
            Available Balance
          </p>

          <p className="text-3xl font-bold text-green-700">
            ₦{Number(
              wallet.available_balance || 0
            ).toFixed(2)}
          </p>

        </section>

        {/* ACCOUNT */}

        <section className="bg-white rounded-xl shadow p-4">

          <h2 className="font-bold text-lg mb-2">
            Account
          </h2>

          <p className="text-sm text-gray-600">
            Email
          </p>

          <p className="font-medium break-all">
            {user?.email || 'No email'}
          </p>

          <p className="text-sm text-gray-600 mt-3">
            User ID
          </p>

          <p className="font-medium break-all text-xs">
            {user?.id || 'Not logged in'}
          </p>

          <div className="mt-3">

            <p className="text-sm text-gray-600">
              Activation Status
            </p>

            <p className="font-bold">
              {profile?.activation_status ||
                'Not Activated'}
            </p>

          </div>

          {profile?.package && (
            <div className="mt-2">

              <p className="text-sm text-gray-600">
                Package
              </p>

              <p className="font-bold">
                {profile.package}
              </p>

            </div>
          )}

        </section>

        {/* CURRENT CYCLE */}

        <section className="bg-white rounded-xl shadow p-4">

          <h2 className="font-bold text-lg">
            Current Earning Cycle
          </h2>

          <p className="mt-2 text-2xl font-bold">
            Cycle {cycleInfo.cycleNum} of 12
          </p>

          <p className="text-sm text-gray-600 mt-2">
            Cycle countdown
          </p>

          <p className="text-2xl font-mono font-bold text-green-700">
            {formatCountdown(
              cycleInfo.minutesRemaining
            )}
          </p>

          <div className="mt-3 space-y-1 text-sm text-gray-600">

            <p>
              Reward per cycle:{' '}
              <strong>₦{reward}</strong>
            </p>

            <p>
              Today's maximum:{' '}
              <strong>₦{maxDaily}</strong>
            </p>

          </div>

          <button
            type="button"
            disabled={
              !profile ||
              profile.activation_status !== 'Activated'
            }
            className="w-full mt-4 bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold"
          >
            {profile?.activation_status === 'Activated'
              ? `Claim ₦${reward}`
              : 'Activate to Earn'}
          </button>

        </section>

        {/* PACKAGES */}

        <section className="bg-white rounded-xl shadow p-4">

          <h2 className="font-bold text-lg mb-3">
            Activation Packages
          </h2>

          <div className="space-y-3">

            <div className="border rounded-lg p-3">

              <p className="font-bold">
                Standard — ₦3,000
              </p>

              <p className="text-sm text-gray-600 mt-1">
                ₦50 per completed 2-hour cycle
              </p>

              <p className="text-sm text-gray-600">
                Maximum: ₦600 per daily period
              </p>

              <p className="text-sm text-gray-600">
                Referral bonus: ₦500
              </p>

            </div>

            <div className="border rounded-lg p-3">

              <p className="font-bold">
                Premium — ₦5,000
              </p>

              <p className="text-sm text-gray-600 mt-1">
                ₦120 per completed 2-hour cycle
              </p>

              <p className="text-sm text-gray-600">
                Maximum: ₦1,440 per daily period
              </p>

              <p className="text-sm text-gray-600">
                Referral bonus: ₦800
              </p>

            </div>

          </div>

        </section>

        {/* WHATSAPP */}

        <section className="bg-white rounded-xl shadow p-4">

          <a
            href="https://chat.whatsapp.com/FFGIXhlJHMRKHOB3hhp3fb?s=cl&p=a&ilr=1"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-green-500 text-white py-3 rounded-lg font-bold"
          >
            Join TapBumber WhatsApp Group
          </a>

        </section>

      </div>

    </main>
  )
}