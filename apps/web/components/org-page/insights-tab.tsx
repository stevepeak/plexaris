'use i18n'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const CHART_CARDS = [
  {
    title: 'Top Searches',
    description: 'Most searched terms by your buyers',
    chart: (
      <div className="flex h-40 items-end gap-2 px-4">
        {[65, 45, 80, 35, 55, 70, 40].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-indigo-400/60"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    ),
  },
  {
    title: 'Most Ordered Items',
    description: 'Products with the highest order volume',
    chart: (
      <div className="flex h-40 flex-col justify-center gap-2 px-4">
        {[90, 72, 58, 45, 30].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-16 rounded bg-muted" />
            <div
              className="h-4 rounded bg-emerald-400/60"
              style={{ width: `${w}%` }}
            />
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Product Popularity',
    description: 'Distribution of product categories',
    chart: (
      <div className="flex h-40 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-32 w-32">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgb(199 210 254 / 0.6)"
            strokeWidth="20"
            strokeDasharray="75 176"
            strokeDashoffset="0"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgb(165 180 252 / 0.6)"
            strokeWidth="20"
            strokeDasharray="50 201"
            strokeDashoffset="-75"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgb(129 140 248 / 0.6)"
            strokeWidth="20"
            strokeDasharray="40 211"
            strokeDashoffset="-125"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgb(99 102 241 / 0.6)"
            strokeWidth="20"
            strokeDasharray="86 165"
            strokeDashoffset="-165"
          />
        </svg>
      </div>
    ),
  },
  {
    title: 'Number of Orders',
    description: 'Order volume over time',
    chart: (
      <div className="flex h-40 items-center px-4">
        <svg viewBox="0 0 200 80" className="h-full w-full">
          <polyline
            fill="none"
            stroke="rgb(129 140 248 / 0.6)"
            strokeWidth="2"
            points="0,60 30,50 60,55 90,30 120,35 150,20 180,25 200,10"
          />
        </svg>
      </div>
    ),
  },
  {
    title: 'Revenue',
    description: 'Earnings trend over the past months',
    chart: (
      <div className="flex h-40 items-center px-4">
        <svg viewBox="0 0 200 80" className="h-full w-full">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(129 140 248 / 0.4)" />
              <stop offset="100%" stopColor="rgb(129 140 248 / 0.05)" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 L30,45 L60,50 L90,25 L120,30 L150,15 L180,20 L200,10 L200,80 L0,80 Z"
            fill="url(#areaGrad)"
          />
          <polyline
            fill="none"
            stroke="rgb(129 140 248 / 0.6)"
            strokeWidth="2"
            points="0,60 30,45 60,50 90,25 120,30 150,15 180,20 200,10"
          />
        </svg>
      </div>
    ),
  },
  {
    title: 'Order Trends',
    description: 'Weekly order patterns and seasonality',
    chart: (
      <div className="flex h-40 items-center px-4">
        <svg viewBox="0 0 200 80" className="h-full w-full">
          <polyline
            fill="none"
            stroke="rgb(99 102 241 / 0.6)"
            strokeWidth="2"
            points="0,40 25,35 50,45 75,30 100,40 125,25 150,35 175,20 200,30"
          />
          <polyline
            fill="none"
            stroke="rgb(199 210 254 / 0.6)"
            strokeWidth="2"
            strokeDasharray="4 3"
            points="0,50 25,48 50,45 75,42 100,40 125,38 150,35 175,32 200,30"
          />
        </svg>
      </div>
    ),
  },
] as const

export function InsightsTab(_props: { organizationId: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Insights</h2>
        <p className="text-muted-foreground">
          Analytics and performance metrics for your organization
        </p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {CHART_CARDS.map((card) => (
          <Card key={card.title} className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="blur-sm">{card.chart}</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-muted/80 px-4 py-1.5 text-sm font-medium text-muted-foreground">
                  Coming Soon
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
