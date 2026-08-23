export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>TapBumber</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Tap and earn 24/7</p>
      <button style={{
        padding: '1rem 2rem',
        fontSize: '1.2rem',
        borderRadius: '50px',
        border: 'none',
        background: '#fff',
        color: '#667eea',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}>
        TAP TO START
      </button>
    </main>
  )
}