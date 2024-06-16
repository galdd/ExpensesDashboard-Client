import { EditOutlined } from "@ant-design/icons";
import { Expense } from "../../../../../@types/expense";
import { UserPicture } from "../../../../shared";
import { formatDate, formatTime } from "../../../../../utilities/format-time";
import { useState } from "react";
import { Modal, Button, Input, message } from "antd";
import { useExpenses } from "../../../../hooks/useExpenses";
import "./expense-item.css";

interface ExpenseItemProps {
  expense: Expense;
  listId: string;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  listId,
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
        onSuccess: () => {
          message.success("Expense updated successfully");
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
          setIsEditModalVisible(false);
        },
        onError: (error) => {
          message.error(`Failed to delete expense: ${error.message}`);
        },
      }
    );
  };

  return (
    <div className="flex flex-col space-y-4 p-6 bg-white border border-gray-200 rounded-lg shadow-lg w-full max-w-4xl mx-auto my-4" key={expense._id}>
        <div className="flex flex-col space-y-4 p-6 bg-white border border-gray-200 rounded-lg shadow-lg w-full max-w-4xl mx-auto my-4 text-base leading-6 text-gray-900 tracking-wide overflow-hidden" key={expense._id}>
        <UserPicture
            creatorImageUrl={expense.creator.photo}
            creatorName={expense.creator.name}
            className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-md hover:shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105"
        />
        <div className="flex flex-col space-y-2 bg-gray-50 p-4 border border-gray-300 rounded-md shadow-sm">
            <div className="text-lg font-semibold text-gray-800 underline decoration-gray-400">{expense.name}</div>
        </div>
        <div className="text-xl font-bold text-green-600 bg-green-50 p-2 border border-green-300 rounded-md shadow-sm">{`$${expense.price.toFixed(2)}`}</div>
        <div className="flex flex-col space-y-1 bg-yellow-50 p-2 border border-yellow-300 rounded-md shadow-sm">
            <div className="text-sm text-gray-500 font-medium">{formatDate(expense.createdAt)}</div>
            <div className="text-sm text-gray-500 font-medium">{formatTime(expense.createdAt)}</div>
        </div>
        <EditOutlined className="text-blue-500 hover:text-blue-700 cursor-pointer transform transition-transform duration-200 ease-in-out hover:scale-110" onClick={showEditModal} />
        </div>

      <Modal
        title="Edit Expense"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        footer={[
          <div className="flex justify-between items-center p-4" key="footer-buttons">
            <Button key="delete" danger onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </Button>
            <div className="space-x-2">
              <Button key="cancel" onClick={handleEditCancel} className="bg-gray-500 text-white hover:bg-gray-600">
                Cancel
              </Button>
              <Button key="submit" type="primary" onClick={handleEditOk} className="bg-blue-500 text-white hover:bg-blue-600">
                Save
              </Button>
            </div>
          </div>,
        ]}
      >
        <div className="flex flex-col space-y-4">
          <Input
            value={editedExpense.name}
            onChange={(e) =>
              setEditedExpense({ ...editedExpense, name: e.target.value })
            }
            placeholder="Expense Name"
            className="border border-gray-300 p-2 rounded-lg"
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
            className="border border-gray-300 p-2 rounded-lg"
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
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>
      </Modal>
    </div>
  );
};

export default ExpenseItem;
