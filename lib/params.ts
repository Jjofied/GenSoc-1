export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Read one string search param ("" when missing). */
export async function readParams<K extends string>(searchParams: SearchParams, keys: readonly K[]): Promise<Record<K, string>> {
  const sp = await searchParams;
  return Object.fromEntries(
    keys.map((k) => {
      const v = sp[k];
      return [k, (Array.isArray(v) ? v[0] : v) ?? ""];
    }),
  ) as Record<K, string>;
}
