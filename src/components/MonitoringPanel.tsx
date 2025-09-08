// src/components/MonitoringPanel.tsx

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortainerContainerStats, UptimeKumaHeartbeatResponse, UptimeKumaStatusPageData } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TooltipProps } from 'recharts';

interface MonitoringPanelProps {
    type: 'uptime-kuma' | 'portainer' | 'digitalocean';
    title: string;
    description: string;
    icon: React.ReactNode;
    statusPageSlug?: string;
    containerId?: string;
    dropletId?: string;
}

interface ChartData {
    time: string;
    cpu: number;
    memory: number;
}

interface DigitalOceanChartData {
    time: string;
    cpu: number;
    memory: number;
    load: number;
}

interface CombinedUptimeData {
    id: number;
    name: string;
    status: 'up' | 'down' | 'pending';
    uptime: number;
}

const PORTAINER_ENDPOINT_ID = 3;

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-background-tertiary border border-border rounded-lg shadow-lg text-sm">
                <p className="font-bold text-foreground">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }}>
                        {`${entry.name}: ${entry.value}${entry.name === 'CPU' ? '%' : entry.name === 'Load' ? '' : ' MB'}`}
                    </p>
                ))}
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

export const MonitoringPanel = ({
                                    type,
                                    title,
                                    description,
                                    icon,
                                    statusPageSlug,
                                    containerId,
                                    dropletId,
                                }: MonitoringPanelProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [uptimeData, setUptimeData] = useState<CombinedUptimeData[]>([]);
    const [portainerStats, setPortainerStats] = useState<ChartData[]>([]);
    const [digitalOceanStats, setDigitalOceanStats] = useState<DigitalOceanChartData[]>([]);

    const fetchDigitalOceanData = useCallback(async (dropletId: string) => {
        try {
            console.log('🚀 INICIANDO BUSCA DE DADOS DO DIGITALOCEAN para o droplet:', dropletId);

            const now = Math.floor(Date.now() / 1000);
            const start = now - 3600; // 1 hora de dados

            const fetchWithTimeout = async (url: string, name: string) => {
                try {
                    const response = await fetch(url, {
                        signal: AbortSignal.timeout(15000) // 15 segundos de timeout
                    });
                    if (!response.ok) {
                        console.error(`❌ Falha na busca de ${name}: ${response.status} ${response.statusText}`);
                        return null;
                    }
                    console.log(`✅ ${name}: ${response.status} ${response.statusText}`);
                    return await response.json();
                } catch (error) {
                    console.error(`❌ Erro na busca de ${name}:`, error);
                    return null;
                }
            };

            const [cpuMetrics, memTotalMetrics, memAvailableMetrics, diskTotalMetrics, diskFreeMetrics] = await Promise.all([
                fetchWithTimeout(`/api/do/v2/monitoring/metrics/droplet/cpu?host_id=${dropletId}&start=${start}&end=${now}`, 'CPU'),
                fetchWithTimeout(`/api/do/v2/monitoring/metrics/droplet/memory_total?host_id=${dropletId}&start=${start}&end=${now}`, 'Memória Total'),
                fetchWithTimeout(`/api/do/v2/monitoring/metrics/droplet/memory_available?host_id=${dropletId}&start=${start}&end=${now}`, 'Memória Disponível'),
                fetchWithTimeout(`/api/do/v2/monitoring/metrics/droplet/filesystem_size?host_id=${dropletId}&start=${start}&end=${now}`, 'Tamanho do Disco'),
                fetchWithTimeout(`/api/do/v2/monitoring/metrics/droplet/filesystem_free?host_id=${dropletId}&start=${start}&end=${now}`, 'Disco Livre')
            ]);

            let finalCpu = 0;
            let finalMemory = 0;
            let finalDisk = 0;

            // Cálculo de CPU
            if (cpuMetrics?.data?.result?.length > 0) {
                const metrics = cpuMetrics.data.result;
                const lastValues: { [key: string]: number } = {};
                const prevValues: { [key: string]: number } = {};

                let hasEnoughData = true;
                metrics.forEach((metric: any) => {
                    if (metric.values && metric.values.length > 1) {
                        lastValues[metric.metric.mode] = parseFloat(metric.values[metric.values.length - 1][1]);
                        prevValues[metric.metric.mode] = parseFloat(metric.values[metric.values.length - 2][1]);
                    } else {
                        hasEnoughData = false;
                    }
                });

                if (hasEnoughData) {
                    const lastTotal = Object.values(lastValues).reduce((a, b) => a + b, 0);
                    const prevTotal = Object.values(prevValues).reduce((a, b) => a + b, 0);

                    const lastIdle = lastValues.idle || 0;
                    const prevIdle = prevValues.idle || 0;

                    const totalDiff = lastTotal - prevTotal;
                    const idleDiff = lastIdle - prevIdle;

                    if (totalDiff > 0) {
                        const usage = 100 * (totalDiff - idleDiff) / totalDiff;
                        finalCpu = Math.max(0, Math.min(100, usage));
                    }
                }
            }


            // Cálculo de Memória
            if (memTotalMetrics?.data?.result?.[0]?.values && memAvailableMetrics?.data?.result?.[0]?.values) {
                const totalMem = parseFloat(memTotalMetrics.data.result[0].values.slice(-1)[0][1]);
                const availableMem = parseFloat(memAvailableMetrics.data.result[0].values.slice(-1)[0][1]);
                if (totalMem > 0) {
                    finalMemory = 100 * (1 - (availableMem / totalMem));
                }
            }

            // Cálculo de Disco
            if (diskTotalMetrics?.data?.result?.[0]?.values && diskFreeMetrics?.data?.result?.[0]?.values) {
                const totalDisk = parseFloat(diskTotalMetrics.data.result[0].values.slice(-1)[0][1]);
                const freeDisk = parseFloat(diskFreeMetrics.data.result[0].values.slice(-1)[0][1]);
                if (totalDisk > 0) {
                    finalDisk = 100 * (1 - (freeDisk / totalDisk));
                }
            }

            const currentTime = new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const newData: DigitalOceanChartData = {
                time: currentTime,
                cpu: parseFloat(finalCpu.toFixed(2)),
                memory: parseFloat(finalMemory.toFixed(2)),
                load: parseFloat(finalDisk.toFixed(2)) // Usando 'load' para o disco
            };

            console.log('🎯 DADOS FINAIS:', newData);

            setDigitalOceanStats(prevStats => [...prevStats.slice(-9), newData]);

        } catch (error) {
            console.error('💥 Erro em fetchDigitalOceanData:', error);
            throw error;
        }
    }, []);

    const fetchData = useCallback(async () => {
        // Remove a verificação `isLoading` daqui para permitir o refresh manual
        setHasError(false);
        setErrorMessage('');

        try {
            if (type === 'uptime-kuma' && statusPageSlug) {
                const [statusPageRes, heartbeatRes] = await Promise.all([
                    fetch(`/api/uptime/api/status-page/${statusPageSlug}`),
                    fetch(`/api/uptime/api/status-page/heartbeat/${statusPageSlug}`)
                ]);

                if (!statusPageRes.ok) throw new Error(`Erro na API Status Page: ${statusPageRes.statusText}`);
                if (!heartbeatRes.ok) throw new Error(`Erro na API Heartbeat: ${heartbeatRes.statusText}`);

                const statusPageData: UptimeKumaStatusPageData = await statusPageRes.json();
                const heartbeatData: UptimeKumaHeartbeatResponse = await heartbeatRes.json();

                const allMonitors = statusPageData.publicGroupList.flatMap((group: any) => group.monitorList);

                const combinedData = allMonitors.map((monitor: any) => {
                    const uptime = (heartbeatData.uptimeList[`${monitor.id}_24`] || 0) * 100;
                    const lastHeartbeat = heartbeatData.heartbeatList[monitor.id]?.slice(-1)[0];
                    let status: 'up' | 'down' | 'pending' = 'pending';
                    if (lastHeartbeat) {
                        if (lastHeartbeat.status === 1) status = 'up';
                        else if (lastHeartbeat.status === 0) status = 'down';
                    }
                    return { id: monitor.id, name: monitor.name, status, uptime };
                });
                setUptimeData(combinedData);

            } else if (type === 'portainer' && containerId) {
                const response = await fetch(`/api/portainer/endpoints/${PORTAINER_ENDPOINT_ID}/docker/containers/${containerId}/stats?stream=false`);

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

            } else if (type === 'digitalocean' && dropletId) {
                await fetchDigitalOceanData(dropletId);
            }
        } catch (error) {
            console.error(`Erro ao buscar dados para '${title}':`, error);
            setHasError(true);
            setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
        }
    }, [type, statusPageSlug, containerId, dropletId, title, fetchDigitalOceanData]);

    useEffect(() => {
        let isMounted = true;

        const initialFetch = async () => {
            setIsLoading(true);
            await fetchData();
            if (isMounted) {
                setIsLoading(false);
            }
        };

        initialFetch();

        const interval = setInterval(fetchData, type === 'digitalocean' ? 60000 : 30000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [fetchData, type]); // Removido 'isLoading' das dependências


    const handleRefresh = useCallback(async () => {
        setIsLoading(true);
        await fetchData();
        setIsLoading(false);
    }, [fetchData]);

    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
    const overallStatus = uptimeData.length > 0 ? (uptimeData.every(m => m.status === 'up') ? 'online' : 'offline') : 'pending';

    return (
        <div className={`glass-card flex flex-col transition-all duration-300 ${ isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : (type === 'uptime-kuma' ? 'h-auto' : 'h-[600px]') }`}>
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
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={toggleFullscreen} size="sm" variant="ghost" className="text-muted-foreground hover:text-primary">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            <div className="relative flex-grow p-4 overflow-y-auto">
                {isLoading && (
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
                        <p className="text-muted-foreground text-sm mb-2">Não foi possível carregar da API.</p>
                        {errorMessage && (
                            <p className="text-red-400 text-xs max-w-full break-words px-4">
                                {errorMessage}
                            </p>
                        )}
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
                {!hasError && type === 'digitalocean' && digitalOceanStats.length > 0 && (
                    <div className="flex flex-col justify-center h-full space-y-6">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-white mb-2">
                                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-lg text-muted-foreground">CPU:</span>
                                <span className="text-2xl font-bold text-[#00d4ff]">
                                    {digitalOceanStats[digitalOceanStats.length - 1]?.cpu.toFixed(2)}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-lg text-muted-foreground">Memória:</span>
                                <span className="text-2xl font-bold text-[#22c55e]">
                                    {digitalOceanStats[digitalOceanStats.length - 1]?.memory.toFixed(2)}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-lg text-muted-foreground">Disco:</span>
                                <span className="text-2xl font-bold text-[#f59e0b]">
                                    {digitalOceanStats[digitalOceanStats.length - 1]?.load.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};