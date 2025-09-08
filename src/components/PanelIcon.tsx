// src/components/PanelIcon.tsx
import { Monitor, Server, Activity, Database, Smartphone, Cloud, Wifi, HardDrive, BarChart3 } from 'lucide-react';
import { IconType } from '../hooks/usePanels';

const iconMap: Record<IconType, React.ElementType> = {
    Monitor,
    Server,
    Activity,
    Database,
    Smartphone,
    Cloud,
    Wifi,
    HardDrive,
    BarChart3,
};

export const PanelIcon = ({ icon }: { icon: IconType }) => {
    const IconComponent = iconMap[icon];
    return IconComponent ? <IconComponent className="w-5 h-5 text-primary" /> : null;
};