import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/JobEntryForm.module.css'

interface Employee {
  id: number
  name: string
}

interface Code {
  item: string
  hsn_code: string
}

const FIRMS = ['Datachef', 'Techsahyogi'] as const
type Firm = typeof FIRMS[number]

const JobEntryForm = () => {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [codes, setCodes] = useState<Code[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [loadingCodes, setLoadingCodes] = useState(true)

  const todayDate = new Date().toISOString().split('T')[0]
  const [firm, setFirm] = useState<Firm>('Datachef')

  // Pre-select firm from ?firm= query param set by the dashboard
  useEffect(() => {
    if (router.isReady) {
      const q = router.query.firm
      if (q === 'Techsahyogi') setFirm('Techsahyogi')
      else setFirm('Datachef')
    }
  }, [router.isReady, router.query.firm])

  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    job_received_date: todayDate,
    mode_received: 'Email',
    job_description: '',
    type_of_job: '',
    assigned_to: '',
    target_completion_date: '',
  })

  useEffect(() => {
    async function fetchCodes() {
      try {
        const res = await fetch('/api/codes')
        const data = await res.json()
        setCodes(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching codes:', error)
      } finally {
        setLoadingCodes(false)
      }
    }
    fetchCodes()
  }, [])

  // Re-fetch employees whenever firm changes
  useEffect(() => {
    async function fetchEmployees() {
      setLoadingEmployees(true)
      setForm(prev => ({ ...prev, assigned_to: '' }))
      try {
        const res = await fetch(`/api/users?firm=${firm}`)
        if (!res.ok) throw new Error('Failed to fetch employees')
        const data: Employee[] = await res.json()
        setEmployees(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingEmployees(false)
      }
    }
    fetchEmployees()
  }, [firm])

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value } = e.target
  console.log('Field:', name, 'Value:', value)  // ✅ Add this
  setForm({ ...form, [name]: value })
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting form:', form)
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          firm,
          assigned_to: parseInt(form.assigned_to, 10),
        }),
      })
      alert('Job created successfully!')
      setForm({
        client_name: '',
        client_email: '',
        client_phone: '',
        job_received_date: todayDate,
        mode_received: 'Email',
        job_description: '',
        type_of_job: '',
        assigned_to: '',
        target_completion_date: '',
      })
    } catch (err) {
      console.error('Error creating job', err)
      alert('Failed to create job')
    }
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className={styles.heading} style={{ margin: 0 }}>New Job Entry</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#555' }}>Firm:</span>
          <select
            value={firm}
            onChange={(e) => setFirm(e.target.value as Firm)}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '2px solid #1d4ed8',
              color: '#1d4ed8',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            {FIRMS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>
            ({firm === 'Datachef' ? 'DC-' : 'TS-'}###)
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label className={styles.label}>Client Name</label>
        <input
          type="text"
          name="client_name"
          value={form.client_name}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <label className={styles.label}>Client Email</label>
        <input
          type="email"
          name="client_email"
          value={form.client_email}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <label className={styles.label}>Client Phone</label>
        <input
          type="tel"
          name="client_phone"
          value={form.client_phone}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <label className={styles.label}>Job Received Date</label>
        <input
          type="date"
          name="job_received_date"
          value={form.job_received_date}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <label className={styles.label}>Mode Received</label>
        <select
          name="mode_received"
          value={form.mode_received}
          onChange={handleChange}
          required
          className={styles.select}
        >
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Physical Documents">Physical Documents</option>
          <option value="Other">Other</option>
        </select>

        <label className={styles.label}>Job Description</label>
        <textarea
          name="job_description"
          value={form.job_description}
          onChange={handleChange}
          required
          className={styles.textarea}
        />

        {/* ✅ Type of Job Dropdown */}
        <label className={styles.label}>Type of Job</label>
        <select
          name="type_of_job"
          value={form.type_of_job}
          onChange={handleChange}
          required
          className={styles.select}
          disabled={loadingCodes}
        >
          <option value="">
            {loadingCodes ? 'Loading...' : 'Select Type of Job'}
          </option>
          {codes.map((code, index) => (
            <option key={index} value={`${code.item} (${code.hsn_code})`}>
            {code.item} ({code.hsn_code})
          </option>
          ))}
        </select>

        <label className={styles.label}>Assign to</label>
        <select
          name="assigned_to"
          value={form.assigned_to}
          onChange={handleChange}
          required
          className={styles.select}
          disabled={loadingEmployees}
        >
          <option value="">
            {loadingEmployees ? 'Loading employees...' : 'Select Employee'}
          </option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id.toString()}>
              {emp.name}
            </option>
          ))}
        </select>

        <label className={styles.label}>Target Completion Date</label>
        <input
          type="date"
          name="target_completion_date"
          value={form.target_completion_date}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <button type="submit" className={styles.button}>
          Create Job
        </button>
      </form>
    </div>
  )
}

export default JobEntryForm
