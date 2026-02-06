'use client'

import { AlertTriangle } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type ScrapeIssue = {
  source: string
  field: string
  rawValue: unknown
  error: string
  timestamp: string
}

export function ScrapeIssuesTable({ issues }: { issues: ScrapeIssue[] }) {
  const validIssues = issues.filter(
    (issue) => issue && (issue.source || issue.field || issue.error),
  )
  if (!validIssues.length) return null

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Scrape Issues
          </CardTitle>
          <CardDescription>
            {validIssues.length} {validIssues.length === 1 ? 'issue' : 'issues'}{' '}
            found during data scraping
          </CardDescription>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Field</TableHead>
              <TableHead>Raw Value</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validIssues.map((issue, i) => (
              <TableRow key={`${issue.source}-${issue.field}-${i}`}>
                <TableCell className="max-w-[200px] truncate font-mono text-xs">
                  {issue.source}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {issue.field}
                </TableCell>
                <TableCell className="max-w-[150px] truncate font-mono text-xs text-muted-foreground">
                  {formatRawValue(issue.rawValue)}
                </TableCell>
                <TableCell className="text-sm">{issue.error}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function formatRawValue(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}
