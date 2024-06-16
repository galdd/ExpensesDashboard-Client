export type Expense = {
  creator: { name: string; photo: string };
  createdAt: Date;
  _id: string;
  creatorImageUrl: string;
  name: string;
  price: number;
  expenseDescription: string;
  date: string;
};

export interface NewExpense {
  name: string;
  expenseDescription: string;
  price: number;
  date: string;
  listId: string;
}

export interface ExpenseWithListId extends Omit<Expense, "_id"> {
  listId?: string;
}
