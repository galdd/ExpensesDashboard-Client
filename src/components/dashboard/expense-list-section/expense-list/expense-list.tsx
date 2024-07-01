import React, { useCallback, useState, useEffect } from "react";
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
  ({ list, onDeleteList, onEditList }) => {
    const { addExpenseMutation, updateExpenseMutation, deleteExpenseMutation } = useExpenses();
    const [expenses, setExpenses] = useState<Expense[]>(list.expenses);
    const [totalExpenses, setTotalExpenses] = useState<number>(list.totalExpenses || 0);

    useEffect(() => {
      setExpenses(list.expenses);
      setTotalExpenses(list.totalExpenses || 0);
    }, [list]);

    const handleAddExpense = useCallback(
      (expense: Expense) => {
        console.log("Adding expense:", expense); // Add log
        addExpenseMutation.mutate(expense, {
          onSuccess: (newExpense) => {
            console.log("Expense added successfully:", newExpense); // Add log
            setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
            setTotalExpenses((prevTotal) => prevTotal + newExpense.price);
          },
          onError: (error) => {
            message.error(`Failed to add expense: ${error.message}`);
          },
        });
      },
      [addExpenseMutation]
    );

    const handleUpdateExpense = useCallback(
      (expenseId: string, name: string, price: number) => {
        const expenseToUpdate = expenses.find((expense) => expense._id === expenseId);
        if (!expenseToUpdate) return;

        const updatedExpense = { ...expenseToUpdate, name, price, listId: list._id };

        updateExpenseMutation.mutate(
          { expenseId, expenseData: updatedExpense },
          {
            onSuccess: (updatedExpense) => {
              console.log("Expense updated successfully:", updatedExpense); // Add log
              setExpenses((prevExpenses) =>
                prevExpenses.map((expense) => (expense._id === expenseId ? updatedExpense : expense))
              );
              setTotalExpenses((prevTotal) => prevTotal - expenseToUpdate.price + updatedExpense.price);
            },
            onError: (error) => {
              message.error(`Failed to update expense: ${error.message}`);
            },
          }
        );
      },
      [updateExpenseMutation, expenses, list._id]
    );

    const handleDeleteExpense = useCallback(
      (expenseId: string) => {
        const expenseToDelete = expenses.find((expense) => expense._id === expenseId);
        if (!expenseToDelete) return;

        deleteExpenseMutation.mutate(
          { expenseId, listId: list._id },
          {
            onSuccess: () => {
              console.log("Expense deleted successfully:", expenseId); // Add log
              setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense._id !== expenseId));
              setTotalExpenses((prevTotal) => prevTotal - expenseToDelete.price);
            },
            onError: (error) => {
              message.error(`Failed to delete expense: ${error.message}`);
            },
          }
        );
      },
      [deleteExpenseMutation, expenses, list._id]
    );

    return (
      <div className="expenses-list">
        <ExpenseListHeader
          listId={list._id}
          listName={list.name}
          expenseTotal={totalExpenses.toFixed(2)}
          onDelete={onDeleteList}
          onEdit={onEditList}
        />
        <ExpensesHeader />
        <div className="separated-expenses-list">
          {expenses.map((expense) => (
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