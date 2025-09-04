import { useState, useEffect } from 'react';
import { Monitor, Activity, Server, Clock } from 'lucide-react';

export const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-card p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/20 border border-primary/30 glow-primary">
            <Monitor className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Dashboard de Monitoramento
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Uptime Kuma + Portainer Stats
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/20 border border-success/30">
            <div className="status-dot status-online"></div>
            <span className="text-success font-medium">Sistemas Online</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono">
              {currentTime.toLocaleDateString('pt-BR')} {currentTime.toLocaleTimeString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};