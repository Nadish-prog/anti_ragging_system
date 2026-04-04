import { useState, useEffect } from 'react'
import { Activity, ShieldAlert, FileText, CheckCircle, BarChart3, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { reportService } from '../../services/reportService'
import { Loader } from '../../components/ui/Loader'
import { ErrorMessage } from '../../components/ui/ErrorMessage'

export default function AdminAnalytics() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const data = await reportService.getAllReports()
      const reportsList = Array.isArray(data) ? data : (data.complaints || [])
      setReports(reportsList)
    } catch (err) {
      console.error(err)
      setError('Failed to load system analytics.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader fullScreen />

  // Data Aggregations
  const total = reports.length
  
  // 1. By Severity
  const severityCounts = {
    critical: reports.filter(r => r.severity?.toLowerCase() === 'critical').length,
    high: reports.filter(r => r.severity?.toLowerCase() === 'high').length,
    medium: reports.filter(r => r.severity?.toLowerCase() === 'medium').length,
    low: reports.filter(r => r.severity?.toLowerCase() === 'low').length,
  }

  // 2. By Status
  const statusCounts = {
    open: reports.filter(r => r.status?.toLowerCase() === 'open').length,
    investigating: reports.filter(r => r.status?.toLowerCase() === 'investigating').length,
    rejected: reports.filter(r => r.status?.toLowerCase() === 'rejected').length,
    closed: reports.filter(r => r.status?.toLowerCase() === 'closed').length,
  }

  // Helper for Percentage
  const getPct = (val) => total > 0 ? Math.round((val / total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-blue-600" /> System Analytics
        </h1>
        <p className="mt-1 text-sm text-gray-500">Live platform metrics and incident volume distributions.</p>
      </div>

      <ErrorMessage message={error} className="mb-6" />

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
           <p className="text-sm font-medium text-gray-500 mb-1">Total Reports Processed</p>
           <h3 className="text-3xl font-bold text-gray-900">{total}</h3>
        </div>
        <div className="p-6 bg-red-50/50 border border-red-100 rounded-xl shadow-sm">
           <p className="text-sm font-medium text-red-600 mb-1">Critical Incidents</p>
           <h3 className="text-3xl font-bold text-red-700">{severityCounts.critical}</h3>
        </div>
        <div className="p-6 bg-yellow-50/50 border border-yellow-100 rounded-xl shadow-sm">
           <p className="text-sm font-medium text-yellow-600 mb-1">Active Investigations</p>
           <h3 className="text-3xl font-bold text-yellow-700">{statusCounts.investigating}</h3>
        </div>
        <div className="p-6 bg-green-50/50 border border-green-100 rounded-xl shadow-sm">
           <p className="text-sm font-medium text-green-600 mb-1">Successfully Closed</p>
           <h3 className="text-3xl font-bold text-green-700">{statusCounts.closed}</h3>
        </div>
      </div>

      {/* Detail Breakdown Charts (CSS based natively) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Severity Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
          <h2 className="text-lg font-bold text-gray-900 font-display mb-6 flex items-center">
             <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" /> Severity Breakdown
          </h2>
          
          <div className="space-y-6 flex-1 justify-center flex flex-col">
            {/* Critical */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Critical</span>
                <span className="text-gray-500">{severityCounts.critical} ({getPct(severityCounts.critical)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-red-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${getPct(severityCounts.critical)}%` }}></div>
              </div>
            </div>

            {/* High */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">High</span>
                <span className="text-gray-500">{severityCounts.high} ({getPct(severityCounts.high)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${getPct(severityCounts.high)}%` }}></div>
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Medium</span>
                <span className="text-gray-500">{severityCounts.medium} ({getPct(severityCounts.medium)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-yellow-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${getPct(severityCounts.medium)}%` }}></div>
              </div>
            </div>

            {/* Low */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Low</span>
                <span className="text-gray-500">{severityCounts.low} ({getPct(severityCounts.low)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${getPct(severityCounts.low)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
          <h2 className="text-lg font-bold text-gray-900 font-display mb-6 flex items-center">
             <Activity className="w-5 h-5 mr-2 text-blue-500" /> Resolution Funnel
          </h2>
          
          <div className="space-y-6 flex-1 justify-center flex flex-col">
            {/* Open */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Open Queues</span>
                <span className="text-gray-500">{statusCounts.open} ({getPct(statusCounts.open)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-300 h-2.5 rounded-full transition-all duration-500" style={{ width: `${getPct(statusCounts.open)}%` }}></div>
              </div>
            </div>

            {/* Investigating */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Currently Investigating</span>
                <span className="text-gray-500">{statusCounts.investigating} ({getPct(statusCounts.investigating)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-yellow-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${getPct(statusCounts.investigating)}%` }}></div>
              </div>
            </div>

            {/* Rejected */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Rejected / Invalid</span>
                <span className="text-gray-500">{statusCounts.rejected} ({getPct(statusCounts.rejected)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gray-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${getPct(statusCounts.rejected)}%` }}></div>
              </div>
            </div>

            {/* Closed */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Closed Successfully</span>
                <span className="text-gray-500">{statusCounts.closed} ({getPct(statusCounts.closed)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${getPct(statusCounts.closed)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
