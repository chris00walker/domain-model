/** Text / naming helper utilities shared across scripts */

/** slugContext
 * Converts any bounded-context name to a lowercase alphanumeric slug. */
export function slugContext(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** normKey
 * Normalises a string for map keys (lowercase alphanumeric). */
export function normKey(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

/** pascalCase
 * Human-friendly PascalCase generator, tolerant of "shopping_cart", "Shopping Cart", etc. */
export function pascalCase(name: string): string {
  const tokens = name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  return tokens.map((t) => t[0].toUpperCase() + t.slice(1).toLowerCase()).join("");
}
