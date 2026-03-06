import { Link } from 'react-router-dom'
import { Calendar, FileText, ChevronRight } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

export const ReportCard = ({ report, to }) => {
  const date = new Date(report.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="flex flex-col p-5 transition-all duration-200 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 group">
      <div className="flex items-start justify-between mb-3">
        <StatusBadge status={report.status} />
        <span className="flex items-center text-xs text-gray-400">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {date}
        </span>
      </div>
      
      <h3 className="mb-2 text-base font-semibold text-gray-900 line-clamp-1">
        {report.title || 'Incident Report'}
      </h3>
      
      <p className="flex-1 mb-4 text-sm text-gray-500 line-clamp-2">
        {report.description || 'No description provided.'}
      </p>

      <div className="pt-3 mt-auto border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500">
          <FileText className="w-3.5 h-3.5 mr-1" />
          ID: #{report.id?.toString().slice(-6).toUpperCase() || 'N/A'}
        </div>
        
        {to && (
          <Link 
            to={to} 
            className="flex items-center text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-700"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  )
}
