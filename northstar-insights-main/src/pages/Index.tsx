import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { ChannelPerformanceChart } from "@/components/ChannelPerformanceChart";
import { ChannelMixDonut } from "@/components/ChannelMixDonut";
import { CampaignTable } from "@/components/CampaignTable";
import { blendedKPIs } from "@/data/mockData";
import { useMetricFormat } from "@/hooks/useMetricFormat";

const Index = () => {
  const { formatCurrency, formatNumber, formatROAS } = useMetricFormat();

  const kpis = [
    { label: "Total Spend", displayValue: formatCurrency(blendedKPIs.totalSpend.value), change: blendedKPIs.totalSpend.change, sparkline: blendedKPIs.totalSpend.sparkline, color: "#F5A623" },
    { label: "Total Revenue", displayValue: formatCurrency(blendedKPIs.totalRevenue.value), change: blendedKPIs.totalRevenue.change, sparkline: blendedKPIs.totalRevenue.sparkline, color: "#34A853" },
    { label: "Blended ROAS", displayValue: formatROAS(blendedKPIs.blendedROAS.value), change: blendedKPIs.blendedROAS.change, sparkline: blendedKPIs.blendedROAS.sparkline, color: "#34A853" },
    { label: "Total Conversions", displayValue: formatNumber(blendedKPIs.totalConversions.value), change: blendedKPIs.totalConversions.change, sparkline: blendedKPIs.totalConversions.sparkline, color: "#4285F4" },
    { label: "Paid Sessions", displayValue: formatNumber(blendedKPIs.paidSessions.value), change: blendedKPIs.paidSessions.change, sparkline: blendedKPIs.paidSessions.sparkline, color: "#4285F4" },
    { label: "Organic Sessions", displayValue: formatNumber(blendedKPIs.organicSessions.value), change: blendedKPIs.organicSessions.change, sparkline: blendedKPIs.organicSessions.sparkline, color: "#34A853" },
  ];

  return (
    <DashboardLayout title="Overview">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.displayValue}
              change={kpi.change}
              sparkline={kpi.sparkline}
              color={kpi.color}
              delay={i * 80}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          <ChannelPerformanceChart />
          <ChannelMixDonut />
        </div>

        {/* Campaign Table */}
        <CampaignTable />
      </div>
    </DashboardLayout>
  );
};

export default Index;
