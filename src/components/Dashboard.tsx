import { DashboardHeader } from './DashboardHeader';
import { MonitoringPanel } from './MonitoringPanel';
import { Monitor, Server, Activity, Database } from 'lucide-react';

export const Dashboard = () => {
  const panels = [
    {
      title: 'Uptime Monitor',
      description: 'Status de disponibilidade dos serviços',
      url: 'http://167.172.229.221:3026/dashboard/2',
      icon: <Monitor className="w-5 h-5 text-primary" />,
      status: 'online' as const,
    },
    {
      title: 'Container Alpha Stats',
      description: 'Métricas de desempenho do Container 1',
      url: 'http://167.172.229.221:9000/#!/3/docker/containers/bc1cb892e02ada73c0ff131deb5f61b9fe7f954005a2d4c9a6e1dd7e985741d8/stats',
      icon: <Server className="w-5 h-5 text-primary" />,
      status: 'online' as const,
    },
    {
      title: 'Container Beta Stats',
      description: 'Métricas de desempenho do Container 2',
      url: 'http://167.172.229.221:9000/#!/3/docker/containers/fd5db1d510c4e28fdf6a88de1b19d12555aa5bc318c8f4623c22d298ad609b81/stats',
      icon: <Activity className="w-5 h-5 text-primary" />,
      status: 'online' as const,
    },
    {
      title: 'Container Gamma Stats',
      description: 'Métricas de desempenho do Container 3',
      url: 'http://167.172.229.221:9000/#!/3/docker/containers/e001291642d5460945deb4de32a8d20adce2e95e531f4addaeced8e25f070456/stats',
      icon: <Database className="w-5 h-5 text-primary" />,
      status: 'online' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        <DashboardHeader />
        
        {/* Desktop: 4 columns */}
        <div className="hidden xl:grid xl:grid-cols-4 gap-6">
          {panels.map((panel, index) => (
            <MonitoringPanel key={index} {...panel} />
          ))}
        </div>

        {/* Tablet: 2x2 grid */}
        <div className="hidden lg:grid lg:grid-cols-2 xl:hidden gap-6">
          {panels.map((panel, index) => (
            <MonitoringPanel key={index} {...panel} />
          ))}
        </div>

        {/* Mobile: Stack vertical */}
        <div className="lg:hidden space-y-6">
          {panels.map((panel, index) => (
            <MonitoringPanel key={index} {...panel} />
          ))}
        </div>
      </div>
    </div>
  );
};