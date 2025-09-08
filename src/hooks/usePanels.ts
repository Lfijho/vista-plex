// src/hooks/usePanels.ts
import { useState, useEffect } from 'react';
import { Monitor, Server, Activity, Database, Smartphone, Cloud, Wifi, HardDrive, BarChart3 } from 'lucide-react';

// Tipos para os painéis que podem ser salvos no localStorage
export type PanelType = 'uptime-kuma' | 'portainer' | 'digitalocean' | 'netdata';
export type IconType = 'Monitor' | 'Server' | 'Activity' | 'Database' | 'Smartphone' | 'Cloud' | 'Wifi' | 'HardDrive' | 'BarChart3';

export interface PanelConfig {
    id: string;
    type: PanelType;
    title: string;
    description: string;
    icon: IconType;
    statusPageSlug?: string;
    containerId?: string;
    dropletId?: string;
}

// Dados iniciais para popular o dashboard na primeira vez que for carregado
const defaultPanels: PanelConfig[] = [
    { id: '1', type: 'uptime-kuma', title: 'Uptime Monitor', description: 'Status de disponibilidade dos serviços', statusPageSlug: 'dashiilex', icon: 'Monitor' },
    { id: '11', type: 'uptime-kuma', title: 'Monitor Homologação', description: 'Status de disponibilidade (Homologação)', statusPageSlug: 'homologacao', icon: 'Monitor' },
    { id: '2', type: 'portainer', title: 'iilex-excel-api', description: 'Métricas de desempenho do contêiner', containerId: 'bc1cb892e02ada73c0ff131deb5f61b9fe7f954005a2d4c9a6e1dd7e985741d8', icon: 'Server' },
    { id: '3', type: 'portainer', title: 'Solr', description: 'Métricas de desempenho do contêiner', containerId: 'fd5db1d510c4e28fdf6a88de1b19d12555aa5bc318c8f4623c22d298ad609b81', icon: 'Activity' },
    { id: '4', type: 'portainer', title: 'Wiki', description: 'Métricas de desempenho do contêiner', containerId: 'e001291642d5460945deb4de32a8d20adce2e95e531f4addaeced8e25f070456', icon: 'Database' },
    { id: '5', type: 'digitalocean', title: 'iilex-aplicacao-01', description: 'Métricas do servidor via DO API', dropletId: '406353303', icon: 'BarChart3' },
    { id: '6', type: 'digitalocean', title: 'iilex-aplicacao-03', description: 'Métricas do servidor via DO API', dropletId: '419599969', icon: 'BarChart3' },
    { id: '7', type: 'digitalocean', title: 'iilex-aplicacao-04', description: 'Métricas do servidor via DO API', dropletId: '420305849', icon: 'BarChart3' },
    { id: '8', type: 'digitalocean', title: 'iilex-aplicacao-05', description: 'Métricas do servidor via DO API', dropletId: '441360552', icon: 'BarChart3' },
    { id: '9', type: 'digitalocean', title: 'iilex-aplicacao-06', description: 'Métricas do servidor via DO API', dropletId: '462772429', icon: 'BarChart3' },
    { id: '10', type: 'digitalocean', title: 'iilex-aplicacao-07', description: 'Métricas do servidor via DO API', dropletId: '481942271', icon: 'BarChart3' }
];

export const usePanels = () => {
    const [panels, setPanels] = useState<PanelConfig[]>([]);

    useEffect(() => {
        try {
            const savedPanels = localStorage.getItem('dashboard-panels');
            if (savedPanels) {
                setPanels(JSON.parse(savedPanels));
            } else {
                // Se não houver painéis salvos, usa os padrões
                setPanels(defaultPanels);
                localStorage.setItem('dashboard-panels', JSON.stringify(defaultPanels));
            }
        } catch (error) {
            console.error("Erro ao carregar painéis do localStorage:", error);
            setPanels(defaultPanels);
        }
    }, []);

    const savePanels = (newPanels: PanelConfig[]) => {
        setPanels(newPanels);
        localStorage.setItem('dashboard-panels', JSON.stringify(newPanels));
    };

    const addPanel = (panel: Omit<PanelConfig, 'id'>) => {
        const newPanel = { ...panel, id: new Date().toISOString() };
        const updatedPanels = [...panels, newPanel];
        savePanels(updatedPanels);
    };

    const removePanel = (panelId: string) => {
        const updatedPanels = panels.filter(p => p.id !== panelId);
        savePanels(updatedPanels);
    };

    return { panels, addPanel, removePanel };
};