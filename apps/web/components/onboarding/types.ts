export type OrgType = 'supplier' | 'horeca'

type StepDefinition = {
  id: string
  label: string
}

export function getSteps(_orgType: OrgType | null): StepDefinition[] {
  return [
    { id: 'type', label: 'Type' },
    { id: 'name', label: 'Name' },
    { id: 'sources', label: 'Sources' },
  ]
}
