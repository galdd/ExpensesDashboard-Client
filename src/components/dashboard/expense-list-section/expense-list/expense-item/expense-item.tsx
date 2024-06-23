import { EditOutlined } from "@ant-design/icons";
import { Expense } from "../../../../../@types/expense";
import { UserPicture } from "../../../../shared";
import { formatDate, formatTime } from "../../../../../utilities/format-time";
import { useState } from "react";
import { Modal, Button, Input, message } from "antd";
import { useExpenses } from "../../../../../hooks/useExpenses";
import "./expense-item.css";

interface ExpenseItemProps {
  expense: Expense;
  listId: string;
  onUpdateExpense: (expenseId: string, name: string, price: number) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  listId,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedExpense, setEditedExpense] = useState(expense);

  const { updateExpenseMutation, deleteExpenseMutation } = useExpenses();

  const showEditModal = () => {
    setIsEditModalVisible(true);
  };

  const handleEditOk = () => {
    updateExpenseMutation.mutate(
      { expenseId: expense._id, expenseData: { ...editedExpense, listId } },
      {
        onSuccess: (updatedExpense) => {
          message.success("Expense updated successfully");
          onUpdateExpense(updatedExpense._id, updatedExpense.name, updatedExpense.price);
          setIsEditModalVisible(false);
        },
        onError: (error) => {
          message.error(`Failed to update expense: ${error.message}`);
        },
      }
    );
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  const handleDelete = () => {
    deleteExpenseMutation.mutate(
      { expenseId: expense._id, listId },
      {
        onSuccess: () => {
          message.success("Expense deleted successfully");
          onDeleteExpense(expense._id);
          setIsEditModalVisible(false);
        },
        onError: (error) => {
          message.error(`Failed to delete expense: ${error.message}`);
        },
      }
    );
  };

  return (
    <div className={`expense-item`} key={expense._id}>
      <UserPicture
        creatorImageUrl={expense.creator.photo}
        creatorName={expense.creator.name}
      />
      <div className="expense-details">
        <div className="expense-title">{expense.name}</div>
      </div>
      <div className="expense-price">${expense.price.toFixed(2)}</div>
      <div className="expense-timestamp">
        <div className="expense-date">{formatDate(expense.createdAt)}</div>
        <div className="expense-time">{formatTime(expense.createdAt)}</div>
      </div>
      <EditOutlined className="edit-icon" onClick={showEditModal} />

      <Modal
        title="Edit Expense"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        footer={[
          <div className="edit-expense-modal" key="footer-buttons">
            <div key="delete-button">
              <Button key="delete" danger onClick={handleDelete}>
                Delete
              </Button>
            </div>
            <div key="action-buttons">
              <Button key="cancel" onClick={handleEditCancel}>
                Cancel
              </Button>
              <Button key="submit" type="primary" onClick={handleEditOk}>
                Save
              </Button>
            </div>
          </div>,
        ]}
      >
        <Input
          value={editedExpense.name}
          onChange={(e) =>
            setEditedExpense({ ...editedExpense, name: e.target.value })
          }
          placeholder="Expense Name"
        />
        <Input
          type="number"
          value={editedExpense.price}
          onChange={(e) =>
            setEditedExpense({
              ...editedExpense,
              price: parseFloat(e.target.value),
            })
          }
          placeholder="Price"
        />
        <Input
          value={editedExpense.expenseDescription}
          onChange={(e) =>
            setEditedExpense({
              ...editedExpense,
              expenseDescription: e.target.value,
            })
          }
          placeholder="Expense Description"
        />
      </Modal>
    </div>
  );
};

export default ExpenseItem;