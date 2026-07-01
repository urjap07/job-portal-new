// pages/api/codes.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

// Reuse your existing DB connection (you can move this to a shared file if needed)
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'job_portal',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [rows] = await pool.query('SELECT item, hsn_code FROM codes')
    res.status(200).json(rows)
  } catch (err) {
    console.error('Error fetching codes:', err)
    res.status(500).json({ message: 'Failed to fetch codes' })
  }
}
