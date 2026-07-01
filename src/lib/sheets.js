// Tiny, dependency-free CSV layer for published Google Sheets.
// `useSheet(url, mapRow, fallback)` fetches + parses a published-CSV URL and
// returns mapped rows; while loading (or if the URL is empty / the fetch
// fails) it returns the provided fallback so the UI always has content.
import { useEffect, useRef, useState } from 'react'

// Parse CSV text into an array of row objects keyed by lowercased header.
// Handles quoted fields, embedded commas/newlines and "" escapes, and CRLF.
export function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  const pushField = () => { row.push(field); field = '' }
  const pushRow = () => { rows.push(row); row = [] }

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      pushField()
    } else if (c === '\n') {
      pushField(); pushRow()
    } else if (c === '\r') {
      // swallow; \n handles the row break
    } else {
      field += c
    }
  }
  // trailing field/row
  if (field.length || row.length) { pushField(); pushRow() }

  if (!rows.length) return []
  const headers = rows[0].map((h) => h.trim().toLowerCase())
  return rows.slice(1)
    .filter((r) => r.some((v) => v.trim() !== '')) // drop blank lines
    .map((r) => {
      const obj = {}
      headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim() })
      return obj
    })
}

// Case/space-insensitive column accessor: pick(row, 'Session Name', 'session').
export function pick(row, ...names) {
  for (const n of names) {
    const key = n.trim().toLowerCase()
    if (row[key] != null && row[key] !== '') return row[key]
  }
  return ''
}

export async function fetchSheet(url) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`sheet ${res.status}`)
  return parseCSV(await res.text())
}

// React hook. mapRow maps a parsed row object → your shape; rows that map to a
// falsy value are dropped. `ready` flips true once live data has loaded.
export function useSheet(url, mapRow, fallback = []) {
  const [data, setData] = useState(fallback)
  const [ready, setReady] = useState(false)
  const [source, setSource] = useState(url ? 'loading' : 'fallback')
  const mapRef = useRef(mapRow)
  mapRef.current = mapRow

  useEffect(() => {
    let alive = true
    if (!url) { setData(fallback); setReady(true); setSource('fallback'); return }
    setReady(false); setSource('loading')
    fetchSheet(url)
      .then((rows) => {
        if (!alive) return
        const mapped = rows.map((r, i) => mapRef.current(r, i)).filter(Boolean)
        setData(mapped.length ? mapped : fallback)
        setSource(mapped.length ? 'sheet' : 'fallback')
        setReady(true)
      })
      .catch(() => {
        if (!alive) return
        setData(fallback); setSource('fallback'); setReady(true)
      })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return { data, ready, source }
}
