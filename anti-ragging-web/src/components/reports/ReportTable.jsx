import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

export const ReportTable = ({ reports, basePath = '' }) => {
  if (!reports || reports.length === 0) {
    return null // handled by empty state outside usually
  }

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-4">ID</th>
              <th scope="col" className="px-6 py-4">Title / Date</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4">Created At</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  #{report.id?.toString().slice(-6).toUpperCase()}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 line-clamp-1">{report.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(report.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`${basePath}/${report.id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    View <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
