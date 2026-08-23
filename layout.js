import './globals.css'

export const metadata = {
  title: 'TapBumber',
  description: 'Tap and earn 24/7',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}