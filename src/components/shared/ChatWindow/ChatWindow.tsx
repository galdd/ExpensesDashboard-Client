import React, { useState } from "react";
import { CommentOutlined } from "@ant-design/icons";
import useDialogFlow from "../../../hooks/useDialogFlow";
import "./ChatWindow.css";

const ChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const { messages, sendMessage, isLoading, error } = useDialogFlow();

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
        {isOpen && (
          <div className="chat-helper">
            <div
              className="helper-header"
              onClick={() => setShowHelper(!showHelper)}
            >
              {showHelper ? " - Minimize helper -"  : "👋 What you can ask me? click here!"}
            </div>
            {showHelper && (
              <div className="helper-content">
                <p>You can ask me to:</p>
                <ul>
                  <li><strong>List:</strong> Create, update, delete or read a list</li>
                  <li><strong>Expense:</strong> Create or delete an expense</li>
                </ul>
                <p><em>Examples:</em></p>
                <p>➡️ "Create list Shopping"</p>
                <p>➡️ "Update list Shopping to Groceries"</p>
                <p>➡️ "Delete list Groceries"</p>
                <p>➡️ "Read list Groceries"</p>
                <p>➡️ "Add expense Milk price 5 to Groceries"</p>
                <p>➡️ "Delete expense Milk from Groceries"</p>
              </div>
            )}
          </div>
        )}
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