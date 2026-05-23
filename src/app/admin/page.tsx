
"use client";

import { Trophy, Users, DollarSign, Ticket, Activity, Settings, Plus, Download, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const overviewStats = [
  { title: "Total Revenue", value: "$42,500.00", change: "+12.5%", icon: DollarSign },
  { title: "Registrations", value: "842", change: "+24.2%", icon: Users },
  { title: "Tickets Sold", value: "1,240", change: "+8.1%", icon: Ticket },
  { title: "Active Events", value: "12", change: "0%", icon: Trophy },
];

const recentActivities = [
  { id: 1, user: "Alex Rivera", action: "Registered for Cyber Strike", time: "2 mins ago", amount: "$50" },
  { id: 2, user: "Team Apex", action: "Payment Validated", time: "15 mins ago", amount: "$150" },
  { id: 3, user: "Sara Chen", action: "Purchased After Cup Ticket", time: "1 hour ago", amount: "$25" },
];

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">COMMAND CENTER</h1>
          <p className="text-muted-foreground">Overview and management of ONE CUP ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Button className="bg-primary hover:bg-primary/90 glow-blue gap-2">
            <Plus className="w-4 h-4" /> Create Tournament
          </Button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, idx) => (
          <Card key={idx} className="bg-card/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                {stat.change} <span className="text-muted-foreground">vs last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Management Table */}
        <Card className="lg:col-span-2 bg-card/50 border-white/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tournament Logistics</CardTitle>
                <CardDescription>Monitor active registrations and payment statuses.</CardDescription>
              </div>
              <Activity className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead>Event</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Golden Goal League", fill: 75, revenue: "$12,400", status: "Active" },
                  { name: "Cyber Strike Open", fill: 90, revenue: "$8,200", status: "Active" },
                  { name: "Beach Spike Pro", fill: 30, revenue: "$2,100", status: "Upcoming" },
                ].map((item, idx) => (
                  <TableRow key={idx} className="border-white/5 group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="w-[150px]">
                      <div className="flex items-center gap-2">
                        <Progress value={item.fill} className="h-1.5 bg-muted" />
                        <span className="text-xs text-muted-foreground">{item.fill}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.revenue}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Active' ? 'default' : 'outline'} className={item.status === 'Active' ? 'bg-primary/20 text-primary border-primary/20' : ''}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Manage <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Real-time Activity Feed */}
        <Card className="bg-card/50 border-white/5">
          <CardHeader>
            <CardTitle>Recent Pulse</CardTitle>
            <CardDescription>Live updates from participants.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-4 items-start pb-6 border-b border-white/5 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">{activity.user}</p>
                  <p className="text-xs text-muted-foreground">{activity.action}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-muted-foreground uppercase">{activity.time}</span>
                    <span className="text-[10px] font-bold text-primary">{activity.amount}</span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">View All Logs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
