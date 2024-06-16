import { useState, useEffect } from "react";
import { Dropdown, Modal, Input, message } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  DeleteFilled,
  EditOutlined,
  MoreOutlined,
} from "@ant-design/icons";

import "./expense-list-header.css";
import { ExpenseListHeaderProps } from "../../../../../@types/expense-list-prop";

export const ExpenseListHeader: React.FC<ExpenseListHeaderProps> = ({
  listId,
  listName,
  expenseTotal,
  onDelete,
  onEdit,
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newListName, setNewListName] = useState(listName);

  useEffect(() => {
    setNewListName(listName);
    // console.log("Updated newListName with listName:", listName); // Log when listName changes
  }, [listName]);

  const handleEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleEditOk = () => {
    // console.log("handleEditOk called with:", { listId, newListName });
    onEdit(listId, newListName);
    setIsEditModalVisible(false);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  const items = [
    {
      key: "invite",
      icon: <UserOutlined />,
      label: "Invite",
    },
    {
      key: "permissions",
      icon: <SettingOutlined />,
      label: "Permissions",
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit List",
      className: "menu-edit",
      onClick: () => {
        if (!listId) {
          message.error("Invalid list ID");
          return;
        }
        handleEdit();
      },
    },
    {
      key: "delete",
      icon: <DeleteFilled />,
      label: "Remove List",
      className: "menu-remove",
      onClick: () => {
        if (!listId) {
          message.error("Invalid list ID");
          return;
        }
        onDelete(listId);
      },
    },
  ];

  return (
    <div className="expense-list-header">
      <div className="list-name-and-price">
        <h2 className="list-name">{listName || "List"}</h2>
       
      </div>

      <div className="list-header-actions">
        <div className="total-price">{expenseTotal + "$" || "0"}</div>
        <div className="list-options-icon">
          <Dropdown
            menu={{ items }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <MoreOutlined />
          </Dropdown>
        </div>
      </div>

      <Modal
        title="Edit List Name"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
      >
        <Input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
        />
      </Modal>
    </div>
  );
};