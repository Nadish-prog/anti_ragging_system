import { Loader2 } from 'lucide-react'

export const Loader = ({ size = 24, className = '', fullScreen = false }) => {
  const content = (
    <div className={`flex flex-col items-center justify-center text-[var(--color-primary-500)] ${className}`}>
      <Loader2 size={size} className="animate-spin" />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}
