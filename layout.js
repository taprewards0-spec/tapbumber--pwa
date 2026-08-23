export const metadata = {
  title: 'TapBumber',
  description: 'Tap to Earn',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}