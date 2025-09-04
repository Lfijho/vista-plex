import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonitoringPanelProps {
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  status?: 'online' | 'warning' | 'offline';
}

export const MonitoringPanel = ({ 
  title, 
  description, 
  url, 
  icon, 
  status = 'online' 
}: MonitoringPanelProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setHasError(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const openInNewTab = () => {
    window.open(url, '_blank');
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'status-online';
      case 'warning': return 'status-warning';
      case 'offline': return 'status-offline';
      default: return 'status-online';
    }
  };

  return (
    <div 
      className={`glass-card transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' 
          : 'h-[600px]'
      }`}
      style={{
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        border: '1px solid rgba(248, 250, 252, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)',
        color: '#f8fafc'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-card-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`status-dot ${getStatusColor()}`}></div>
          
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            onClick={openInNewTab}
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={toggleFullscreen}
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative h-[calc(100%-80px)]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Carregando painel...</p>
            </div>
          </div>
        )}

        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-warning/20 border border-warning/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Erro de CORS</h4>
                <p className="text-muted-foreground">Não foi possível carregar o painel inline</p>
              </div>
              <Button onClick={openInNewTab} className="mt-4">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir em Nova Aba
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            key={refreshKey}
            src={url}
            className="w-full h-full rounded-b-lg"
            frameBorder="0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title={title}
          />
        )}
      </div>
    </div>
  );
};