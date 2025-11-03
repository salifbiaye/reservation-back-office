/**
 * Types pour la pagination
 */
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Calculer le skip et take pour Prisma
 */
export function getPaginationSkipTake(params: PaginationParams) {
  const page = Math.max(1, params.page)
  const limit = Math.max(1, Math.min(100, params.limit)) // Max 100 items per page

  return {
    skip: (page - 1) * limit,
    take: limit,
  }
}

/**
 * Calculer les métadonnées de pagination
 */
export function buildPaginationMeta(
  total: number,
  params: PaginationParams
): PaginationResult<any>["pagination"] {
  const page = Math.max(1, params.page)
  const limit = Math.max(1, params.limit)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    page,
    limit,
    total,
    totalPages,
  }
}

/**
 * Construire le résultat paginé
 */
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginationResult<T> {
  return {
    data,
    pagination: buildPaginationMeta(total, params),
  }
}

/**
 * Parser les paramètres de pagination depuis searchParams
 */
export function parsePaginationParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
  defaults: { page?: number; limit?: number } = {}
): PaginationParams {
  const defaultPage = defaults.page || 1
  const defaultLimit = defaults.limit || 10

  // Handle both URLSearchParams and plain objects
  const getParam = (key: string): string | null => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key)
    }
    const value = searchParams[key]
    if (Array.isArray(value)) {
      return value[0] || null
    }
    return value || null
  }

  const pageParam = getParam("page")
  const limitParam = getParam("limit")

  const page = pageParam ? parseInt(pageParam, 10) : defaultPage
  const limit = limitParam ? parseInt(limitParam, 10) : defaultLimit

  return {
    page: isNaN(page) || page < 1 ? defaultPage : page,
    limit: isNaN(limit) || limit < 1 ? defaultLimit : Math.min(100, limit),
  }
}
