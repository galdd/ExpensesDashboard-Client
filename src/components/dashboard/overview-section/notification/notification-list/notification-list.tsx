import { UserPicture } from "../../../../shared";
import { ListNotificationProps } from "../../../../../@types/notification-props";
import "./notification-list.css";
import { Tooltip } from "antd";

export function NotificationList({
  avatarSrc,
  creatorName,
  listName,
  timestamp,
  action,
}: ListNotificationProps) {
  return (
    <div className="notification-list">
      <UserPicture creatorImageUrl={avatarSrc} creatorName={creatorName} />
      <Tooltip title={new Date(timestamp).toLocaleString()}>
        <div className="notification-content">
          <p className="notification-description">
            {action === "add" && `A new list`}{" "}
            {action === "update" && `The list`}{" "}
            {action === "remove" && `The list`} <strong>{listName}</strong>{" "}
            {action === "add" && `was created.`}
            {action === "update" && `was updated.`}
            {action === "remove" && `was removed.`}
          </p>
        </div>
      </Tooltip>
    </div>
  );
}
