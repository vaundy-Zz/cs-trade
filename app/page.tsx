import * as React from "react";
import {
  Activity,
  ArrowUpRight,
  CreditCard,
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/primitives/stat-card";
import { ChartWrapper } from "@/components/primitives/chart-wrapper";

const recentTransactions = [
  {
    id: "1",
    customer: "Olivia Martin",
    email: "olivia.martin@example.com",
    amount: "$1,024.00",
    status: "success",
  },
  {
    id: "2",
    customer: "Jackson Lee",
    email: "jackson.lee@example.com",
    amount: "$486.50",
    status: "success",
  },
  {
    id: "3",
    customer: "Isabella Nguyen",
    email: "isabella.nguyen@example.com",
    amount: "$892.00",
    status: "processing",
  },
  {
    id: "4",
    customer: "William Kim",
    email: "will@example.com",
    amount: "$234.00",
    status: "success",
  },
  {
    id: "5",
    customer: "Sofia Davis",
    email: "sofia.davis@example.com",
    amount: "$2,134.00",
    status: "success",
  },
];

export default function HomePage() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s an overview of your key metrics.
        </p>
      </div>

      <section
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        aria-label="Key metrics"
      >
        <StatCard
          title="Total Revenue"
          value="$48,532.89"
          description="from previous month"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Active Users"
          value="2,834"
          description="from previous month"
          icon={Users}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Conversions"
          value="1,234"
          description="from previous month"
          icon={CreditCard}
          trend={{ value: -2.4, isPositive: false }}
        />
        <StatCard
          title="Active Now"
          value="573"
          description="currently online"
          icon={Activity}
        />
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ChartWrapper
          title="Revenue Growth"
          description="Monthly revenue trend over time"
          trend="up"
          trendLabel="+18%"
          footer={
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Last updated 5 minutes ago
              </p>
              <Button variant="ghost" size="sm">
                View Details
                <ArrowUpRight className="ml-1 h-3 w-3" aria-hidden="true" />
              </Button>
            </div>
          }
        >
          <TrendingUp className="h-8 w-8" aria-hidden="true" />
          <p className="text-center">Chart data will render here</p>
        </ChartWrapper>

        <Card className="md:col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              You made {recentTransactions.length} transactions this week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.customer}</div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "success"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
