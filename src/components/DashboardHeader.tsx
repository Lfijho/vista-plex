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
    <header 
      className="glass-card p-6 mb-8"
      style={{
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        border: '1px solid rgba(248, 250, 252, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)',
        color: '#f8fafc'
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div 
            className="p-3 rounded-lg glow-primary"
            style={{
              backgroundColor: 'rgba(0, 212, 255, 0.2)',
              border: '1px solid rgba(0, 212, 255, 0.3)'
            }}
          >
            <Monitor className="w-8 h-8" style={{ color: '#00d4ff' }} />
          </div>
          <div>
            <h1 
              className="text-3xl font-bold"
              style={{
                background: 'linear-gradient(to right, #00d4ff, #33ddff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Dashboard de Monitoramento
            </h1>
            <p className="mt-1 flex items-center gap-2" style={{ color: '#a3a3a3' }}>
              <Activity className="w-4 h-4" />
              Uptime Kuma + Portainer Stats
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            <div className="status-dot status-online"></div>
            <span className="font-medium" style={{ color: '#22c55e' }}>Sistemas Online</span>
          </div>
          
          <div className="flex items-center gap-2" style={{ color: '#a3a3a3' }}>
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