import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    // Simple test query
    const result = await pool.query('SELECT 1 as test')
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      test: result.rows[0].test
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
