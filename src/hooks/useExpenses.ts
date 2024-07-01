import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense, ExpenseWithListId, NewExpense } from "../@types/expense";
import { apiFetch } from "../api";

const addExpense = async (
  token: string,
  expenseData: Omit<NewExpense, "creator" | "creatorImageUrl">
): Promise<Expense> => {
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
      console.log("Adding expense with data:", expenseData); // Add log
      const response = await addExpense(token, expenseData);
      console.log("Response data:", response); // Add log
      return response;
    },
    onSuccess: (newExpense) => {
      console.log("Expense added successfully:", newExpense); // Add log
      queryClient.setQueryData(["expenseLists"], (oldData: any) => {
        if (!oldData || !oldData.data) {
          return { data: [newExpense] };
        }
        return {
          ...oldData,
          data: oldData.data.map((list: any) =>
            list._id === newExpense.listId
              ? { ...list, expenses: [...list.expenses, newExpense], totalExpenses: list.totalExpenses + newExpense.price }
              : list
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error) => {
      console.error("Failed to add expense:", error);
      message.error(`Failed to add expense: ${error.message}`);
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
      console.log("Updating expense with ID:", expenseId, "and data:", expenseData); // Add log
      return updateExpense(token, expenseId, expenseData);
    },
    onSuccess: (updatedExpense) => {
      console.log("Expense updated successfully:", updatedExpense); // Add log
      queryClient.setQueryData(["expenseLists"], (oldData: any) => {
        if (!oldData || !oldData.data) {
          return { data: [updatedExpense] };
        }
        return {
          ...oldData,
          data: oldData.data.map((list: any) =>
            list._id === updatedExpense.listId
              ? {
                  ...list,
                  expenses: list.expenses.map((expense: any) =>
                    expense._id === updatedExpense._id ? updatedExpense : expense
                  ),
                  totalExpenses:
                    list.totalExpenses -
                    list.expenses.find((expense: any) => expense._id === updatedExpense._id).price +
                    updatedExpense.price,
                }
              : list
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error) => {
      console.error("Failed to update expense:", error);
      message.error(`Failed to update expense: ${error.message}`);
    },
  });

  const deleteExpenseMutation = useMutation<
    void,
    Error,
    { expenseId: string; listId: string }
  >({
    mutationFn: async ({ expenseId, listId }) => {
      if (!token) throw new Error("No access token");
      console.log("Deleting expense with ID:", expenseId, "and list ID:", listId); // Add log
      return deleteExpense(token, expenseId, listId);
    },
    onSuccess: (_, { expenseId, listId }) => {
      console.log("Expense deleted successfully with ID:", expenseId); // Add log
      queryClient.setQueryData(["expenseLists"], (oldData: any) => {
        if (!oldData || !oldData.data) {
          return { data: [] };
        }
        return {
          ...oldData,
          data: oldData.data.map((list: any) =>
            list._id === listId
              ? {
                  ...list,
                  expenses: list.expenses.filter(
                    (expense: any) => expense._id !== expenseId
                  ),
                  totalExpenses:
                    list.totalExpenses -
                    list.expenses.find((expense: any) => expense._id === expenseId).price,
                }
              : list
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error) => {
      console.error("Failed to delete expense:", error);
      message.error(`Failed to delete expense: ${error.message}`);
    },
  });

  return {
    addExpenseMutation,
    updateExpenseMutation,
    deleteExpenseMutation,
  };
};