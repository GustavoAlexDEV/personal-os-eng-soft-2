import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [countResult, recentResult, oldestResult] = await Promise.all([
      sql`SELECT COUNT(*) as total FROM sync_profiles`,
      sql`
        SELECT sync_code, created_at, updated_at
        FROM sync_profiles
        ORDER BY updated_at DESC
        LIMIT 5
      `,
      sql`
        SELECT sync_code, created_at, updated_at
        FROM sync_profiles
        ORDER BY created_at ASC
        LIMIT 1
      `,
    ])

    const total = parseInt(countResult[0].total)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)

    const [todayResult, weekResult] = await Promise.all([
      sql`
        SELECT COUNT(*) as count
        FROM sync_profiles
        WHERE created_at >= ${todayStart.toISOString()}
      `,
      sql`
        SELECT COUNT(*) as count
        FROM sync_profiles
        WHERE created_at >= ${weekStart.toISOString()}
      `,
    ])

    return NextResponse.json({
      totalProfiles: total,
      createdToday: parseInt(todayResult[0].count),
      createdThisWeek: parseInt(weekResult[0].count),
      recentProfiles: recentResult.map((p) => ({
        syncCode: p.sync_code,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
      oldestProfile: oldestResult.length > 0
        ? {
            syncCode: oldestResult[0].sync_code,
            createdAt: oldestResult[0].created_at,
          }
        : null,
    })
  } catch (error) {
    console.error("Stats GET error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
