import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { message } from "antd";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        message.error(`Error fetching data: ${error}`);
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable refetch on window focus
      staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    },
  },
});

export const QueryWrapper = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};