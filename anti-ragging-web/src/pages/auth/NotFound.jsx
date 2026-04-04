import { Link } from 'react-router-dom'
import { Button } from '../../components/forms/Button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-gray-50 text-center">
      <h1 className="text-9xl font-bold text-gray-200 font-display">404</h1>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Page not found</h2>
      <p className="mt-4 text-base text-gray-500 max-w-sm mx-auto">
        Sorry, we couldn’t find the page you’re looking for. It might have been removed or moved to a different location.
      </p>
      <div className="mt-8">
        <Link to="/">
          <Button variant="primary" size="lg">Go back home</Button>
        </Link>
      </div>
    </div>
  )
}
