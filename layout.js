import './globals.css'

export const metadata = {
  title: 'TapBumber',
  description: 'Tap to earn BUMBER',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}