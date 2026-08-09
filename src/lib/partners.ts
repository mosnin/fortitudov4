/**
 * The agency partnership for ledger math and payment attribution.
 *
 * Partners are matched by first name (in the order listed) among admin
 * accounts. Other admins keep full admin access but are never offered as a
 * payment receiver or counted in the partner ledger. With no names configured
 * (or a name missing), the first two admins by creation stand in so the
 * ledger never goes blank.
 *
 * Set the founders' first names here once their admin accounts exist
 * (Admin → Team controls the names).
 */

export const PARTNER_NAMES: readonly string[] = [];

export function pickPartners<T extends { firstName: string | null }>(
  admins: T[]
): T[] {
  const named = PARTNER_NAMES.map((n) =>
    admins.find((a) => (a.firstName ?? "").toLowerCase() === n)
  );
  return named.length >= 2 && named[0] && named[1]
    ? (named as T[])
    : admins.slice(0, 2);
}
