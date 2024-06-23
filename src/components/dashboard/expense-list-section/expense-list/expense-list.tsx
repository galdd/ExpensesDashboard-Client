import React from "react";
import { ExpenseListType } from "../../../../@types/expense-list-prop";
import AddExpenseItem from "./add-expense-item/add-expense-item";
import { ExpenseItem } from "./expense-item";
import { ExpensesHeader } from "./expenses-header";
import { ExpenseListHeader } from "./expense-list-header";
import "./expense-list.css";

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
            />
          ))}
        </div>
        <AddExpenseItem listId={list._id} />
      </div>
    );
  }
);

export default ExpenseList;