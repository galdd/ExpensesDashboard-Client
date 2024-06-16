import React, { useState } from "react";
import { CommentOutlined } from "@ant-design/icons";
import useDialogFlow from "../../../hooks/useDialogFlow";
import "./ChatWindow.css";

interface ChatWindowProps {
  onCreateList: (list: any) => void;
  onUpdateList: (listId: string, name: string) => void;
  onDeleteList: (listId: string) => void;
  onReadList: (list: any) => void;
  onCreateExpense: (expense: any) => void;
  onUpdateExpense: (expenseId: string, name: string, amount: number) => void;
  onDeleteExpense: (expenseId: string) => void;
  onReadExpense: (expenses: any) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  onCreateList,
  onUpdateList,
  onDeleteList,
  onReadList,
  onCreateExpense,
  onUpdateExpense,
  onDeleteExpense,
  onReadExpense,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, isLoading, error } = useDialogFlow(
    onCreateList,
    onUpdateList,
    onDeleteList,
    onReadList,
    onCreateExpense,
    onUpdateExpense,
    onDeleteExpense,
    onReadExpense
  );

  const handleSend = (message: string) => {
    if (message.trim() === "") return;
    console.log("Sending message to server:", message);
    sendMessage(message);
  };

  const renderMessageContent = (msg: { text: string; sender: string }, index: number) => {
    if (msg.text.startsWith("List details:")) {
      const list = JSON.parse(msg.text.replace("List details:", "").trim());
      return (
        <div key={index} className="chat-message ai">
          <div className="list-details">
            <p>List Name: {list.name}</p>
            <p>Creator: {list.creator.name}</p>
            <p>Created At: {new Date(list.createdAt).toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Expense Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {list.expenses.map((expense: any, idx: number) => (
                <tr key={idx}>
                  <td>{expense.name}</td>
                  <td>{expense.price}$</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <div key={index} className={`chat-message ${msg.sender.toLowerCase()}`}>
        {msg.text}
      </div>
    );
  };

  return (
    <>
      <div className={`chat-window ${isOpen ? "open" : ""}`}>
        <div className="chat-header" onClick={() => setIsOpen(!isOpen)}>
          Chat
        </div>
        <div className="chat-body">
          {messages.map((msg, index) => renderMessageContent(msg, index))}
        </div>
        <div className="chat-footer">
          <input
            type="text"
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSend(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector(".chat-footer input") as HTMLInputElement;
              handleSend(input.value);
              input.value = "";
            }}
          >
            Send
          </button>
        </div>
      </div>
      {!isOpen && (
        <div className="chat-toggle-button" onClick={() => setIsOpen(!isOpen)}>
          <CommentOutlined style={{ fontSize: "24px", color: "white" }} />
        </div>
      )}
    </>
  );
};

export default ChatWindow;