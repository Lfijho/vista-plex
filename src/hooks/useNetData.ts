import { useQuery } from "@tanstack/react-query";

const NETDATA_BASE = "http://68.183.53.255:19999/api/v1/data";

const fetchNetdata = async (chart: string) => {
    const res = await fetch(`${NETDATA_BASE}?chart=${chart}&after=-60&format=json`);
    if (!res.ok) throw new Error("Erro ao buscar dados do Netdata");
    return res.json();
};

export const useNetdata = (chart: string) => {
    return useQuery({
        queryKey: ["netdata", chart],
        queryFn: () => fetchNetdata(chart),
        refetchInterval: 5000, // atualiza a cada 5s
    });
};
