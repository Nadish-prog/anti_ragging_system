import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <div className="min-h-screen font-sans bg-[var(--color-background)] text-[var(--color-primary-900)]">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  )
}

export default App
