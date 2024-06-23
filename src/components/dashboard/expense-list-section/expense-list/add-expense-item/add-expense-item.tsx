import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Input, message } from "antd";
import { useExpenses } from "../../../../../hooks/useExpenses";
import "./add-expense-item.css";

interface AddExpenseItemProps {
  listId: string;
}

const AddExpenseItem: React.FC<AddExpenseItemProps> = ({ listId }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expensePrice, setExpensePrice] = useState(0);
  const [expenseDescription, setExpenseDescription] = useState("");
  const { addExpenseMutation } = useExpenses();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    addExpenseMutation.mutate(
      {
        name: expenseName,
        price: expensePrice,
        expenseDescription,
        date: new Date().toISOString(),
        listId,
      },
      {
        onSuccess: (newExpense) => {
          message.success("Expense added successfully");
          setIsModalVisible(false);
          setExpenseName("");
          setExpensePrice(0);
          setExpenseDescription("");
        },
        onError: (error) => {
          message.error(`Failed to add expense: ${error.message}`);
        },
      }
    );
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <div className="add-expense-item">
        <div className="expense-icon-placeholder"></div>
        <div className="expense-details-placeholder">
          <div className="placeholder-line left"></div>
        </div>
        <div className="empty-placeholder"></div>
        <div className="expense-details-placeholder">
          <div className="placeholder-line right"></div>
          <div className="placeholder-line right small"></div>
        </div>
        <div className="add-expense-button-container">
          <Button
            type="primary"
            style={{
              backgroundColor: "var(--icon-muted-secondary)",
              color: "var(--background-primary)",
            }}
            shape="circle"
            icon={<PlusOutlined />}
            onClick={showModal}
          ></Button>
        </div>
      </div>

      <Modal
        title="Add Expense"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          value={expenseName}
          onChange={(e) => setExpenseName(e.target.value)}
          placeholder="Expense Name"
        />
        <Input
          type="number"
          value={expensePrice}
          onChange={(e) => setExpensePrice(parseFloat(e.target.value))}
          placeholder="Price"
        />
        <Input
          value={expenseDescription}
          onChange={(e) => setExpenseDescription(e.target.value)}
          placeholder="Description"
        />
      </Modal>
    </>
  );
};

export default AddExpenseItem;