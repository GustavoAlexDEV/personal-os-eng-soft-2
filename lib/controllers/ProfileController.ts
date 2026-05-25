import { IProfileController } from "./IProfileController"
import { IProfileDAO } from "../dao/IProfileDAO"

/**
 * Implementação do Controller de Perfil
 * Herda de IProfileController e sobrescreve todos os métodos
 * Delega operações de persistência ao DAO injetado
 */
export class ProfileController extends IProfileController {
  private dao: IProfileDAO

  constructor(dao: IProfileDAO) {
    super()
    this.dao = dao
  }

  /**
   * Gera código de sincronização único de 8 caracteres
   */
  private generateSyncCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  async index(page: number, limit: number) {
    const { profiles, total } = await this.dao.recovery(page, limit)
    const totalPages = Math.ceil(total / limit)

    return {
      profiles: profiles.map((p) => {
        const stateData = p.state_data || {}
        const settings = stateData.settings || {}
        const icons = stateData.icons || []
        return {
          code: p.sync_code,
          username: settings.username || "",
          themeColor: settings.themeColor || "#6366f1",
          profilePicture: settings.profilePicture || "",
          iconCount: icons.length,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }
      }),
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  async show(code: string) {
    const profile = await this.dao.recoveryByCode(code)
    if (!profile) return null

    return {
      syncCode: profile.sync_code,
      stateData: profile.state_data,
      hasPassword: !!profile.delete_password,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }
  }

  async store(data: { icons: any[]; settings: any; isWelcomeComplete: boolean }) {
    const syncCode = this.generateSyncCode()
    await this.dao.create({
      syncCode,
      stateData: data,
    })
    return { syncCode }
  }

  async update(code: string, data: { icons: any[]; settings: any; isWelcomeComplete: boolean }) {
    return await this.dao.update(code, data)
  }

  async destroy(code: string, password?: string) {
    const profile = await this.dao.recoveryByCode(code)
    if (!profile) return false

    // Se perfil tem senha, verificar
    if (profile.delete_password && password) {
      const bcrypt = await import("bcryptjs")
      const isValid = await bcrypt.compare(password, profile.delete_password)
      if (!isValid) return false
    } else if (profile.delete_password && !password) {
      return false
    }

    return await this.dao.delete(code)
  }

  async search(query: string) {
    const profiles = await this.dao.search(query)
    return profiles.map((p) => {
      const stateData = p.state_data || {}
      const settings = stateData.settings || {}
      return {
        code: p.sync_code,
        username: settings.username || "",
        createdAt: p.created_at,
      }
    })
  }

  async setPassword(code: string, password: string) {
    const bcrypt = await import("bcryptjs")
    const hash = await bcrypt.hash(password, 10)
    return await this.dao.setPassword(code, hash)
  }

  async hasPassword(code: string) {
    const hash = await this.dao.getPasswordHash(code)
    return !!hash
  }

  async stats() {
    const [total, today, week, recent, oldest] = await Promise.all([
      this.dao.countTotal(),
      this.dao.countCreatedToday(),
      this.dao.countCreatedThisWeek(),
      this.dao.getRecent(5),
      this.dao.getOldest(),
    ])

    const recentWithUsernames = recent.map((p) => {
      const stateData = p.state_data || {}
      const settings = stateData.settings || {}
      return {
        code: p.sync_code,
        username: settings.username || "",
        createdAt: p.created_at,
      }
    })

    let oldestWithUsername = null
    if (oldest) {
      const oldestStateData = oldest.state_data || {}
      const oldestSettings = oldestStateData.settings || {}
      oldestWithUsername = {
        code: oldest.sync_code,
        username: oldestSettings.username || "",
        createdAt: oldest.created_at,
      }
    }

    return {
      totalProfiles: total,
      profilesCreatedToday: today,
      profilesCreatedThisWeek: week,
      recentProfiles: recentWithUsernames,
      oldestProfile: oldestWithUsername,
    }
  }
}
