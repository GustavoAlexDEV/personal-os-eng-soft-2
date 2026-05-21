import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [countResult, recentResult, oldestResult] = await Promise.all([
      sql`SELECT COUNT(*) as total FROM sync_profiles`,
      sql`
        SELECT sync_code, state_data, created_at, updated_at
        FROM sync_profiles
        ORDER BY updated_at DESC
        LIMIT 5
      `,
      sql`
        SELECT sync_code, state_data, created_at, updated_at
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

    // Extrai username dos perfis recentes
    const recentWithUsernames = await Promise.all(
      recentResult.map(async (p) => {
        const stateData = p.state_data || {}
        const settings = stateData.settings || {}
        return {
          code: p.sync_code,
          username: settings.username || "",
          createdAt: p.created_at,
        }
      })
    )

    // Extrai username do perfil mais antigo
    let oldestWithUsername = null
    if (oldestResult.length > 0) {
      const oldestStateData = oldestResult[0].state_data || {}
      const oldestSettings = oldestStateData.settings || {}
      oldestWithUsername = {
        code: oldestResult[0].sync_code,
        username: oldestSettings.username || "",
        createdAt: oldestResult[0].created_at,
      }
    }

    return NextResponse.json({
      totalProfiles: total,
      profilesCreatedToday: parseInt(todayResult[0].count),
      profilesCreatedThisWeek: parseInt(weekResult[0].count),
      recentProfiles: recentWithUsernames,
      oldestProfile: oldestWithUsername,
    })
  } catch (error) {
    console.error("Stats GET error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
