/**
 * Largest-remainder allocation of an integer-cent pool across weighted ids.
 *
 * The equity settlement divides twice — pool into twelve cell blocks, then each
 * block across the households in that cell — and both levels run through here.
 * The invariant callers depend on is exactness: the returned values always sum
 * to `totalCents`, so a pool closes to the cent rather than to a tolerance.
 *
 * Ties on the fractional remainder break by id, so a given input always yields
 * the same allocation regardless of the order it was assembled in.
 */
export interface WeightedId {
  id: string;
  weight: number;
}

export function allocateCents(
  totalCents: number,
  weightedIds: readonly WeightedId[],
): Map<string, number> {
  if (!Number.isInteger(totalCents) || totalCents < 0)
    throw new Error("Pool amounts must be non-negative integer cents");
  const totalWeight = weightedIds.reduce(
    (total, item) => total + item.weight,
    0,
  );
  if (totalWeight <= 0 || totalCents === 0)
    return new Map(weightedIds.map(({ id }) => [id, 0]));
  const rows = weightedIds.map(({ id, weight }) => {
    const exact = (totalCents * weight) / totalWeight;
    return {
      id,
      cents: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });
  const centsRemaining =
    totalCents - rows.reduce((total, row) => total + row.cents, 0);
  const remainderOrder = [...rows].sort(
    (left, right) =>
      right.remainder - left.remainder || left.id.localeCompare(right.id),
  );
  for (let index = 0; index < centsRemaining; index += 1)
    remainderOrder[index % remainderOrder.length].cents += 1;
  return new Map(rows.map(({ id, cents }) => [id, cents]));
}
