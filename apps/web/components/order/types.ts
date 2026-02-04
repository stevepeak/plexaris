export type TabItem =
  | { type: 'product'; id: string; label: string }
  | { type: 'supplier'; id: string; label: string }
  | { type: 'recipe'; id: string; label: string }
  | { type: 'cart'; id: string; label: string }
  | { type: 'activity'; id: string; label: string }

export const CART_TAB: TabItem = { type: 'cart', id: 'cart', label: 'Cart' }

export const ACTIVITY_TAB: TabItem = {
  type: 'activity',
  id: 'activity',
  label: 'Activity',
}

export function tabKey(tab: TabItem): string {
  return `${tab.type}:${tab.id}`
}
