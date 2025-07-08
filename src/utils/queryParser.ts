import type { Prisma } from '@prisma/client';

/**
 * Parses queery parameters from the URL to build Prisma-compatible
 * 'where' and 'orderBy' objects for filtering and sorting job applications.
 * @param queryParams - The query parameters from the request url (e.g. req.query).
 * @param userId - The ID of the currently logged-in user.
 * @returns An object containing:
 *      - where: Prisma filter conditions for querying applications.
 *      - orderBy: Prisma sorting instructions.
 *      - sort: The sort value from the query string.
 *      - filter: The filter value from the query string.
 *      - search: The search term (by company) from the query string.
 */
export function parseApplicationQueryParams(queryParams: any, userId: string) {
  // Maps possible `sort` query values to Prisma-compatible sorting options.
  const sortMap: Record<
    string,
    Prisma.JobApplicationOrderByWithRelationInput[]
  > = {
    dateAsc: [{ applicationDate: 'asc' }],
    dateDesc: [{ applicationDate: 'desc' }],
    locationAsc: [{ location: 'asc' }],
    locationDesc: [{ location: 'desc' }],
  };

  // Extract sort, filter, and search params from the query, with defaults/fallbacks.
  const sort = (queryParams.sort ?? 'dateDesc') as keyof typeof sortMap;
  const filter = queryParams.filter;
  const search = queryParams.searchByCompany;

  // Fallback to sorting by application date descending if invalid sort key
  const orderBy = sortMap[sort] || [{ applicationDate: 'desc' }];

  /**
   * Build the `where` clause for filtering results:
   * - Always filter for the user's ID.
   * - If `filter` is 'excludeRejected', filter out applications with REJECTED status.
   * - If `searchByCompany` is provided, search for company names that contain the string (case-insensitive).
   */
  const where = {
    userId,
    ...(filter === 'excludeRejected' && {
      status: { not: 'REJECTED' },
    }),
    ...(search && {
      company: { contains: search, mode: 'insensitive' },
    }),
  };

  // Return all the parsed values for use in Prisma query and frontend display.
  return { where, orderBy, sort, filter, search };
}
