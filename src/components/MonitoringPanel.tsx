import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortainerContainerStats, UptimeKumaHeartbeatResponse, UptimeKumaStatusPageData } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TooltipProps } from 'recharts';

// --- Interfaces e Tipos ---
interface MonitoringPanelProps {
    type: 'uptime-kuma' | 'portainer';
    title: string;
    description: string;
    icon: React.ReactNode;
    statusPageSlug?: string;
    containerId?: string;
}

interface ChartData {
    time: string;
    cpu: number;
    memory: number;
}

interface CombinedUptimeData {
    id: number;
    name: string;
    status: 'up' | 'down' | 'pending';
    uptime: number;
}

// --- Constantes da API ---
const PORTAINER_API_KEY = import.meta.env.VITE_PORTAINER_API_KEY;
const PORTAINER_ENDPOINT_ID = 3;

// --- Componentes Auxiliares ---
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-background-tertiary border border-border rounded-lg shadow-lg text-sm">
                <p className="font-bold text-foreground">{label}</p>
                <p className="text-primary">{`CPU: ${payload[0].value}%`}</p>
                <p className="text-green-500">{`Memória: ${payload[1].value} MB`}</p>
            </div>
        );
    }
    return null;
};

const UptimeStatusIndicator = ({ status }: { status: 'up' | 'down' | 'pending' }) => {
    const statusMap = {
        down: { color: 'bg-red-500' },
        up: { color: 'bg-green-500' },
        pending: { color: 'bg-yellow-500' },
    };
    const { color } = statusMap[status] || statusMap.pending;
    return <div className={`w-3 h-3 rounded-full ${color}`} />;
};


// --- Componente Principal ---
export const MonitoringPanel = ({
                                    type,
                                    title,
                                    description,
                                    icon,
                                    statusPageSlug,
                                    containerId,
                                }: MonitoringPanelProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [uptimeData, setUptimeData] = useState<CombinedUptimeData[]>([]);
    const [portainerStats, setPortainerStats] = useState<ChartData[]>([]);

    const fetchData = useCallback(async () => {
        if (uptimeData.length === 0 && portainerStats.length === 0) setIsLoading(true);
        setHasError(false);

        try {
            if (type === 'uptime-kuma' && statusPageSlug) {
                // CORRIGIDO: Faz as duas chamadas de API em paralelo
                const [statusPageRes, heartbeatRes] = await Promise.all([
                    fetch(`/api/uptime/api/status-page/${statusPageSlug}`),
                    fetch(`/api/uptime/api/status-page/heartbeat/${statusPageSlug}`)
                ]);

                if (!statusPageRes.ok) throw new Error(`Erro na API Status Page: ${statusPageRes.statusText}`);
                if (!heartbeatRes.ok) throw new Error(`Erro na API Heartbeat: ${heartbeatRes.statusText}`);

                const statusPageData: UptimeKumaStatusPageData = await statusPageRes.json();
                const heartbeatData: UptimeKumaHeartbeatResponse = await heartbeatRes.json();

                const allMonitors = statusPageData.publicGroupList.flatMap(group => group.monitorList);

                const combinedData = allMonitors.map(monitor => {
                    const uptime = (heartbeatData.uptimeList[`${monitor.id}_24`] || 0) * 100;
                    const lastHeartbeat = heartbeatData.heartbeatList[monitor.id]?.slice(-1)[0];
                    let status: 'up' | 'down' | 'pending' = 'pending';
                    if (lastHeartbeat) {
                        if (lastHeartbeat.status === 1) status = 'up';
                        else if (lastHeartbeat.status === 0) status = 'down';
                    }

                    return {
                        id: monitor.id,
                        name: monitor.name,
                        status: status,
                        uptime: uptime
                    };
                });

                setUptimeData(combinedData);

            } else if (type === 'portainer' && containerId) {
                const response = await fetch(`/api/portainer/endpoints/${PORTAINER_ENDPOINT_ID}/docker/containers/${containerId}/stats?stream=false`, {
                    headers: { 'X-API-Key': PORTAINER_API_KEY },
                });
                if (!response.ok) throw new Error(`Erro na API do Portainer: ${response.statusText}`);

                const data: PortainerContainerStats = await response.json();

                const cpuDelta = data.cpu_stats.cpu_usage.total_usage - data.precpu_stats.cpu_usage.total_usage;
                const systemDelta = data.cpu_stats.system_cpu_usage - data.precpu_stats.system_cpu_usage;
                const cpuCount = data.cpu_stats.online_cpus || 1;
                const cpuPercentage = systemDelta > 0 && cpuDelta > 0 ? (cpuDelta / systemDelta) * cpuCount * 100 : 0;

                const newStat = {
                    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    cpu: parseFloat(cpuPercentage.toFixed(2)),
                    memory: parseFloat((data.memory_stats.usage / (1024 * 1024)).toFixed(2)),
                };

                setPortainerStats(prevStats => [...prevStats.slice(-9), newStat]);
            }
        } catch (error) {
            console.error(`Erro ao buscar dados para '${title}':`, error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, [type, statusPageSlug, containerId, title, uptimeData.length, portainerStats.length]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => fetchData();
    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
    const overallStatus = uptimeData.length > 0 ? (uptimeData.every(m => m.status === 'up') ? 'online' : 'offline') : 'pending';

    return (
        <div className={`glass-card flex flex-col transition-all duration-300 ${ isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[600px]' }`}>
            <div className="p-4 border-b border-card-border flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">{icon}</div>
                    <div className='flex-grow overflow-hidden'>
                        <h3 className="font-semibold text-lg truncate">{title}</h3>
                        <p className="text-muted-foreground text-sm truncate">{description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {type === 'uptime-kuma' && <div className={`status-dot ${overallStatus === 'online' ? 'status-online' : 'status-offline'}`}></div>}
                    <Button onClick={handleRefresh} size="sm" variant="ghost" className="text-muted-foreground hover:text-primary">
                        <RefreshCw className={`w-4 h-4 ${isLoading && uptimeData.length === 0 && portainerStats.length === 0 ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={toggleFullscreen} size="sm" variant="ghost" className="text-muted-foreground hover:text-primary">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            <div className="relative flex-grow p-4 overflow-y-auto">
                {(isLoading && uptimeData.length === 0 && portainerStats.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-muted-foreground">Carregando dados...</p>
                        </div>
                    </div>
                )}
                {hasError && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <AlertTriangle className="w-12 h-12 text-warning mb-4" />
                        <h4 className="font-semibold text-lg">Erro ao Buscar Dados</h4>
                        <p className="text-muted-foreground text-sm">Não foi possível carregar da API.</p>
                    </div>
                )}
                {!hasError && type === 'uptime-kuma' && uptimeData.length > 0 && (
                    <div className="space-y-3">
                        {uptimeData.map(monitor => {
                            const uptimeValue = monitor.uptime;
                            return (
                                <div key={monitor.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        <UptimeStatusIndicator status={monitor.status} />
                                        <span>{monitor.name}</span>
                                    </div>
                                    <span className={`font-medium ${uptimeValue >= 99.9 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {uptimeValue.toFixed(2)}%
                            </span>
                                </div>
                            )
                        })}
                    </div>
                )}
                {!hasError && type === 'portainer' && portainerStats.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={portainerStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis dataKey="time" stroke="#a3a3a3" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="left" stroke="#00d4ff" tick={{ fontSize: 12 }} unit="%" />
                            <YAxis yAxisId="right" orientation="right" stroke="#22c55e" tick={{ fontSize: 12 }} unit="MB" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: "14px"}} />
                            <Line yAxisId="left" type="monotone" dataKey="cpu" stroke="#00d4ff" strokeWidth={2} dot={false} name="CPU" />
                            <Line yAxisId="right" type="monotone" dataKey="memory" stroke="#22c55e" strokeWidth={2} dot={false} name="Memória" />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};