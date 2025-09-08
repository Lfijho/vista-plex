import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortainerContainerStats, UptimeKumaHeartbeatResponse, UptimeKumaStatusPageData } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { TooltipProps } from 'recharts';

interface MonitoringPanelProps {
    type: 'uptime-kuma' | 'portainer' | 'netdata';
    title: string;
    description: string;
    icon: React.ReactNode;
    statusPageSlug?: string;
    containerId?: string;
    netdataUrl?: string;
}

interface ChartData {
    time: string;
    cpu: number;
    memory: number;
}

interface NetdataChartData {
    time: string;
    cpu: number;
    memory: number;
    disk: number;
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
                        {`${entry.name}: ${entry.value}${entry.name === 'CPU' ? '%' : entry.name === 'Disco' ? '%' : ' MB'}`}
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
                                    netdataUrl,
                                }: MonitoringPanelProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [uptimeData, setUptimeData] = useState<CombinedUptimeData[]>([]);
    const [portainerStats, setPortainerStats] = useState<ChartData[]>([]);
    const [netdataStats, setNetdataStats] = useState<NetdataChartData[]>([]);

    const fetchNetdataData = useCallback(async (baseUrl: string) => {
        try {
            console.log('Fetching Netdata data from:', baseUrl);

            // Primeiro, vamos tentar buscar informações básicas do Netdata
            const infoResponse = await fetch('/api/netdata/api/v1/info');
            if (!infoResponse.ok) {
                throw new Error(`Erro ao conectar com Netdata: ${infoResponse.status} ${infoResponse.statusText}`);
            }

            const infoData = await infoResponse.json();
            console.log('Netdata Info:', infoData);

            // Buscar lista de charts disponíveis
            const chartsResponse = await fetch('/api/netdata/api/v1/charts');
            if (!chartsResponse.ok) {
                throw new Error(`Erro ao buscar charts: ${chartsResponse.status} ${chartsResponse.statusText}`);
            }

            const chartsData = await chartsResponse.json();
            console.log('Available charts:', Object.keys(chartsData.charts));

            const now = Math.floor(Date.now() / 1000);
            const timeRange = 600; // 10 minutos
            const after = now - timeRange;

            // Tentar diferentes endpoints de CPU
            const cpuCharts = ['system.cpu', 'cpu.cpu0', 'system.load'];
            let cpuData = null;

            for (const chart of cpuCharts) {
                try {
                    const response = await fetch(`/api/netdata/api/v1/data?chart=${chart}&after=${after}&before=${now}&points=10&group=average&format=json`);
                    if (response.ok) {
                        cpuData = await response.json();
                        console.log(`CPU data from ${chart}:`, cpuData);
                        break;
                    }
                } catch (e) {
                    console.log(`Failed to fetch ${chart}:`, e);
                }
            }

            // Tentar diferentes endpoints de memória
            const memCharts = ['system.ram', 'mem.available', 'system.memory'];
            let memData = null;

            for (const chart of memCharts) {
                try {
                    const response = await fetch(`/api/netdata/api/v1/data?chart=${chart}&after=${after}&before=${now}&points=10&group=average&format=json`);
                    if (response.ok) {
                        memData = await response.json();
                        console.log(`Memory data from ${chart}:`, memData);
                        break;
                    }
                } catch (e) {
                    console.log(`Failed to fetch ${chart}:`, e);
                }
            }

            // Tentar diferentes endpoints de disco
            const diskCharts = ['disk_space._', 'disk.sda', 'system.io'];
            let diskData = null;

            for (const chart of diskCharts) {
                try {
                    const response = await fetch(`/api/netdata/api/v1/data?chart=${chart}&after=${after}&before=${now}&points=10&group=average&format=json`);
                    if (response.ok) {
                        diskData = await response.json();
                        console.log(`Disk data from ${chart}:`, diskData);
                        break;
                    }
                } catch (e) {
                    console.log(`Failed to fetch ${chart}:`, e);
                }
            }

            // Processar os dados encontrados
            const processedData: NetdataChartData[] = [];

            if (cpuData || memData || diskData) {
                // Usar os dados do primeiro chart que funcionou para determinar os timestamps
                const referenceData = cpuData || memData || diskData;
                const points = referenceData.result?.[0] || [];

                for (let i = 0; i < Math.min(points.length, 10); i++) {
                    const time = new Date(points[i][0] * 1000).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    let cpu = 0;
                    let memory = 0;
                    let disk = 0;

                    // Processar CPU
                    if (cpuData && cpuData.result) {
                        if (cpuData.result.length > 1) {
                            // Somar uso de CPU de todos os cores
                            cpu = cpuData.result.slice(0, -1).reduce((sum: number, core: any) => {
                                const value = core[i] ? parseFloat(core[i][1]) || 0 : 0;
                                return sum + value;
                            }, 0);
                        } else if (cpuData.result[0] && cpuData.result[0][i]) {
                            cpu = parseFloat(cpuData.result[0][i][1]) || 0;
                        }
                    }

                    // Processar Memória
                    if (memData && memData.result) {
                        if (memData.result.length >= 2 && memData.result[0][i] && memData.result[1][i]) {
                            const total = parseFloat(memData.result[0][i][1]) || 1;
                            const used = parseFloat(memData.result[1][i][1]) || 0;
                            memory = (used / total) * 100;
                        } else if (memData.result[0] && memData.result[0][i]) {
                            memory = parseFloat(memData.result[0][i][1]) || 0;
                        }
                    }

                    // Processar Disco
                    if (diskData && diskData.result && diskData.result[0] && diskData.result[0][i]) {
                        disk = parseFloat(diskData.result[0][i][1]) || 0;
                    }

                    processedData.push({
                        time,
                        cpu: parseFloat(cpu.toFixed(2)),
                        memory: parseFloat(memory.toFixed(2)),
                        disk: parseFloat(disk.toFixed(2))
                    });
                }

                console.log('Processed data:', processedData);
                setNetdataStats(processedData);
            } else {
                throw new Error('Nenhum chart de dados encontrado');
            }

        } catch (error) {
            console.error('Erro detalhado ao buscar dados do Netdata:', error);
            throw error;
        }
    }, []);

    const fetchData = useCallback(async () => {
        if (uptimeData.length === 0 && portainerStats.length === 0 && netdataStats.length === 0) {
            setIsLoading(true);
        }
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

            } else if (type === 'netdata' && netdataUrl) {
                await fetchNetdataData(netdataUrl);
            }
        } catch (error) {
            console.error(`Erro ao buscar dados para '${title}':`, error);
            setHasError(true);
            setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
        } finally {
            setIsLoading(false);
        }
    }, [type, statusPageSlug, containerId, netdataUrl, title, uptimeData.length, portainerStats.length, netdataStats.length, fetchNetdataData]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, type === 'netdata' ? 30000 : 10000);
        return () => clearInterval(interval);
    }, [fetchData, type]);

    const handleRefresh = () => fetchData();
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
                        <RefreshCw className={`w-4 h-4 ${isLoading && uptimeData.length === 0 && portainerStats.length === 0 && netdataStats.length === 0 ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={toggleFullscreen} size="sm" variant="ghost" className="text-muted-foreground hover:text-primary">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            <div className="relative flex-grow p-4 overflow-y-auto">
                {(isLoading && uptimeData.length === 0 && portainerStats.length === 0 && netdataStats.length === 0) && (
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
                {!hasError && type === 'netdata' && netdataStats.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={netdataStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis dataKey="time" stroke="#a3a3a3" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#a3a3a3" tick={{ fontSize: 12 }} unit="%" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: "14px"}} />
                            <Area type="monotone" dataKey="cpu" stackId="1" stroke="#00d4ff" fillOpacity={1} fill="url(#colorCpu)" name="CPU" strokeWidth={2} />
                            <Area type="monotone" dataKey="memory" stackId="2" stroke="#22c55e" fillOpacity={1} fill="url(#colorMemory)" name="Memória" strokeWidth={2} />
                            <Area type="monotone" dataKey="disk" stackId="3" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDisk)" name="Disco" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};