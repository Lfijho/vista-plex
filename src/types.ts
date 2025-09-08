// src/types.ts
// --- Uptime Kuma ---
export interface Heartbeat {
    status: 0 | 1 | 2;
    time: string;
    ping: number;
}
export interface UptimeKumaPublicMonitor {
    id: number;
    name: string;
}
export interface UptimeKumaPublicGroup {
    name: string;
    monitorList: UptimeKumaPublicMonitor[];
}
export interface UptimeKumaStatusPageData {
    publicGroupList: UptimeKumaPublicGroup[];
}
export interface UptimeKumaHeartbeatResponse {
    heartbeatList: {
        [monitorID: string]: Heartbeat[];
    };
    uptimeList: {
        [monitorID_duration: string]: number;
    };
}

// --- Portainer ---
interface CpuUsage {
    total_usage: number;
}
interface CpuStats {
    cpu_usage: CpuUsage;
    system_cpu_usage: number;
    online_cpus?: number;
}
export interface PortainerContainerStats {
    precpu_stats: CpuStats;
    cpu_stats: CpuStats;
    memory_stats: {
        usage: number;
        limit: number;
    };
}

// --- DigitalOcean ---
export interface DigitalOceanMetric {
    data: {
        result: {
            metric: {
                mode?: string;
            };
            values: [number, string][];
        }[];
    };
}