import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reportSummaries, scheduledReports } from "@/data/reportsData";
import { FileText, Download, Clock, Calendar, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

const Reports = () => {
  return (
    <DashboardLayout title="Reports">
      <Tabs defaultValue="summaries" className="space-y-6">
        <TabsList className="bg-surface-1 border border-border">
          <TabsTrigger value="summaries">Report Summaries</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* SUMMARIES */}
        <TabsContent value="summaries" className="space-y-6">
          {reportSummaries.map((report, i) => (
            <Card key={i} className="bg-surface-1 border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {report.title}
                    </CardTitle>
                    <CardDescription className="mt-1">{report.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {report.lastGenerated}
                    </span>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                      <Download className="w-3 h-3" /> Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {report.metrics.map((m, j) => (
                    <div key={j} className="p-3 rounded-lg bg-surface-2/50">
                      <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                      <p className="font-mono text-lg font-medium text-foreground">{m.value}</p>
                      {m.change !== 0 && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded mt-1 inline-block ${m.change > 0 ? "change-positive" : "change-negative"}`}>
                          {m.change > 0 ? "+" : ""}{m.change}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* SCHEDULED */}
        <TabsContent value="scheduled">
          <Card className="bg-surface-1 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Scheduled Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Report Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Frequency</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Recipients</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Next Run</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledReports.map(r => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.frequency}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{r.recipients}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.nextRun}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${
                          r.status === "Active"
                            ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}>
                          {r.status === "Active" ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Reports;
