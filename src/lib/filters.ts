/**
 * Parser un paramètre de recherche
 */
export function parseSearchParam(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string
): string | null {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get(key)
  }
  const value = searchParams[key]
  if (Array.isArray(value)) {
    return value[0] || null
  }
  return value || null
}

/**
 * Construire une condition de recherche Prisma
 */
export function buildSearchCondition(search: string | null, fields: string[]) {
  if (!search || search.trim() === "") {
    return undefined
  }

  const searchTerm = search.trim()

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: "insensitive" as const,
      },
    })),
  }
}

/**
 * Parser un filtre de statut
 */
export function parseStatusFilter(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): string | null {
  return parseSearchParam(searchParams, "status")
}

/**
 * Parser un filtre de rôle
 */
export function parseRoleFilter(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): string | null {
  return parseSearchParam(searchParams, "role")
}

/**
 * Parser un filtre de commission
 */
export function parseCommissionFilter(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): string | null {
  return parseSearchParam(searchParams, "commission")
}

/**
 * Parser un filtre de date range
 */
export function parseDateRangeFilter(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): { startDate: Date | null; endDate: Date | null } {
  const startDateStr = parseSearchParam(searchParams, "startDate")
  const endDateStr = parseSearchParam(searchParams, "endDate")

  return {
    startDate: startDateStr ? new Date(startDateStr) : null,
    endDate: endDateStr ? new Date(endDateStr) : null
  }
}

/**
 * Construire une condition Prisma pour un filtre de date range
 * Pour les réservations, on filtre par date de début
 */
export function buildDateRangeCondition(
  startDate: Date | null,
  endDate: Date | null,
  field: string = "start"
) {
  if (!startDate && !endDate) {
    return undefined
  }

  const conditions: any[] = []

  if (startDate) {
    conditions.push({
      [field]: {
        gte: startDate
      }
    })
  }

  if (endDate) {
    conditions.push({
      [field]: {
        lte: endDate
      }
    })
  }

  return conditions.length > 0 ? { AND: conditions } : undefined
}
