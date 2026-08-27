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

        if (!user) {
          setLoading(false)
          return
        }

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        if (!mounted) return

        setProfile(profileData)

        const {
          data: walletData,
          error: walletError,
        } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!walletError && walletData) {
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

    const timer = setInterval(() => {
      setCycleInfo(getCurrentCycleInfo())
    }, 1000)

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  const selectedPackage = profile?.package
    ? PACKAGES[profile.package]
    : null

  const reward = selectedPackage?.perCycle || 0
  const maxDaily = reward * 12

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-700">
            TAPBUMBER
          </h1>
          <p className="mt-2 text-gray-600">
            Loading your dashboard...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-green-700 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">
          TAPBUMBER
        </h1>

        <p className="text-sm">
          Nigerian Naira Earning Platform
        </p>
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
            ₦{Number(wallet.available_balance || 0).toFixed(2)}
          </p>
        </section>

        {/* ACCOUNT */}
        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold text-lg mb-2">
            Account
          </h2>

          <p className="text-sm text-gray-600">
            User ID
          </p>

          <p className="font-medium break-all">
            {user?.id || 'Not logged in'}
          </p>

          <div className="mt-3">
            <p className="text-sm text-gray-600">
              Activation Status
            </p>

            <p className="font-bold">
              {profile?.activation_status || 'Not Activated'}
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