import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/AdminJobList.module.css'

interface Job {
  id: number
  job_id: string
  firm: string
  client_name: string
  job_received_date: string
  job_description: string
  status: string
}

const FIRMS = ['Datachef', 'Techsahyogi'] as const
type Firm = typeof FIRMS[number]

const UserDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFirm, setSelectedFirm] = useState<Firm>('Datachef')
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs/all')
        const data = await res.json()
        setJobs(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch jobs', error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const filteredJobs = jobs
    .filter(j => (j.firm || 'Datachef') === selectedFirm)
    .filter(j => {
      if (!search) return true
      const s = search.toLowerCase()
      return j.client_name?.toLowerCase().includes(s) || j.job_id?.toLowerCase().includes(s)
    })

  if (loading) return <div className={styles.loadingContainer}>Loading jobs...</div>

  return (
    <div className={styles.container}>

      {/* Row 1: heading + logout */}
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>User Dashboard</h1>
        <div className={styles.headerButtons}>
          <Link href={`/user/job-entry?firm=${selectedFirm}`} legacyBehavior>
            <a className={styles.createJobLink}>Create New Job</a>
          </Link>
          <button onClick={() => router.push('/login')} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Row 2: search + firm */}
      <div className={styles.filterRow}>
        <input
          type="text"
          placeholder="Search by Client or Job ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={selectedFirm}
          onChange={e => setSelectedFirm(e.target.value as Firm)}
          className={styles.firmSelect}
        >
          {FIRMS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              <th className={styles.th}>Job Received Date</th>
              <th className={styles.th}>Job ID</th>
              <th className={styles.th}>Client Name</th>
              <th className={styles.th}>Job Description</th>
              <th className={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyRow}>
                  No jobs found{search ? ` matching "${search}"` : ''}.
                </td>
              </tr>
            ) : filteredJobs.map(job => (
              <tr key={job.id} className={styles.tbodyRow}>
                <td className={styles.td}>
                  {job.job_received_date ? job.job_received_date.slice(0, 10) : '—'}
                </td>
                <td className={styles.td}>{job.job_id}</td>
                <td className={styles.td}>{job.client_name}</td>
                <td className={styles.td}>
                  <span title={job.job_description}>
                    {job.job_description?.length > 50
                      ? job.job_description.slice(0, 50) + '...'
                      : job.job_description}
                  </span>
                </td>
                <td className={styles.td}>{job.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserDashboard
