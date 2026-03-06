export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-100 rounded-xl shadow-sm">
      {Icon && (
        <div className="flex items-center justify-center w-16 h-16 mb-4 text-gray-400 bg-gray-50 rounded-full">
          <Icon size={32} />
        </div>
      )}
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mb-4 text-sm text-gray-500 max-w-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
