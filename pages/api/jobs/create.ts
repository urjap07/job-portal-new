import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

// Setup DB connection
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'job_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Only POST requests allowed' })
  }

  try {
    const {
      client_name,
      client_email,
      client_phone,
      mode_received,
      job_description,
      type_of_job,
      assigned_to,
      target_completion_date,
      job_received_date,
    } = req.body

    // Generate job_id like DC-101, DC-102...
    const [latest] = await pool.query('SELECT MAX(id) AS maxId FROM job')
    const maxId = (latest as any)[0]?.maxId || 100
    const jobId = `DC-${maxId + 1}`

    // Insert into MySQL
    await pool.query(
      `INSERT INTO job (
        job_id, client_name, client_email, client_phone, mode_received,
        job_description, type_of_job, assigned_to, target_completion_date, 
        job_received_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jobId,
        client_name,
        client_email,
        client_phone,
        mode_received,
        job_description,
        type_of_job,
        assigned_to,
        target_completion_date,
        job_received_date,
        'New',
      ]
    )

    res.status(200).json({ message: 'Job created successfully', job_id: jobId })
  } catch (error: any) {
    console.error('❌ Error creating job:', error)
    res.status(500).json({ message: 'Error creating job', error: error.message })
  }
}
