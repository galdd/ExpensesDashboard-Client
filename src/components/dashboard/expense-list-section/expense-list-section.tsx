import { useState, useCallback, useEffect } from "react";
import { message } from "antd";
import { SortOrder } from "../../../@types/sortOrderTypes";
import { ExpenseListType } from "../../../@types/expense-list-prop";
import { DataLoader } from "../../shared";
import ExpenseListToolbar from "./expense-list-toolbar/expense-list-toolbar";
import { ExpenseList } from "./expense-list/expense-list";
import "./expense-list-section.css";
import {
  useAddExpenseList,
  useDeleteExpenseList,
  useExpenseLists,
  useUpdateExpenseList,
} from "../../../hooks/useExpenseLists";
import ChatWindow from "../../shared/ChatWindow/ChatWindow";

export const ExpenseListSection = () => {
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [offset, setOffset] = useState(0);
  const [lists, setLists] = useState<ExpenseListType[]>([]);
  const {
    data: section,
    isLoading,
    error,
  } = useExpenseLists(offset, 5, sortOrder);
  
  const { mutate: deleteList } = useDeleteExpenseList();
  const { mutate: addExpenseList } = useAddExpenseList();
  const { mutate: updateExpenseList } = useUpdateExpenseList();

  const updateLists = useCallback(() => {
    console.log("Updating lists");
    
    if (section?.data) {
      console.log("Updating lists with data:", section.data);
      if (offset === 0) {
        setLists(section.data);
      } else {
        setLists((prevLists) => [...prevLists, ...section.data]);
      }
    }
  }, [section, offset]);

  useEffect(() => {
    updateLists();
  }, [updateLists]);

  useEffect(() => {
    console.log("Current lists state:", lists);
  }, [lists]);

  const handleDelete = (listId: string) => {
    deleteList(listId, {
      onSuccess: () => {
        setLists((prevLists) =>
          prevLists.filter((list) => list._id !== listId)
        );
        message.success("List deleted successfully");
      },
      onError: (error) => {
        message.error(`Failed to delete list: ${error.message}`);
      },
    });
  };

  const handleEdit = (listId: string, name: string) => {
    updateExpenseList(
      { id: listId, name },
      {
        onSuccess: (updatedList) => {
          message.success("List updated successfully");
          setLists((prevLists) =>
            prevLists.map((list) =>
              list._id === updatedList._id ? { ...list, name: updatedList.name } : list
            )
          );
        },
        onError: (error) => {
          message.error(`Failed to update list: ${error.message}`);
        },
      }
    );
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setOffset(0);
    setLists([]);
  };

  const loadMore = () => {
    const totalLoaded = lists.length;
    const totalAvailable = section?.total || 0;

    if (totalLoaded < totalAvailable) {
      setOffset((prevOffset) => prevOffset + 5);
    }
  };

  const handleAddList = (name: string) => {
    addExpenseList(
      { name },
      {
        onSuccess: (newList) => {
          message.success("List added successfully");
          setLists((prevLists) => [newList, ...prevLists]);
        },
        onError: (error) => {
          message.error(`Failed to add list: ${error.message}`);
        },
      }
    );
  };

  return (
    <DataLoader isLoading={isLoading} error={error}>
      <div className="expense-list-section">
        <div className="expense-list-container">
          <ExpenseListToolbar
            toggleSortOrder={toggleSortOrder}
            onAddList={handleAddList}
          />
          {lists.map((list) => (
            <ExpenseList
              key={list._id}
              list={list}
              onDeleteList={handleDelete}
              onEditList={handleEdit}
            />
          ))}
          {lists.length < (section?.total || 0) && (
            <button onClick={loadMore} className="load-more-button">
              Load More
            </button>
          )}
        </div>
        <ChatWindow  />
      </div>
    </DataLoader>
  );
};

export default ExpenseListSection;