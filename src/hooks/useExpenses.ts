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
      return addExpense(token, expenseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseLists"] });
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
      return updateExpense(token, expenseId, expenseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseLists"] });
    },
  });

  const deleteExpenseMutation = useMutation<
    void,
    Error,
    { expenseId: string; listId: string }
  >({
    mutationFn: async ({ expenseId, listId }) => {
      if (!token) throw new Error("No access token");
      return deleteExpense(token, expenseId, listId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseLists"] });
    },
  });

  return {
    addExpenseMutation,
    updateExpenseMutation,
    deleteExpenseMutation,
  };
};
