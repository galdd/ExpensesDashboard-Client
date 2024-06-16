import { BellOutlined } from "@ant-design/icons";
import { Button } from "antd";
import "./notification-header.css";

type Props = {
  clearNotifications: () => void;
};

export const NotificationHeader = ({ clearNotifications }: Props) => {
  return (
    <header className="notifications-header-container">
      <div className="notifications-header-wrapper">
        <BellOutlined className="notifications-icon" />
        <h2 className="notifications-title">Notifications</h2>
      </div>
      <div>
        <Button
          onClick={clearNotifications}
          className="notification-clear-button"
        >
          Clear Notifications
        </Button>
      </div>
    </header>
  );
};
