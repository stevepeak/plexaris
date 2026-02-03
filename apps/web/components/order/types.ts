export type TabItem =
  | { type: 'product'; id: string; label: string }
  | { type: 'supplier'; id: string; label: string }
  | { type: 'recipe'; id: string; label: string }

export function tabKey(tab: TabItem): string {
  return `${tab.type}:${tab.id}`
}
