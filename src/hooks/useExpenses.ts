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
import { Expense, ExpenseWithListId, NewExpense } from "../@types/expense";

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

const addExpense = async (
  token: string,
  expenseData: Omit<NewExpense, "creator" | "creatorImageUrl">
): Promise<Expense> => {
  console.log("Attempting to add expense:", expenseData); // Log added
  const init = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(expenseData),
  };

  const response = await apiFetch("/api/expenses", init);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  console.log("Expense added successfully:", data); // Log added
  return data as Expense;
};

const updateExpense = async (
  token: string,
  expenseId: string,
  expenseData: Omit<ExpenseWithListId, "creator" | "creatorImageUrl">
): Promise<Expense> => {
  const init = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(expenseData),
  };

  const response = await apiFetch(`/api/expenses/${expenseId}`, init);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  console.log("Expense updated successfully:", data); // Log added
  return data as Expense;
};

const deleteExpense = async (
  token: string,
  expenseId: string,
  listId: string
): Promise<void> => {
  const init = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await apiFetch(
    `/api/expenses/${expenseId}?listId=${listId}`,
    init
  );

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  console.log(`Expense with ID ${expenseId} deleted successfully`); // Log added
};

export const useExpenses = () => {
  const queryClient = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState<string | null>(null);

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

  const addExpenseMutation = useMutation<Expense, Error, NewExpense>({
    mutationFn: async (expenseData: NewExpense) => {
      if (!token) throw new Error("No access token");
      console.log("Adding expense with data:", expenseData); // Log added
      return addExpense(token, expenseData);
    },
    onSuccess: (newExpense) => {
      console.log("Expense added successfully:", newExpense); // Log added
      queryClient.setQueryData(["expenseLists"], (oldData: any) => {
        if (!oldData || !oldData.data) {
          return { data: [newExpense] };
        }
        return {
          ...oldData,
          data: [newExpense, ...oldData.data],
        };
      });
    },
    onError: (error) => {
      console.error("Failed to add expense:", error); // Log added
    },
  });

  const updateExpenseMutation = useMutation<
    Expense,
    Error,
    {
      expenseId: string;
      expenseData: Omit<ExpenseWithListId, "creator" | "creatorImageUrl">;
    }
  >({
    mutationFn: async ({ expenseId, expenseData }) => {
      if (!token) throw new Error("No access token");
      console.log("Updating expense with ID:", expenseId, "and data:", expenseData); // Log added
      return updateExpense(token, expenseId, expenseData);
    },
    onSuccess: (updatedExpense) => {
      console.log("Expense updated successfully:", updatedExpense); // Log added
      queryClient.setQueryData(["expenseLists"], (oldData: any) => {
        if (!oldData || !oldData.data) {
          return { data: [updatedExpense] };
        }
        const updatedData = oldData.data.map((list: any) =>
          list.expenses.some((expense: any) => expense._id === updatedExpense._id)
            ? {
                ...list,
                expenses: list.expenses.map((expense: any) =>
                  expense._id === updatedExpense._id ? updatedExpense : expense
                ),
              }
            : list
        );
        return {
          ...oldData,
          data: updatedData,
        };
      });
    },
    onError: (error) => {
      console.error("Failed to update expense:", error); // Log added
    },
  });

  const deleteExpenseMutation = useMutation<
    void,
    Error,
    { expenseId: string; listId: string }
  >({
    mutationFn: async ({ expenseId, listId }) => {
      if (!token) throw new Error("No access token");
      console.log("Deleting expense with ID:", expenseId); // Log added
      return deleteExpense(token, expenseId, listId);
    },
    onSuccess: (_, { expenseId }) => {
      console.log(`Expense with ID ${expenseId} deleted successfully`); // Log added
      queryClient.setQueryData(["expenseLists"], (oldData: any) => {
        if (!oldData || !oldData.data) {
          return { data: [] };
        }
        const updatedData = oldData.data.map((list: any) => ({
          ...list,
          expenses: list.expenses.filter((expense: any) => expense._id !== expenseId),
        }));
        return {
          ...oldData,
          data: updatedData,
        };
      });
    },
    onError: (error) => {
      console.error("Failed to delete expense:", error); // Log added
    },
  });

  return {
    addExpenseMutation,
    updateExpenseMutation,
    deleteExpenseMutation,
  };
};