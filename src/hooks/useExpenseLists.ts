import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  UseQueryResult,
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ExpenseListsResponse,
  ExpenseListType,
  AddExpenseListVariables,
  UpdateExpenseListVariables,
} from "../@types/expense-list-prop";
import { apiFetch } from "../api";
import { SortOrder } from "../@types/sortOrderTypes";

const fetchExpenseLists = async (
  token: string,
  offset: number,
  limit: number,
  sortOrder: SortOrder
): Promise<ExpenseListsResponse> => {
  const init = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await apiFetch(
    `/api/expenses-list?offset=${offset}&limit=${limit}&sortOrder=${sortOrder}`,
    init
  );

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data as ExpenseListsResponse;
};

const addExpenseList = async (
  token: string,
  name: string
): Promise<ExpenseListType> => {
  const init = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  };

  const response = await apiFetch("/api/expenses-list", init);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data as ExpenseListType;
};

const updateExpenseList = async (
  token: string,
  id: string,
  name: string
): Promise<ExpenseListType> => {
  const init = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  };

  const response = await apiFetch(`/api/expenses-list/${id}`, init);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data as ExpenseListType;
};

export const useExpenseLists = (
  offset: number,
  limit: number,
  sortOrder: SortOrder
): UseQueryResult<ExpenseListsResponse, Error> => {
  const [token, setToken] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth0();

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

  return useQuery<ExpenseListsResponse, Error>({
    queryKey: ["expenseLists"],
    queryFn: () => fetchExpenseLists(token!, offset, limit, sortOrder),
    enabled: !!token,
  });
};

export const useAddExpenseList = (): UseMutationResult<
  ExpenseListType,
  Error,
  AddExpenseListVariables
> => {
  const queryClient = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();

  return useMutation<ExpenseListType, Error, AddExpenseListVariables>({
    mutationFn: async ({ name }: AddExpenseListVariables) => {
      const token = await getAccessTokenSilently();
      return addExpenseList(token, name);
    },
    onSuccess: (newList) => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.setQueryData(["expenseLists"], (oldData: any) => {
        console.log("Old data:", oldData, "New data:", newList);
        if (!oldData || !oldData.data) {
          return { data: [newList] };
        }
        return {
          ...oldData,
          data: [newList, ...oldData.data],
        };
      });
    },
  });
};

export const useUpdateExpenseList = (): UseMutationResult<
  ExpenseListType,
  Error,
  UpdateExpenseListVariables
> => {
  const queryClient = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();

  return useMutation<ExpenseListType, Error, UpdateExpenseListVariables>({
    mutationFn: async ({ id, name }: UpdateExpenseListVariables) => {
      const token = await getAccessTokenSilently();
      return updateExpenseList(token, id, name);
    },
    onSuccess: (updatedList) => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.setQueryData(["expenseLists"], (oldData: any) => {
        if (!oldData || !oldData.data) {
          return { data: [updatedList] };
        }
        const updatedData = oldData.data.map((list: any) =>
          list._id === updatedList._id ? updatedList : list
        );
        return {
          ...oldData,
          data: updatedData,
        };
      });
    },
  });
};

export const useDeleteExpenseList = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();

  return useMutation<void, Error, string>({
    mutationFn: async (listId: string) => {
      const token = await getAccessTokenSilently();
      const init = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await apiFetch(`/api/expenses-list/${listId}`, init);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    },
    onSuccess: (_, listId) => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.setQueryData(["expenseLists"], (oldData: any) => {
        if (!oldData || !oldData.data) {
          return { data: [] };
        }
        return {
          ...oldData,
          data: oldData.data.filter((list: any) => list._id !== listId),
        };
      });
    },
  });
};
