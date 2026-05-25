import { sql } from "@/lib/db"
import { IProfileDAO } from "./IProfileDAO"

/**
 * Implementação do DAO usando Neon PostgreSQL
 * Herda de IProfileDAO e sobrescreve todos os métodos
 * Implementa persistência direta com SQL
 */
export class ProfileDAO_Neon extends IProfileDAO {
  async create(data: { syncCode: string; stateData: any }): Promise<any> {
    const result = await sql`
      INSERT INTO sync_profiles (sync_code, state_data)
      VALUES (${data.syncCode}, ${JSON.stringify(data.stateData)})
      RETURNING *
    `
    return result[0]
  }

  async recovery(page: number, limit: number): Promise<{ profiles: any[]; total: number }> {
    const offset = (page - 1) * limit

    const [profiles, countResult] = await Promise.all([
      sql`
        SELECT sync_code, state_data, created_at, updated_at
        FROM sync_profiles
        ORDER BY updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`SELECT COUNT(*) as total FROM sync_profiles`,
    ])

    return {
      profiles,
      total: parseInt(countResult[0].total),
    }
  }

  async recoveryByCode(code: string): Promise<any | null> {
    const result = await sql`
      SELECT sync_code, state_data, delete_password, created_at, updated_at
      FROM sync_profiles
      WHERE sync_code = ${code}
    `
    return result[0] || null
  }

  async update(code: string, stateData: any): Promise<boolean> {
    const result = await sql`
      UPDATE sync_profiles
      SET state_data = ${JSON.stringify(stateData)},
          updated_at = NOW()
      WHERE sync_code = ${code}
      RETURNING *
    `
    return result.length > 0
  }

  async delete(code: string): Promise<boolean> {
    const result = await sql`
      DELETE FROM sync_profiles
      WHERE sync_code = ${code}
      RETURNING *
    `
    return result.length > 0
  }

  async search(query: string): Promise<any[]> {
    const result = await sql`
      SELECT sync_code, state_data, created_at, updated_at
      FROM sync_profiles
      WHERE sync_code ILIKE ${"%" + query + "%"}
         OR state_data::text ILIKE ${"%" + query + "%"}
      ORDER BY updated_at DESC
      LIMIT 20
    `
    return result
  }

  async setPassword(code: string, passwordHash: string): Promise<boolean> {
    const result = await sql`
      UPDATE sync_profiles
      SET delete_password = ${passwordHash},
          updated_at = NOW()
      WHERE sync_code = ${code}
      RETURNING *
    `
    return result.length > 0
  }

  async getPasswordHash(code: string): Promise<string | null> {
    const result = await sql`
      SELECT delete_password
      FROM sync_profiles
      WHERE sync_code = ${code}
    `
    return result[0]?.delete_password || null
  }

  async countCreatedToday(): Promise<number> {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM sync_profiles
      WHERE created_at >= CURRENT_DATE
    `
    return parseInt(result[0].count)
  }

  async countCreatedThisWeek(): Promise<number> {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM sync_profiles
      WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
    `
    return parseInt(result[0].count)
  }

  async countTotal(): Promise<number> {
    const result = await sql`SELECT COUNT(*) as total FROM sync_profiles`
    return parseInt(result[0].total)
  }

  async getRecent(limit: number): Promise<any[]> {
    return await sql`
      SELECT sync_code, state_data, created_at, updated_at
      FROM sync_profiles
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `
  }

  async getOldest(): Promise<any | null> {
    const result = await sql`
      SELECT sync_code, state_data, created_at, updated_at
      FROM sync_profiles
      ORDER BY created_at ASC
      LIMIT 1
    `
    return result[0] || null
  }
}
