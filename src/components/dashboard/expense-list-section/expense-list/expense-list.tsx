import React, { useCallback } from "react";
import { ExpenseListType } from "../../../../@types/expense-list-prop";
import AddExpenseItem from "./add-expense-item/add-expense-item";
import { ExpenseItem } from "./expense-item";
import { ExpensesHeader } from "./expenses-header";
import { ExpenseListHeader } from "./expense-list-header";
import "./expense-list.css";
import { Expense } from "../../../../@types/expense";
import { message } from "antd";
import { useExpenses } from "../../../../hooks/useExpenses";

interface ExpenseListProps {
  list: ExpenseListType;
  onDeleteList: (id: string) => void;
  onEditList: (id: string, name: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = React.memo(
  ({
    list,
    onDeleteList,
    onEditList,
  }) => {
    const { addExpenseMutation, updateExpenseMutation, deleteExpenseMutation } = useExpenses();

    const handleAddExpense = useCallback((expense: Expense) => {
      console.log("Adding expense:", expense); // Add log
      addExpenseMutation.mutate(expense, {
        onSuccess: (newExpense) => {
          console.log("Expense added successfully:", newExpense); // Add log
          const updatedTotalExpenses = (list.totalExpenses || 0) + newExpense.price;
          list.expenses.push(newExpense);
          list.totalExpenses = updatedTotalExpenses;
        },
        onError: (error) => {
          message.error(`Failed to add expense: ${error.message}`);
        },
      });
    }, [addExpenseMutation, list]);

    const handleUpdateExpense = useCallback((expenseId: string, name: string, price: number) => {
      const expenseToUpdate = list.expenses.find((expense) => expense._id === expenseId);
      if (!expenseToUpdate) return;

      const updatedExpense = { ...expenseToUpdate, name, price, listId: list._id };

      updateExpenseMutation.mutate({ expenseId, expenseData: updatedExpense }, {
        onSuccess: (updatedExpense) => {
          console.log("Expense updated successfully:", updatedExpense); // Add log
          const index = list.expenses.findIndex((expense) => expense._id === expenseId);
          if (index !== -1) {
            const updatedTotalExpenses = list.totalExpenses - expenseToUpdate.price + updatedExpense.price;
            list.totalExpenses = updatedTotalExpenses;
            list.expenses[index] = updatedExpense;
          }
        },
        onError: (error) => {
          message.error(`Failed to update expense: ${error.message}`);
        },
      });
    }, [updateExpenseMutation, list]);

    const handleDeleteExpense = useCallback((expenseId: string) => {
      const expenseToDelete = list.expenses.find((expense) => expense._id === expenseId);
      if (!expenseToDelete) return;

      deleteExpenseMutation.mutate({ expenseId, listId: list._id }, {
        onSuccess: () => {
          console.log("Expense deleted successfully:", expenseId); // Add log
          const updatedTotalExpenses = list.totalExpenses - expenseToDelete.price;
          list.expenses = list.expenses.filter((expense) => expense._id !== expenseId);
          list.totalExpenses = updatedTotalExpenses;
        },
        onError: (error) => {
          message.error(`Failed to delete expense: ${error.message}`);
        },
      });
    }, [deleteExpenseMutation, list]);

    return (
      <div className="expenses-list">
        <ExpenseListHeader
          listId={list._id}
          listName={list.name}
          expenseTotal={(list.totalExpenses ? list.totalExpenses : 0).toFixed(2)}
          onDelete={onDeleteList}
          onEdit={onEditList}
        />
        <ExpensesHeader />
        <div className="separated-expenses-list">
          {list.expenses.map((expense) => (
            <ExpenseItem
              key={expense._id}
              expense={expense}
              listId={list._id}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          ))}
        </div>
        <AddExpenseItem listId={list._id} onAddExpense={handleAddExpense} />
      </div>
    );
  }
);

export default ExpenseList;