import { MonitoringPanel } from './MonitoringPanel';
import { Monitor, Server, Activity, Database, Smartphone, Cloud, Wifi, HardDrive, BarChart3 } from 'lucide-react';

export const Dashboard = () => {
    const panels = [
        { type: 'uptime-kuma', title: 'Uptime Monitor', description: 'Status de disponibilidade dos serviços', statusPageSlug: 'dashiilex', icon: <Monitor className="w-5 h-5 text-primary" /> },
        { type: 'portainer', title: 'iilex-excel-api', description: 'Métricas de desempenho do contêiner', containerId: 'bc1cb892e02ada73c0ff131deb5f61b9fe7f954005a2d4c9a6e1dd7e985741d8', icon: <Server className="w-5 h-5 text-primary" /> },
        { type: 'portainer', title: 'Solr', description: 'Métricas de desempenho do contêiner', containerId: 'fd5db1d510c4e28fdf6a88de1b19d12555aa5bc318c8f4623c22d298ad609b81', icon: <Activity className="w-5 h-5 text-primary" /> },
        { type: 'portainer', title: 'Wiki', description: 'Métricas de desempenho do contêiner', containerId: 'e001291642d5460945deb4de32a8d20adce2e95e531f4addaeced8e25f070456', icon: <Database className="w-5 h-5 text-primary" /> },
        { type: 'digitalocean', title: 'Aplicação-07', description: 'Métricas do servidor via DO API', dropletId: '481942271', icon: <BarChart3 className="w-5 h-5 text-primary" /> },
        { type: 'portainer', title: 'Novo Serviço 2', description: 'Descrição do novo serviço 2', containerId: 'ID_DO_SEU_CONTAINER_2', icon: <Cloud className="w-5 h-5 text-primary" /> },
        { type: 'portainer', title: 'Novo Serviço 3', description: 'Descrição do novo serviço 3', containerId: 'ID_DO_SEU_CONTAINER_3', icon: <Wifi className="w-5 h-5 text-primary" /> },
        { type: 'portainer', title: 'Novo Serviço 4', description: 'Descrição do novo serviço 4', containerId: 'ID_DO_SEU_CONTAINER_4', icon: <HardDrive className="w-5 h-5 text-primary" /> },
        { type: 'portainer', title: 'Novo Serviço 5', description: 'Descrição do novo serviço 5', containerId: 'ID_DO_SEU_CONTAINER_5', icon: <Server className="w-5 h-5 text-primary" /> },
        { type: 'portainer', title: 'Novo Serviço 6', description: 'Descrição do novo serviço 6', containerId: 'ID_DO_SEU_CONTAINER_6', icon: <Activity className="w-5 h-5 text-primary" /> },
        { type: 'portainer', title: 'Novo Serviço 7', description: 'Descrição do novo serviço 7', containerId: 'ID_DO_SEU_CONTAINER_7', icon: <Database className="w-5 h-5 text-primary" /> },
    ] as const;

    const topRowPanels = panels.slice(0, 5);
    const bottomRowPanels = panels.slice(5, 11);

    return (
        <div className="min-h-screen p-4 lg:p-8" style={{
            backgroundColor: '#0f0f0f',
            color: '#f8fafc',
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(0, 212, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 153, 204, 0.05) 0%, transparent 50%)',
            backgroundAttachment: 'fixed'
        }}>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {topRowPanels.map((panel, index) => (
                        <MonitoringPanel key={`top-${index}`} {...panel} />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {bottomRowPanels.map((panel, index) => (
                        <MonitoringPanel key={`bottom-${index}`} {...panel} />
                    ))}
                </div>
            </div>
        </div>
    );
};