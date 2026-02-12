/** Immutably set a value at a nested path in an object */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string[],
  value: unknown,
): Record<string, unknown> {
  const result = { ...obj }
  if (path.length === 1) {
    result[path[0]] = value
    return result
  }
  const [head, ...rest] = path
  result[head] = setNestedValue(
    (result[head] as Record<string, unknown>) ?? {},
    rest,
    value,
  )
  return result
}

/** Read a value at a nested path from an object */
export function getNestedValue(obj: unknown, path: string[]): unknown {
  let current = obj
  for (const key of path) {
    if (current == null || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }
  return current
}
