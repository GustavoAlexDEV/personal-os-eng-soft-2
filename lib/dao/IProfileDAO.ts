/**
 * Interface base para Data Access Object de Perfil
 * Define o contrato para operações de persistência
 * Implementa polimorfismo através de classe abstrata em TypeScript
 */
export abstract class IProfileDAO {
  /**
   * Cria um novo registro no banco de dados
   */
  abstract create(data: {
    syncCode: string
    stateData: any
  }): Promise<any>

  /**
   * Recupera todos os registros com paginação
   */
  abstract recovery(page: number, limit: number): Promise<{
    profiles: any[]
    total: number
  }>

  /**
   * Recupera um registro específico por código
   */
  abstract recoveryByCode(code: string): Promise<any | null>

  /**
   * Atualiza um registro existente
   */
  abstract update(code: string, stateData: any): Promise<boolean>

  /**
   * Remove um registro
   */
  abstract delete(code: string): Promise<boolean>

  /**
   * Busca registros por query
   */
  abstract search(query: string): Promise<any[]>

  /**
   * Define senha de proteção
   */
  abstract setPassword(code: string, passwordHash: string): Promise<boolean>

  /**
   * Recupera hash da senha
   */
  abstract getPasswordHash(code: string): Promise<string | null>

  /**
   * Conta registros criados hoje
   */
  abstract countCreatedToday(): Promise<number>

  /**
   * Conta registros criados esta semana
   */
  abstract countCreatedThisWeek(): Promise<number>

  /**
   * Conta total de registros
   */
  abstract countTotal(): Promise<number>

  /**
   * Recupera registros mais recentes
   */
  abstract getRecent(limit: number): Promise<any[]>

  /**
   * Recupera o registro mais antigo
   */
  abstract getOldest(): Promise<any | null>
}
