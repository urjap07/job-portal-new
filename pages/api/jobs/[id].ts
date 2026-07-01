import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2'

// MySQL connection pool using environment variables
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
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ message: 'Job ID is required' })
  }

  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM job WHERE id = ?',
        [id]
      )
      if (rows.length === 0) return res.status(404).json({ message: 'Job not found' })
      res.status(200).json(rows[0])
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch job', error: error.message })
    }

  } else if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM job WHERE id = ?', [id])
      res.status(200).json({ message: 'Job deleted successfully' })
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to delete job', error: error.message })
    }

  } else {
    res.setHeader('Allow', ['GET', 'DELETE'])
    res.status(405).json({ message: 'Method not allowed' })
  }
}
