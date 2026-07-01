// File: pages/api/jobs.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

const FIRM_PREFIXES: Record<string, string> = {
  Datachef: 'DC',
  Techsahyogi: 'TS',
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'job_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

async function generateJobId(firm: string) {
  const prefix = FIRM_PREFIXES[firm] ?? 'DC'
  const [rows] = await pool.query('SELECT MAX(id) AS maxId FROM job')
  const maxId = (rows as any)[0]?.maxId || 0
  return `${prefix}-${100 + maxId + 1}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

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
    firm = 'Datachef',
  } = req.body

  try {
    const job_id = await generateJobId(firm)

    await pool.query(
      `INSERT INTO job
      (job_id, firm, client_name, client_email, client_phone, mode_received, job_description, type_of_job, assigned_to, target_completion_date, job_received_date, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        job_id,
        firm,
        client_name,
        client_email,
        client_phone,
        mode_received,
        job_description,
        type_of_job,
        assigned_to,
        target_completion_date,
        job_received_date,
      ]
    )

    res.status(200).json({ message: 'Job created successfully', job_id })
  } catch (error) {
    console.error('Database insertion error:', error)
    res.status(500).json({ error: 'Failed to create job' })
  }
}
