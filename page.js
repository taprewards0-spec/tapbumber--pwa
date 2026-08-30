'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PACKAGES = {
  Standard: {
    activation: 3000,
    activationBonus: 500,
    perCycle: 50,
    referral: 500,
  },
  Premium: {
    activation: 5000,
    activationBonus: 800,
    perCycle: 120,
    referral: 800,
  },
}

function getCurrentCycleInfo() {
  const now = new Date()

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Lagos',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const hour = Number(parts.find((p) => p.type === 'hour')?.value || 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value || 0)
  const second = Number(parts.find((p) => p.type === 'second')?.value || 0)

  const hoursSinceFivePM = (hour - 17 + 24) % 24
  const cycleNum = Math.min(
    12,
    Math.floor(hoursSinceFivePM / 2) + 1
  )

  const cycleStartHour =
    (17 + (cycleNum - 1) * 2) % 24

  const currentMinutes = minute + second / 60

  let minutesIntoCycle

  if (cycleStartHour === 23) {
    minutesIntoCycle = currentMinutes + 60
  } else {
    minutesIntoCycle =
      (hour - cycleStartHour) * 60 + currentMinutes
  }

  const minutesRemaining = Math.max(
    0,
    120 - minutesIntoCycle
  )

  return {
    cycleNum,
    minutesRemaining,
  }
}

function formatCountdown(totalMinutes) {
  const totalSeconds = Math.max(
    0,
    Math.floor(totalMinutes * 60)
  )

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  )
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

  const [demoPackage, setDemoPackage] = useState(null)
  const [demoActivated, setDemoActivated] = useState(false)
  const [demoBalance, setDemoBalance] = useState(0)
  const [claimedCycles, setClaimedCycles] = useState([])

  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMessage, setWithdrawMessage] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error(error)
        }

        if (!mounted) return

        setUser(user || null)

        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

          if (mounted) {
            setProfile(data || null)
          }
        }
      } catch (error) {
        console.error('User loading error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return

        setUser(session?.user || null)
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

    if (!email.trim() || !password) {
      setAuthError(
        'Please enter your email and password.'
      )
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
        const { data, error } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
          })

        if (error) throw error

        if (data.session) {
          setUser(data.user)
          setAuthMessage(
            'Account created successfully.'
          )
        } else {
          setAuthMessage(
            'Account created. Please confirm your email before logging in.'
          )
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })

        if (error) throw error

        setUser(data.user)
        setAuthMessage('Login successful.')
      }
    } catch (error) {
      setAuthError(
        error?.message ||
          'Authentication failed. Please try again.'
      )
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()

    setUser(null)
    setProfile(null)

    setDemoPackage(null)
    setDemoActivated(false)
    setDemoBalance(0)
    setClaimedCycles([])
    setWithdrawAmount('')
    setWithdrawMessage('')
  }

  function activateDemo(packageName) {
    const selected = PACKAGES[packageName]

    if (!selected) return

    setDemoPackage(packageName)
    setDemoActivated(true)

    // Demo-only starting balance.
    setDemoBalance(selected.activationBonus)

    setClaimedCycles([])
    setWithdrawMessage(
      `${packageName} DEMO activated successfully.`
    )
  }

  function claimDemoCycle() {
    if (!demoActivated || !demoPackage) return

    const cycle = cycleInfo.cycleNum
    const selected = PACKAGES[demoPackage]

    if (claimedCycles.includes(cycle)) {
      setWithdrawMessage(
        `Cycle ${cycle} has already been claimed in the demo.`
      )
      return
    }

    setDemoBalance(
      (current) => current + selected.perCycle
    )

    setClaimedCycles((current) => [
      ...current,
      cycle,
    ])

    setWithdrawMessage(
      `Demo reward of ₦${selected.perCycle} added for Cycle ${cycle}.`
    )
  }

  function requestDemoWithdrawal(event) {
    event.preventDefault()

    setWithdrawMessage('')

    const amount = Number(withdrawAmount)

    if (!amount || amount <= 0) {
      setWithdrawMessage(
        'Enter a valid withdrawal amount.'
      )
      return
    }

    if (amount > demoBalance) {
      setWithdrawMessage(
        'Withdrawal amount cannot exceed your demo balance.'
      )
      return
    }

    setWithdrawMessage(
      `DEMO withdrawal request received for ₦${amount.toLocaleString()}. In live mode, this will be sent to the admin for manual review and payment.`
    )

    setWithdrawAmount('')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-700">
            TAPBUMBER
          </h1>
          <p className="mt-2 text-gray-600">
            Loading...
          </p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          <div className="bg-green-700 text-white rounded-t-2xl p-7 text-center">
            <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
              DEMO VERSION
            </div>

            <h1 className="text-3xl font-bold">
              TAPBUMBER
            </h1>

            <p className="mt-2 text-sm">
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
                ? 'Log in to continue'
                : 'Create your TapBumber account'}
            </p>

            <form
              onSubmit={handleAuth}
              className="mt-6 space-y-4"
            >

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Email address"
                className="w-full border rounded-lg px-4 py-3"
                required
              />

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
                className="w-full border rounded-lg px-4 py-3"
                required
              />

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

            <button
              type="button"
              onClick={() => {
                setAuthMode(
                  authMode === 'login'
                    ? 'signup'
                    : 'login'
                )
                setAuthError('')
                setAuthMessage('')
              }}
              className="w-full mt-5 text-green-700 font-bold"
            >
              {authMode === 'login'
                ? 'Create a new account'
                : 'Already have an account? Log in'}
            </button>

          </div>
        </div>
      </main>
    )
  }

  const activePackage =
    demoPackage
      ? PACKAGES[demoPackage]
      : null

  const claimedCount = claimedCycles.length

  return (
    <main className="min-h-screen bg-gray-50 pb-10">

      <header className="bg-green-700 text-white p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-3">

          <div>
            <div className="text-xs font-bold text-yellow-300">
              DEMO MODE
            </div>

            <h1 className="text-2xl font-bold">
              TAPBUMBER
            </h1>

            <p className="text-xs">
              Earn • Refer • Manage Your Wallet
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-white text-green-700 px-3 py-2 rounded-lg font-bold text-sm"
          >
            Log Out
          </button>

        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-sm text-yellow-900">
          <strong>DEMO NOTICE:</strong> This version uses
          simulated activation, earnings and withdrawals.
          No real payment is processed here.
        </div>

        {/* WALLET */}

        <section className="bg-white rounded-2xl shadow p-5">

          <p className="text-gray-500 text-sm">
            Demo Available Balance
          </p>

          <p className="text-4xl font-bold text-green-700 mt-1">
            ₦{demoBalance.toLocaleString()}
          </p>

          <p className="text-xs text-gray-500 mt-2">
            Account: {user.email}
          </p>

        </section>

        {/* PACKAGE SELECTION */}

        {!demoActivated && (
          <section className="bg-white rounded-2xl shadow p-5">

            <h2 className="text-xl font-bold">
              Choose Your Package
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Demo activation only
            </p>

            <div className="grid gap-4 mt-4">

              {Object.entries(PACKAGES).map(
                ([name, item]) => (
                  <div
                    key={name}
                    className="border rounded-xl p-4"
                  >

                    <h3 className="text-lg font-bold">
                      {name}
                    </h3>

                    <p className="text-2xl font-bold text-green-700 mt-1">
                      ₦{item.activation.toLocaleString()}
                    </p>

                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <p>
                        Activation bonus: ₦
                        {item.activationBonus}
                      </p>

                      <p>
                        Per completed cycle: ₦
                        {item.perCycle}
                      </p>

                      <p>
                        Daily maximum: ₦
                        {(item.perCycle * 12).toLocaleString()}
                      </p>

                      <p>
                        Referral bonus: ₦
                        {item.referral}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        activateDemo(name)
                      }
                      className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-bold"
                    >
                      Activate {name} Demo
                    </button>

                  </div>
                )
              )}

            </div>
          </section>
        )}

        {/* ACTIVE PACKAGE */}

        {demoActivated && activePackage && (
          <section className="bg-white rounded-2xl shadow p-5">

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Active Package
              </h2>

              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                {demoPackage}
              </span>
            </div>

            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p>
                Reward: ₦{activePackage.perCycle}
                per completed cycle
              </p>

              <p>
                Referral: ₦{activePackage.referral}
              </p>

              <p>
                Daily maximum: ₦
                {(activePackage.perCycle * 12).toLocaleString()}
              </p>

              <p>
                Claimed today: {claimedCount} / 12
              </p>
            </div>

          </section>
        )}

        {/* CYCLE */}

        {demoActivated && activePackage && (
          <section className="bg-white rounded-2xl shadow p-5">

            <h2 className="text-xl font-bold">
              Earning Cycle
            </h2>

            <p className="text-3xl font-bold mt-2">
              Cycle {cycleInfo.cycleNum} of 12
            </p>

            <p className="text-sm text-gray-500 mt-3">
              Current cycle countdown
            </p>

            <p className="text-4xl font-mono font-bold text-green-700 mt-1">
              {formatCountdown(
                cycleInfo.minutesRemaining
              )}
            </p>

            <button
              onClick={claimDemoCycle}
              disabled={
                claimedCycles.includes(
                  cycleInfo.cycleNum
                )
              }
              className="w-full mt-5 bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold"
            >
              {claimedCycles.includes(
                cycleInfo.cycleNum
              )
                ? 'Cycle Already Claimed'
                : `Demo Claim ₦${activePackage.perCycle}`}
            </button>

          </section>
        )}

        {/* WITHDRAWAL */}

        {demoActivated && (
          <section className="bg-white rounded-2xl shadow p-5">

            <h2 className="text-xl font-bold">
              Withdrawal
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Demo withdrawal request
            </p>

            <form
              onSubmit={requestDemoWithdrawal}
              className="mt-4 space-y-3"
            >

              <input
                type="number"
                min="1"
                value={withdrawAmount}
                onChange={(e) =>
                  setWithdrawAmount(
                    e.target.value
                  )
                }
                placeholder="Enter amount"
                className="w-full border rounded-lg px-4 py-3"
              />

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold"
              >
                Request Demo Withdrawal
              </button>

            </form>

            {withdrawMessage && (
              <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-sm">
                {withdrawMessage}
              </div>
            )}

          </section>
        )}

        {/* REFERRAL */}

        <section className="bg-white rounded-2xl shadow p-5">

          <h2 className="text-xl font-bold">
            Referral
          </h2>

          <p className="text-sm text-gray-600 mt-2">
            Invite others and earn the referral bonus
            associated with your package.
          </p>

          {demoPackage && (
            <div className="mt-3 bg-green-50 rounded-lg p-3">
              Referral bonus:
              <strong className="ml-1">
                ₦{activePackage.referral}
              </strong>
            </div>
          )}

        </section>

        {/* WHATSAPP */}

        <section className="bg-white rounded-2xl shadow p-5">

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