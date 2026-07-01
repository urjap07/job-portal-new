// pages/api/jobs/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'job_portal',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const {
      client_name,
      client_email,
      client_phone,
      job_received_date,
      mode_received,
      job_description,
      type_of_job,
      assigned_to,
      target_completion_date,
    } = req.body

    try {
      const [latest] = await pool.query('SELECT MAX(id) AS maxId FROM job')
      const maxId = (latest as any)[0]?.maxId || 100
      const job_id = `DC-${maxId + 1}`

      await pool.query(
        `INSERT INTO job 
          (job_id, client_name, client_email, client_phone, job_received_date, 
           mode_received, job_description, type_of_job, assigned_to, target_completion_date, status, invoice_raised, is_delivered, payment_received) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', 0, 0, 0)`,
        [
          job_id,
          client_name,
          client_email,
          client_phone,
          job_received_date,
          mode_received,
          job_description,
          type_of_job,
          assigned_to,
          target_completion_date,
        ]
      )

      return res.status(201).json({ message: 'Job created', job_id })
    } catch (error) {
      console.error('Error creating job:', error)
      return res.status(500).json({ error: 'Failed to create job' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end('Method Not Allowed')
  }
}
