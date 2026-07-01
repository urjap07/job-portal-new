import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/router'
import styles from '../styles/AdminJobList.module.css'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface Job {
  id: number
  job_id: string
  firm: string
  client_name: string
  created_at: string
  job_received_date: string
  mode_received: string
  job_description: string
  status: string
  invoice_raised: boolean
  payment_received: boolean
  invoice_amount?: number
  type_of_job?: string
}

const FIRMS = ['Datachef', 'Techsahyogi'] as const
type Firm = typeof FIRMS[number]

const STATUS_OPTIONS = ['New', 'In Progress', 'Completed', 'Pending', 'Cancelled']

const AdminDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFirm, setSelectedFirm] = useState<Firm>('Datachef')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    try {
      const res = await axios.get('/api/jobs/all')
      setJobs(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to fetch jobs', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, jobId: string) => {
    if (!confirm(`Delete job ${jobId}? This cannot be undone.`)) return
    try {
      await axios.delete(`/api/jobs/${id}`)
      setJobs(prev => prev.filter(j => j.id !== id))
    } catch (err) {
      alert('Failed to delete job')
    }
  }

  const handleLogout = () => router.push('/login')

  const exportToExcel = () => {
    const visible = filteredJobs
    if (visible.length === 0) { alert('No data to export'); return }

    const exportData = visible.map(job => ({
      'Date': job.created_at ? job.created_at.slice(0, 10) : '',
      'Job ID': job.job_id,
      'Firm': job.firm || 'Datachef',
      'Received Date': job.job_received_date ? job.job_received_date.slice(0, 10) : '',
      'Client Name': job.client_name,
      'Description': job.job_description,
      'Type of Job': job.type_of_job || '',
      'Status': job.status,
      'Invoice Raised': job.invoice_raised ? 'Yes' : 'No',
      'Invoice Amount': job.invoice_amount ? `₹${job.invoice_amount}` : '',
      'Payment Received': job.payment_received ? 'Yes' : 'No',
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jobs')
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `jobs_${selectedFirm}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const filteredJobs = jobs
    .filter(j => (j.firm || 'Datachef') === selectedFirm)
    .filter(j => !statusFilter || j.status === statusFilter)
    .filter(j => {
      if (!search) return true
      const s = search.toLowerCase()
      return j.client_name?.toLowerCase().includes(s) || j.job_id?.toLowerCase().includes(s)
    })

  if (loading) return <div className={styles.loadingContainer}>Loading jobs...</div>

  return (
    <div className={styles.container}>

      {/* Row 1: heading + buttons */}
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Admin Dashboard</h1>
        <div className={styles.headerButtons}>
          <Link href={`/user/job-entry?firm=${selectedFirm}`} legacyBehavior>
            <a className={styles.createJobLink}>Create New Job</a>
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Row 2: search | status | firm | export */}
      <div className={styles.filterRow}>
        <input
          type="text"
          placeholder="Search by Client or Job ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className={styles.statusSelect}
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={selectedFirm}
          onChange={e => setSelectedFirm(e.target.value as Firm)}
          className={styles.firmSelect}
        >
          {FIRMS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <button onClick={exportToExcel} className={`${styles.exportBtn} ${styles.exportSpacer}`}>
          Export to Excel
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              <th className={styles.th}>Date ▼</th>
              <th className={styles.th}>Job ID</th>
              <th className={styles.th}>Received Date</th>
              <th className={styles.th}>Client Name</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Type of Job</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Invoice Raised</th>
              <th className={styles.th}>Invoice Amount</th>
              <th className={styles.th}>Payment Received</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={11} className={styles.emptyRow}>
                  No jobs found{statusFilter ? ` with status "${statusFilter}"` : ''}{search ? ` matching "${search}"` : ''}.
                </td>
              </tr>
            ) : filteredJobs.map(job => (
              <tr key={job.id} className={styles.tbodyRow}>
                <td className={styles.td}>
                  {job.created_at ? job.created_at.slice(0, 10) : '—'}
                </td>
                <td className={styles.td}>{job.job_id}</td>
                <td className={styles.td}>
                  {job.job_received_date ? job.job_received_date.slice(0, 10) : '—'}
                </td>
                <td className={styles.td}>{job.client_name}</td>
                <td className={styles.td}>
                  <span title={job.job_description}>
                    {job.job_description?.length > 40
                      ? job.job_description.slice(0, 40) + '...'
                      : job.job_description}
                  </span>
                </td>
                <td className={styles.td}>
                  <span title={job.type_of_job}>
                    {job.type_of_job && job.type_of_job.length > 30
                      ? job.type_of_job.slice(0, 30) + '...'
                      : job.type_of_job || '—'}
                  </span>
                </td>
                <td className={styles.td}>{job.status}</td>
                <td className={styles.td}>{job.invoice_raised ? 'Yes' : 'No'}</td>
                <td className={styles.td}>
                  {job.invoice_amount ? `₹${job.invoice_amount}` : ''}
                </td>
                <td className={styles.td}>
                  {job.payment_received ? 'Yes' : 'No'}
                </td>
                <td className={styles.td}>
                  <div className={styles.actionCell}>
                    <Link href={`/admin/jobs/${job.id}`} legacyBehavior>
                      <a className={styles.editBtn}>Edit</a>
                    </Link>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(job.id, job.job_id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboard
