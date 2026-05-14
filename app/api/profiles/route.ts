import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")))
    const offset = (page - 1) * limit

    const [profiles, countResult] = await Promise.all([
      sql`
        SELECT sync_code, created_at, updated_at
        FROM sync_profiles
        ORDER BY updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`SELECT COUNT(*) as total FROM sync_profiles`,
    ])

    const total = parseInt(countResult[0].total)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      profiles: profiles.map((p) => ({
        syncCode: p.sync_code,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Profiles GET error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
