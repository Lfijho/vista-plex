// --- Uptime Kuma ---
// Descreve um monitor com seu nome, vindo da API da página de status
export interface UptimeKumaPublicMonitor {
    id: number;
    name: string;
}

// Descreve os grupos de monitores
export interface UptimeKumaPublicGroup {
    name: string;
    monitorList: UptimeKumaPublicMonitor[];
}

// Descreve a resposta da API /api/status-page/<slug>
export interface UptimeKumaStatusPageData {
    publicGroupList: UptimeKumaPublicGroup[];
}

// Descreve um 'heartbeat' (uma verificação de status)
export interface Heartbeat {
    status: 0 | 1 | 2; // 0 = down, 1 = up, 2 = pending
    time: string;
    msg: string;
    ping: number;
}

// Descreve a resposta da API /api/status-page/heartbeat/<slug>
export interface UptimeKumaHeartbeatResponse {
    heartbeatList: {
        [monitorID: string]: Heartbeat[];
    };
    uptimeList: {
        [monitorID_duration: string]: number; // Ex: "2_24": 1
    };
}


// --- Portainer (permanece a mesma) ---
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