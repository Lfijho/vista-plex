import { DashboardHeader } from './DashboardHeader';
import { MonitoringPanel } from './MonitoringPanel';
import { Monitor, Server, Activity, Database } from 'lucide-react';

export const Dashboard = () => {
    const panels = [
        {
            type: 'uptime-kuma',
            title: 'Uptime Monitor',
            description: 'Status de disponibilidade dos serviços',
            statusPageSlug: 'dashiilex', // <-- CORRIGIDO COM SEU SLUG
            icon: <Monitor className="w-5 h-5 text-primary" />,
        },
        {
            type: 'portainer',
            title: 'iilex-excel-api',
            description: 'Métricas de desempenho do contêiner',
            containerId: 'bc1cb892e02ada73c0ff131deb5f61b9fe7f954005a2d4c9a6e1dd7e985741d8',
            icon: <Server className="w-5 h-5 text-primary" />,
        },
        {
            type: 'portainer',
            title: 'Solr',
            description: 'Métricas de desempenho do contêiner',
            containerId: 'fd5db1d510c4e28fdf6a88de1b19d12555aa5bc318c8f4623c22d298ad609b81',
            icon: <Activity className="w-5 h-5 text-primary" />,
        },
        {
            type: 'portainer',
            title: 'Wiki',
            description: 'Métricas de desempenho do contêiner',
            containerId: 'e001291642d5460945deb4de32a8d20adce2e95e531f4addaeced8e25f070456',
            icon: <Database className="w-5 h-5 text-primary" />,
        },
    ] as const;

    return (
        <div className="min-h-screen p-4 lg:p-8" style={{
            backgroundColor: '#0f0f0f',
            color: '#f8fafc',
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(0, 212, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 153, 204, 0.05) 0%, transparent 50%)',
            backgroundAttachment: 'fixed'
        }}>
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