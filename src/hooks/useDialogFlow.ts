import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

const useDialogFlow = () => {
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
    onSuccess: (newData) => {
      console.log("Mutation success:", newData);
      if (newData && newData.response) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: newData.response, sender: "AI" },
        ]);

        switch (newData.intent) {
          case "create_list":
            if (newData.list) {
              queryClient.invalidateQueries({ queryKey: ["stats"] }); 
              queryClient.setQueryData(["expenseLists"], (oldData: any) => {
                console.log("Old data:", oldData, "New list:", newData.list);
                if (!oldData || !oldData.data) {
                  return { data: [newData.list] };
                }
                return {
                  ...oldData,
                  data: [newData.list, ...oldData.data],
                };
              });
            }
            break;
          case "update_list":
            if (newData.list) {
              console.log("List updated:", newData.list);
              queryClient.invalidateQueries({ queryKey: ["stats"] }); 
              queryClient.setQueryData(["expenseLists"], (oldData: any) => {
                if (!oldData) return { data: [newData.list] };
                return {
                  data: oldData.data.map((item: any) =>
                    item._id === newData.list._id ? newData.list : item
                  ),
                };
              });
            }
            break;
            case "read_list":
              if (newData.list) {
                console.log("List read:", newData.list);
                queryClient.invalidateQueries({ queryKey: ["stats"] }); 
                queryClient.setQueryData(["expenseLists"], (oldData: any) => {
                  return { data: [newData.list] };
                });
                setMessages((prevMessages) => [
                  ...prevMessages,
                  { text: `List details: ${JSON.stringify(newData.list, null, 2)}`, sender: "AI" },
                ]);
              }
              break;
          case "delete_list":
            if (newData.listId) {
              console.log("List deleted:", newData.listId);
              queryClient.invalidateQueries({ queryKey: ["stats"] }); 
              queryClient.setQueryData(["expenseLists"], (oldData: any) => {
                if (!oldData) return { data: [] };
                return {
                  data: oldData.data.filter((item: any) => item._id !== newData.listId),
                };
              });
            }
            break;
          case "create_expense":
            if (newData.expense) {
              console.log("New expense created:", newData.expense);
              queryClient.invalidateQueries({ queryKey: ["stats"] }); 
              queryClient.setQueryData(["expenseLists"], (oldData: any) => {
                return { data: oldData ? [...oldData.data, newData.expense] : [newData.expense] };
              });
            }
            break;
          case "update_expense":
            if (newData.expense) {
              console.log("Expense updated:", newData.expense);
              queryClient.invalidateQueries({ queryKey: ["stats"] }); 
              queryClient.setQueryData(["expenseLists"], (oldData: any) => {
                if (!oldData) return { data: [newData.expense] };
                return {
                  data: oldData.data.map((item: any) =>
                    item._id === newData.expense._id ? { ...item, ...newData.expense } : item
                  ),
                };
              });
            }
            break;
          case "delete_expense":
            if (newData.expenseId) {
              console.log("Expense deleted:", newData.expenseId);
              queryClient.invalidateQueries({ queryKey: ["stats"] }); 
              queryClient.setQueryData(["expenseLists"], (oldData: any) => {
                if (!oldData) return { data: [] };
                return {
                  data: oldData.data.filter((item: any) => item._id !== newData.expenseId),
                };
              });
            }
            break;
          default:
            console.log("Unknown intent:", newData.intent);
        }
      } else {
        throw new Error("Invalid response structure");
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "AI: Sorry, something went wrong.";
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: errorMessage, sender: "AI" },
      ]);
    },
  });

  const sendMessage = (message: string) => {
    setMessages((prevMessages) => [...prevMessages, { text: message, sender: "User" }]);
    mutation.mutate(message);
  };

  return { messages, sendMessage, isLoading: mutation.isLoading, error: mutation.error };
};



export default useDialogFlow;