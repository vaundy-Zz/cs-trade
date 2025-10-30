import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartWrapper } from "@/components/primitives/chart-wrapper";
import { StatCard } from "@/components/primitives/stat-card";

export default function ComponentsDemoPage() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Components Showcase
        </h1>
        <p className="text-muted-foreground">
          Demonstration of all available UI components and primitives.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Users className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled Outline
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Success
          </Badge>
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
              <CardDescription>
                A basic card with title and description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Card content goes here. This is a flexible container for any
                type of content.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card with Footer</CardTitle>
              <CardDescription>Includes action buttons</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card demonstrates the footer section with actions.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <Button size="sm">Confirm</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Compact Card
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,345</div>
              <p className="text-xs text-muted-foreground">
                +10% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Stat Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value="$48,532"
            description="from last month"
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Active Users"
            value="2,834"
            icon={Users}
            trend={{ value: -2.4, isPositive: false }}
          />
          <StatCard
            title="Growth Rate"
            value="24.5%"
            description="year over year"
            icon={TrendingUp}
          />
          <StatCard
            title="Loading State"
            value="..."
            icon={DollarSign}
            loading
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Chart Wrappers</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ChartWrapper
            title="Revenue Trend"
            description="Last 6 months"
            trend="up"
            trendLabel="+18%"
          >
            <TrendingUp className="h-8 w-8" />
            <p className="text-center">Chart visualization</p>
          </ChartWrapper>

          <ChartWrapper
            title="User Engagement"
            description="Current period"
            trend="stable"
            trendLabel="0%"
            footer={
              <div className="text-xs text-muted-foreground">
                Last updated 5 minutes ago
              </div>
            }
          >
            <Users className="h-8 w-8" />
            <p className="text-center">Engagement metrics</p>
          </ChartWrapper>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tables</h2>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              A list of your recent transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Transaction history for October 2024</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs">#001</TableCell>
                  <TableCell>Olivia Martin</TableCell>
                  <TableCell>
                    <Badge variant="default">Completed</Badge>
                  </TableCell>
                  <TableCell className="text-right">$1,024.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">#002</TableCell>
                  <TableCell>Jackson Lee</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Processing</Badge>
                  </TableCell>
                  <TableCell className="text-right">$486.50</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">#003</TableCell>
                  <TableCell>Isabella Nguyen</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Failed</Badge>
                  </TableCell>
                  <TableCell className="text-right">$892.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Skeletons</h2>
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>Skeleton loaders for async content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <p className="text-muted-foreground">text-4xl font-bold</p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold">Heading 2</h2>
              <p className="text-muted-foreground">text-3xl font-semibold</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">Heading 3</h3>
              <p className="text-muted-foreground">text-2xl font-semibold</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold">Heading 4</h4>
              <p className="text-muted-foreground">text-xl font-semibold</p>
            </div>
            <div>
              <p className="text-base">Body text (base)</p>
              <p className="text-muted-foreground">text-base</p>
            </div>
            <div>
              <p className="text-sm">Small text</p>
              <p className="text-muted-foreground">text-sm</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Extra small text</p>
              <p className="text-muted-foreground">text-xs</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Color Palette</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Primary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 w-full rounded-md bg-primary" />
              <div className="mt-2 text-xs text-muted-foreground">
                hsl(var(--primary))
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Secondary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 w-full rounded-md bg-secondary" />
              <div className="mt-2 text-xs text-muted-foreground">
                hsl(var(--secondary))
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Muted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 w-full rounded-md bg-muted" />
              <div className="mt-2 text-xs text-muted-foreground">
                hsl(var(--muted))
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Accent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 w-full rounded-md bg-accent" />
              <div className="mt-2 text-xs text-muted-foreground">
                hsl(var(--accent))
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Destructive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 w-full rounded-md bg-destructive" />
              <div className="mt-2 text-xs text-muted-foreground">
                hsl(var(--destructive))
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Border</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 w-full rounded-md border-4 border-border" />
              <div className="mt-2 text-xs text-muted-foreground">
                hsl(var(--border))
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
