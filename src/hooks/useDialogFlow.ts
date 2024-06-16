import { useState } from "react";
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { apiFetch } from "../api";

interface DialogFlowResponse {
  response: string;
  intent: string;
  parameters: any;
  list?: any;
  expense?: any;
  listId?: string;
  expenseId?: string;
}

const sendToDialogFlow = async (message: string, token: string): Promise<DialogFlowResponse> => {
  const response = await apiFetch("/api/dialogflow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Response from DialogFlow server:", data);
  return data;
};


export const useDialogFlow = (
  onCreateList: (list: any) => void,
  onUpdateList: (listId: string, name: string) => void,
  onDeleteList: (listId: string) => void,
  onReadList: (list: any) => void,
  onCreateExpense: (expense: any) => void,
  onUpdateExpense: (expenseId: string, name: string, amount: number) => void,
  onDeleteExpense: (expenseId: string) => void,
  onReadExpense: (expenses: any) => void
) => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([
    { text: "Hello, I am AI. How can I help you?", sender: "AI" },
  ]);
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      const token = await getAccessTokenSilently();
      return sendToDialogFlow(message, token);
    },
    onSuccess: (data) => {
      console.log("Mutation success:", data);
      if (data && data.response) {
         setMessages((prevMessages) => [
           ...prevMessages,
           { text: data.response, sender: "AI" },
         ]);

        switch (data.intent) {
          case "create_list":
            if (data.parameters?.listName && data.list) {
              console.log("New list created:", data.list);
              onCreateList(data.list);
            }
            break;
          case "update_list":
            if (data.list) {
              console.log("List updated:", data.list);
              onUpdateList(data.list._id, data.list.name);
            }
            break;
          case "delete_list":
            if (data.listId) {
              console.log("List deleted:", data.listId);
              onDeleteList(data.listId);
            }
            break;
            case "read_list":
              if (data.list) {
                const listObject = data.list;
                console.log("List read:", data.list);
                onReadList(listObject);
                setMessages((prevMessages) => [
                  ...prevMessages,
                  { text: `List details: ${formatListDetails(listObject)}`, sender: "AI" },
                ]);
              }
            break;
          case "create_expense":
            if (data.parameters?.expenseName && data.expense) {
              console.log("New expense created:", data.expense);
              onCreateExpense(data.expense);
            }
            break;
          case "update_expense":
            if (data.expense) {
              console.log("Expense updated:", data.expense);
              onUpdateExpense(data.expense._id, data.expense.name, data.expense.amount);
            }
            break;
          case "delete_expense":
            if (data.expenseId) {
              console.log("Expense deleted:", data.expenseId);
              onDeleteExpense(data.expenseId);
            }
            break;
          case "read_expense":
            if (data.response) {
              console.log("Expenses read:", data.response);
              onReadExpense(data.response);
            }
            break;
          default:
            console.log("Unknown intent:", data.intent);
        }
      } else {
        throw new Error("Invalid response structure");
      }
    },
    onError: (error) => {
      const errorMessage = error.message || "AI: Sorry, something went wrong.";
      const errorParts = error.message.split('\n');
     
      const parsedError = JSON.parse(errorParts[1]);
      console.log(parsedError);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `AI: ${parsedError.response}`, sender: "AI" },
      ]);
    },
  });

  const sendMessage = (message: string) => {
    setMessages((prevMessages) => [...prevMessages, { text: message, sender: "User" }]);
    mutation.mutate(message);
  };

  return { messages, sendMessage, isLoading: mutation.isLoading, error: mutation.error };
};

const formatListDetails = (list: any) => {
  return JSON.stringify(list);
};

const formatExpenseDetails = (expenses: any) => {
  let details = `Expenses for List ID: ${expenses.listId}\n`;
  expenses.forEach((expense: any, index: number) => {
    details += `  ${index + 1}. ${expense.name} - $${expense.price}\n`;
  });
  return details;
};


export default useDialogFlow;