import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'
import styles from '../../styles/AdminJobEdit.module.css'

interface Job {
  id: number
  job_id: string
  client_name: string
  client_email: string
  client_phone: string
  mode_received: string
  job_description: string
  type_of_job?: string
  assigned_to: number
  target_completion_date: string
  status: string
  invoice_raised?: boolean
  is_delivered?: boolean
  invoice_number?: string
  invoice_amount?: number
  payment_received?: boolean
  payment_mode?: string
  payment_reference?: string
  job_received_date?: string
}

const STATUS_OPTIONS = ['New', 'In Progress', 'Completed', 'Pending', 'Cancelled']

interface JobUpdateForm {
  status: string
  invoice_raised: boolean
  is_delivered: boolean
  invoice_number: string
  invoice_amount: string
  payment_received: boolean
  payment_mode: string
  payment_reference: string
  job_received_date: string
  type_of_job?: string
}

export default function AdminJobEdit() {
  const router = useRouter()
  const { id } = router.query

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState<JobUpdateForm>({
    status: 'New',
    invoice_raised: false,
    is_delivered: false,
    invoice_number: '',
    invoice_amount: '',
    payment_received: false,
    payment_mode: '',
    payment_reference: '',
    job_received_date: '',
    type_of_job: '',
  })

  useEffect(() => {
    if (!id) return

    async function fetchJob() {
      try {
        const res = await axios.get(`/api/jobs/${id}`)
        setJob(res.data)

        setForm({
          status: res.data.status || 'New',
          invoice_raised: !!res.data.invoice_raised,
          is_delivered: !!res.data.is_delivered,
          invoice_number: res.data.invoice_number || '',
          invoice_amount: res.data.invoice_amount ? res.data.invoice_amount.toString() : '',
          payment_received: !!res.data.payment_received,
          payment_mode: res.data.payment_mode || '',
          payment_reference: res.data.payment_reference || '',
          job_received_date: res.data.job_received_date
            ? res.data.job_received_date.split('T')[0]
            : '',
          type_of_job: res.data.type_of_job || '',
        })
      } catch (err) {
        setError('Failed to load job details')
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  if (loading) return <p className={styles.loading}>Loading...</p>
  if (error) return <p className={styles.error}>{error}</p>
  if (!job) return <p className={styles.error}>No job found</p>

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target
    const name = target.name
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value

    setForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !form.invoice_number.trim() ||
      !form.invoice_amount.trim() ||
      !form.payment_mode.trim() ||
      !form.payment_reference.trim() ||
      !form.job_received_date.trim()
    ) {
      alert('Please fill in all required fields.')
      return
    }

    try {
      await axios.put(`/api/jobs/${id}/update`, {
        ...form,
        invoice_amount: parseFloat(form.invoice_amount) || 0,
        job_received_date: form.job_received_date,
      })
      alert('Job updated successfully!')
      router.push('/admin/jobs')
    } catch (err) {
      alert('Failed to update job')
      console.error(err)
    }
  }

  return (
    <div className={styles.container}>
      <h1>Edit Job: {job.job_id}</h1>

      <section className={styles.basicDetails}>
        <h2>Basic Details (read-only)</h2>
        <p><strong>Client Name:</strong> {job.client_name}</p>
        <p><strong>Client Email:</strong> {job.client_email}</p>
        <p><strong>Client Phone:</strong> {job.client_phone}</p>
        <p><strong>Mode Received:</strong> {job.mode_received}</p>
        <p><strong>Job Description:</strong> {job.job_description}</p>
        <p><strong>Type of Job:</strong> {job.type_of_job || '—'}</p>
        <p><strong>Assigned To (ID):</strong> {job.assigned_to}</p>
        <p><strong>Target Completion Date:</strong> {job.target_completion_date}</p>
        <p><strong>Job Received Date:</strong> {job.job_received_date ? new Date(job.job_received_date).toLocaleDateString() : 'N/A'}</p>
      </section>

      <section className={styles.updateSection}>
        <h2>Update Delivery, Invoice & Payment</h2>
        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.statusGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className={styles.checkboxGroup}>
            <label htmlFor="invoice_raised">
              <input
                type="checkbox"
                id="invoice_raised"
                name="invoice_raised"
                checked={form.invoice_raised}
                onChange={handleChange}
              /> Invoice Raised
            </label>

            <label htmlFor="is_delivered">
              <input
                type="checkbox"
                id="is_delivered"
                name="is_delivered"
                checked={form.is_delivered}
                onChange={handleChange}
              /> Job Delivered
            </label>

            <label htmlFor="payment_received">
              <input
                type="checkbox"
                id="payment_received"
                name="payment_received"
                checked={form.payment_received}
                onChange={handleChange}
              /> Payment Received
            </label>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="invoice_number">Invoice Number</label>
            <input
              id="invoice_number"
              type="text"
              name="invoice_number"
              value={form.invoice_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="invoice_amount">Invoice Amount</label>
            <input
              id="invoice_amount"
              type="number"
              name="invoice_amount"
              value={form.invoice_amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="payment_mode">Payment Mode</label>
            <input
              id="payment_mode"
              type="text"
              name="payment_mode"
              value={form.payment_mode}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="payment_reference">Payment Reference</label>
            <input
              id="payment_reference"
              type="text"
              name="payment_reference"
              value={form.payment_reference}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="job_received_date">Job Received Date</label>
            <input
              id="job_received_date"
              type="date"
              name="job_received_date"
              value={form.job_received_date}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Save Updates
          </button>
        </form>
      </section>
    </div>
  )
}
