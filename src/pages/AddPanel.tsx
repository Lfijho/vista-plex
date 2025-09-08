// src/pages/AddPanel.tsx
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePanels, PanelConfig, PanelType, IconType } from '@/hooks/usePanels';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const panelSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    type: z.enum(['uptime-kuma', 'portainer', 'digitalocean', 'netdata']),
    icon: z.enum(['Monitor', 'Server', 'Activity', 'Database', 'Smartphone', 'Cloud', 'Wifi', 'HardDrive', 'BarChart3']),
    dropletId: z.string().optional(),
    containerId: z.string().optional(),
    statusPageSlug: z.string().optional(),
});

export default function AddPanel() {
    const navigate = useNavigate();
    const { addPanel } = usePanels();
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm<Omit<PanelConfig, 'id'>>({
        resolver: zodResolver(panelSchema),
        defaultValues: {
            type: 'portainer',
            icon: 'Server',
        }
    });

    const selectedType = watch('type');

    const onSubmit = (data: Omit<PanelConfig, 'id'>) => {
        addPanel(data);
        navigate('/');
    };

    return (
        <div className="container mx-auto p-4 lg:p-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Adicionar Novo Painel</CardTitle>
                    <CardDescription>Configure um novo painel de monitoramento para seu dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input id="title" {...register('title')} />
                            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Input id="description" {...register('description')} />
                            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Painel</Label>
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="digitalocean">DigitalOcean</SelectItem>
                                                <SelectItem value="portainer">Portainer</SelectItem>
                                                <SelectItem value="uptime-kuma">Uptime Kuma</SelectItem>
                                                <SelectItem value="netdata">Netdata</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Ícone</Label>
                                <Controller
                                    name="icon"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um ícone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Monitor">Monitor</SelectItem>
                                                <SelectItem value="Server">Server</SelectItem>
                                                <SelectItem value="Activity">Activity</SelectItem>
                                                <SelectItem value="Database">Database</SelectItem>
                                                <SelectItem value="Cloud">Cloud</SelectItem>
                                                <SelectItem value="Wifi">Wifi</SelectItem>
                                                <SelectItem value="HardDrive">HardDrive</SelectItem>
                                                <SelectItem value="BarChart3">BarChart3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        {selectedType === 'digitalocean' && (
                            <div className="space-y-2">
                                <Label htmlFor="dropletId">ID do Droplet</Label>
                                <Input id="dropletId" {...register('dropletId')} placeholder="Ex: 481942271" />
                            </div>
                        )}
                        {selectedType === 'portainer' && (
                            <div className="space-y-2">
                                <Label htmlFor="containerId">ID do Contêiner</Label>
                                <Input id="containerId" {...register('containerId')} placeholder="Ex: bc1cb892e02a..." />
                            </div>
                        )}
                        {selectedType === 'uptime-kuma' && (
                            <div className="space-y-2">
                                <Label htmlFor="statusPageSlug">Slug da Página de Status</Label>
                                <Input id="statusPageSlug" {...register('statusPageSlug')} placeholder="Ex: dashiilex" />
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => navigate('/')}>Cancelar</Button>
                            <Button type="submit">Adicionar Painel</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}