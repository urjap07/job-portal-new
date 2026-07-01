// pages/api/jobs/all.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'job_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Optional: Define the structure of a job row
interface Job {
  id: number
  job_id: string
  client_name: string
  client_email?: string
  client_phone?: string
  job_received_date: string
  mode_received: string
  job_description: string
  type_of_job?: string // ✅ Already included
  assigned_to?: number
  target_completion_date?: string
  status: string
  invoice_raised: boolean
  is_delivered: boolean
  payment_received: boolean
  invoice_amount?: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Only GET requests are allowed' })
  }

  try {
    const [rows] = await pool.query('SELECT *, firm FROM job ORDER BY id DESC')
    const jobs = rows as Job[]
    res.status(200).json(jobs)
  } catch (error: any) {
    console.error('❌ Error fetching jobs:', error.message)
    res.status(500).json({ message: 'Failed to fetch jobs', error: error.message })
  }
}
