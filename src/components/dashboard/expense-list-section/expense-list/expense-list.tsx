import React from "react";
import { ExpenseListType } from "../../../../@types/expense-list-prop";
import AddExpenseItem from "./add-expense-item/add-expense-item";
import { ExpenseItem } from "./expense-item";
import { ExpensesHeader } from "./expenses-header";
import { ExpenseListHeader } from "./expense-list-header";
import "./expense-list.css";
import { Expense } from "../../../../@types/expense";

interface ExpenseListProps {
  list: ExpenseListType;
  onDeleteList: (id: string) => void;
  onEditList: (id: string, name: string) => void;
  onAddExpense: (expense: Expense) => void;
  onUpdateExpense: (expenseId: string, name: string, price: number) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = React.memo(
  ({
    list,
    onDeleteList,
    onEditList,
    onAddExpense,
    onUpdateExpense,
    onDeleteExpense,
  }) => {
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
              onUpdateExpense={onUpdateExpense}
              onDeleteExpense={onDeleteExpense}
            />
          ))}
        </div>
        <AddExpenseItem listId={list._id} onAddExpense={onAddExpense} />
      </div>
    );
  }
);

export default ExpenseList;