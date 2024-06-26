import { useQuery } from "@tanstack/react-query";
import { fetchHealthCheck } from "./fetch-health-check";

export const useHealthCheck = () =>
  useQuery({
    queryKey: ["health-check"],
    queryFn: fetchHealthCheck,
    refetchInterval: 50000,
    refetchIntervalInBackground: true,
    retry: false,
  });
