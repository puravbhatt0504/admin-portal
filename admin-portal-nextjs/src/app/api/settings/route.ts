import { NextResponse } from 'next/server'

// In a real application, you would store these in a database
let appSettings = {
  travelRate: 10,
  workingHours: 8,
  lateThreshold: 30
}

export async function GET() {
  try {
    return NextResponse.json({ settings: appSettings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    appSettings = { ...appSettings, ...data }
    
    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: appSettings 
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
