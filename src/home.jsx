import { useEffect, useState, useCallback, useRef } from 'react'

const API = import.meta.env.VITE_API_URL

const isSuccess = (code) => code >= 200 && code < 300

const timeAgo = (value) => {
  const s = Math.floor((Date.now() - new Date(value)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function StatusBadge({ code }) {
  if (!code) return (
    <span className="text-[11px] font-mono text-slate-400">—</span>
  )
  return (
    <span className={`text-[11px] font-mono font-semibold ${isSuccess(code) ? 'text-emerald-600' : 'text-red-500'}`}>
      {code}
    </span>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5 bg-white rounded-xl border border-slate-200">
      <div className="flex-1 space-y-2">
        <div className="h-3 w-[55%] bg-slate-100 rounded animate-pulse" />
        <div className="h-2.5 w-[25%] bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="h-3 w-[10%] bg-slate-100 rounded animate-pulse" />
    </div>
  )
}

function ErrorModal({ url, pingUrl, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-red-400 font-semibold shrink-0">
            ERROR SNAPSHOT
          </span>
          <span className="text-xs font-mono text-slate-400 truncate">
            {pingUrl}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs font-mono transition-colors shrink-0 ml-4"
        >
          ESC · Close
        </button>
      </div>
      <iframe
        src={url}
        className="flex-1 w-full border-0 bg-white"
        title="Error Snapshot"
      />
    </div>
  )
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [urls, setUrls] = useState([])
  const [pings, setPings] = useState({})
  const [toast, setToast] = useState(null)
  const [countdown, setCountdown] = useState(60)
  const [urlsLoading, setUrlsLoading] = useState(true)
  const [pingsLoading, setPingsLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const countdownRef = useRef(60)
  const isLoading = urlsLoading || pingsLoading

  const showToast = (type, message) => {
    setToast({ type, message })
    clearTimeout(showToast._t)
    showToast._t = setTimeout(() => setToast(null), 3500)
  }

  const fetchUrls = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/urls/`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUrls(Array.isArray(data) ? data : [])
    } catch {
      showToast('error', 'Failed to load URLs.')
    } finally {
      setUrlsLoading(false)
    }
  }, [])

  const fetchPings = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/url-checks/`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      const map = {}
      data.forEach(p => { map[p.url] = p })
      setPings(map)
    } catch { }
    finally {
      setPingsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUrls()
    fetchPings()
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      countdownRef.current -= 1
      setCountdown(countdownRef.current)
      if (countdownRef.current <= 0) {
        countdownRef.current = 60
        setCountdown(60)
        fetchPings()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const handleAdd = async () => {
    if (!url.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/urls/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.url?.[0] || 'Failed to save URL.')
      }
      setUrl('')
      showToast('success', 'URL added successfully.')
      await fetchUrls()
    } catch (e) {
      showToast('error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewError = async (pingId, pingUrl) => {
    try {
      const res = await fetch(`${API}/api/pings/${pingId}/snapshot/`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setModal({ url: data.snapshot_url, pingUrl })
    } catch {
      showToast('error', 'Snapshot not available.')
    }
  }

  const upCount = urls.filter(u => isSuccess(pings[u.id]?.status_code)).length
  const downCount = urls.filter(u => pings[u.id] && !isSuccess(pings[u.id]?.status_code)).length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>

      {modal && (
        <ErrorModal
          url={modal.url}
          pingUrl={modal.pingUrl}
          onClose={() => setModal(null)}
        />
      )}

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-sm font-semibold text-slate-900 tracking-tight">PulseCheck</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            next check in {countdown}s
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-10">

        {/* Stats */}
        {!isLoading && urls.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Total', value: urls.length, color: 'text-slate-900' },
              { label: 'Up', value: upCount, color: 'text-emerald-600' },
              { label: 'Down', value: downCount, color: 'text-red-500' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add URL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-3">
            Add Website URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="https://example.com"
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white outline-none rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all"
            />
            <button
              onClick={handleAdd}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-all active:scale-95 whitespace-nowrap"
            >
              {loading ? 'Adding...' : 'Add URL'}
            </button>
          </div>
          {toast && (
            <p className={`mt-3 text-xs font-mono ${toast.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
              {toast.type === 'success' ? '✓' : '✕'} {toast.message}
            </p>
          )}
        </div>

        {/* URL List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              Monitored URLs
            </p>
            <span className="text-[11px] font-mono text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
              {urls.length} url{urls.length !== 1 ? 's' : ''}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : urls.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 text-sm">No URLs monitored yet.</p>
              <p className="text-slate-300 text-xs mt-1 font-mono">Add one above to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {urls.map(u => {
                const ping = pings[u.id]
                const hasError = ping && !isSuccess(ping.status_code)
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-4 px-4 py-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{u.url}</p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {ping ? `checked ${timeAgo(ping.time)}` : `added ${timeAgo(u.created_at)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge code={ping?.status_code} />
                      {hasError && ping.has_snapshot && (
                        <button
                          onClick={() => handleViewError(ping.id, u.url)}
                          className="text-[11px] font-mono text-slate-500 hover:text-red-500 underline underline-offset-2 transition-colors whitespace-nowrap"
                        >
                          View Error
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}