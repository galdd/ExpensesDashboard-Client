import { NotificationExpense } from "./notification-expense";
import { NotificationInvitation } from "./notification-invitation";
import { NotificationList } from "./notification-list";
import { NotificationType } from "../../../../@types/notification-props";
import "./notification.css";

interface NotificationProps {
  notifications: NotificationType[];
}

const hasNameProperty = (obj: any): obj is { name: string } => {
  return obj && typeof obj === "object" && "name" in obj;
};

export const Notification = ({ notifications }: NotificationProps) => {
  // console.log("Rendering notifications:", notifications);
  return (
    <div className="notifications-container">
      {notifications.map((notification, index) => {
        const key = `${notification.type}-${notification.id}-${index}`;
        const {
          id,
          avatarSrc,
          expenseDescription,
          listName,
          price,
          timestamp,
          action,
          creatorName,
        } = notification.props || notification;

        if (notification.type === "expense") {
          return (
            <div className="notification-item" key={key}>
              <NotificationExpense
                id={id}
                avatarSrc={avatarSrc}
                expenseDescription={expenseDescription}
                listName={
                  hasNameProperty(listName) ? listName.name : listName
                }
                price={price}
                timestamp={timestamp}
                action={action}
                creatorName={creatorName}
              />
            </div>
          );
        } else if (notification.type === "invitation") {
          return (
            <div className="notification-item" key={key}>
              <NotificationInvitation
                id={id}
                avatarSrc={avatarSrc}
                listName={
                  hasNameProperty(listName) ? listName.name : listName
                }
                responses={notification.responses}
                timestamp={timestamp}
                creatorName={creatorName}
              />
            </div>
          );
        } else if (notification.type === "list") {
          return (
            <div className="notification-item" key={key}>
              <NotificationList
                id={id}
                avatarSrc={avatarSrc}
                listName={
                  hasNameProperty(listName) ? listName.name : listName
                }
                timestamp={timestamp}
                action={action}
                creatorName={creatorName}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};
