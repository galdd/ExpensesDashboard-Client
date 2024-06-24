import React from "react";
import ChatWindow from "../ChatWindow/ChatWindow";

interface ChatManagerProps {
  onCreateList: (list: any) => void;
  onUpdateList: (listId: string, name: string) => void;
  onDeleteList: (listId: string) => void;
  onReadList: (list: any) => void;
  onCreateExpense: (expense: any) => void;
  onUpdateExpense: (expenseId: string, name: string, amount: number) => void;
  onDeleteExpense: (expenseId: string) => void;
  onReadExpense: (expenses: any) => void;
}

const ChatManager: React.FC<ChatManagerProps> = ({
  onCreateList,
  onUpdateList,
  onDeleteList,
  onReadList,
  onCreateExpense,
  onUpdateExpense,
  onDeleteExpense,
  onReadExpense,
}) => {
  return (
    <ChatWindow
      onCreateList={onCreateList}
      onUpdateList={onUpdateList}
      onDeleteList={onDeleteList}
      onReadList={onReadList}
      onCreateExpense={onCreateExpense}
      onUpdateExpense={onUpdateExpense}
      onDeleteExpense={onDeleteExpense}
      onReadExpense={onReadExpense}
    />
  );
};

export default ChatManager;