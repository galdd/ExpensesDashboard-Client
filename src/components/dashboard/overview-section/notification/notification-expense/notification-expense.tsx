import { Tooltip } from "antd";
import { NotificationExpenseProps } from "../../../../../@types/notification-props";
import { UserPicture } from "../../../../shared";
import "./notification-expense.css";

export const NotificationExpense = ({
  avatarSrc,
  creatorName,
  expenseDescription,
  listName,
  price,
  timestamp,
  action,
}: NotificationExpenseProps) => {
  return (
    <div className="notification-expense">
      <UserPicture creatorImageUrl={avatarSrc} creatorName={creatorName} />
      <Tooltip title={new Date(timestamp).toLocaleString()}>
        <div className="notification-content">
          <p className="notification-description">
            {action === "add" && "Added a new"}
            {action === "update" && "Updated"}
            {action === "remove" && "Removed"}{" "}
            <strong>{expenseDescription}</strong> to{" "}
            <strong>{listName} 'list'</strong>
          </p>
          <div
            className={`notification-price ${
              action === "remove" ? "remove" : ""
            }`}
          >
            ${price}
          </div>
        </div>
      </Tooltip>
    </div>
  );
};
