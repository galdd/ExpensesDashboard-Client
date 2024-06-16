import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api";
import { NotificationType } from "../@types/notification-props";

const fetchNotifications = async (
  token: string
): Promise<NotificationType[]> => {
  const init = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await apiFetch("/api/notifications", init);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

const clearNotificationsOnServer = async (token: string): Promise<void> => {
  const init = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await apiFetch("/api/notifications/clear", init);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
};

export const useNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);
      } catch (error) {
        console.error("Error fetching the access token", error);
      }
    })();
  }, [getAccessTokenSilently]);

  const query = useQuery<NotificationType[], Error>({
    queryKey: ["notifications", token],
    queryFn: () => fetchNotifications(token!),
    enabled: !!token,
  });

  const clearNotificationsMutation = useMutation({
    mutationFn: () => clearNotificationsOnServer(token!),
    onSuccess: () => {
      queryClient.setQueryData(["notifications", token], []);
    },
  });

  const setNotifications = (value: React.SetStateAction<NotificationType[]>) => {
    queryClient.setQueryData(["notifications", token], value);
  };

  const clearNotifications = () => {
    clearNotificationsMutation.mutate();
  };

  return {
    ...query,
    setNotifications,
    clearNotifications,
  };
};
