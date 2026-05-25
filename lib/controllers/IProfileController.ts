/**
 * Interface base para Controllers de Perfil
 * Define o contrato que todas as implementações de controller devem seguir
 * Implementa polimorfismo através de classe abstrata em TypeScript
 */
export abstract class IProfileController {
  /**
   * Lista todos os perfis com paginação
   */
  abstract index(page: number, limit: number): Promise<{
    profiles: any[]
    total: number
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }>

  /**
   * Busca um perfil específico por código
   */
  abstract show(code: string): Promise<any | null>

  /**
   * Cria um novo perfil
   */
  abstract store(data: {
    icons: any[]
    settings: any
    isWelcomeComplete: boolean
  }): Promise<{ syncCode: string }>

  /**
   * Atualiza um perfil existente
   */
  abstract update(
    code: string,
    data: {
      icons: any[]
      settings: any
      isWelcomeComplete: boolean
    }
  ): Promise<boolean>

  /**
   * Remove um perfil
   */
  abstract destroy(code: string, password?: string): Promise<boolean>

  /**
   * Busca perfis com filtros
   */
  abstract search(query: string): Promise<any[]>

  /**
   * Define senha de proteção do perfil
   */
  abstract setPassword(code: string, password: string): Promise<boolean>

  /**
   * Verifica se perfil possui senha
   */
  abstract hasPassword(code: string): Promise<boolean>

  /**
   * Obtém estatísticas gerais
   */
  abstract stats(): Promise<{
    totalProfiles: number
    profilesCreatedToday: number
    profilesCreatedThisWeek: number
    recentProfiles: any[]
    oldestProfile: any | null
  }>
}
