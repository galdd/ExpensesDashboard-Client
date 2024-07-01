import {
  UserOutlined,
  UnorderedListOutlined,
  DollarCircleOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { NotificationHeader } from "./notification/notification-header";

import { StatCard } from "./stat-card";
import { Notification } from "./notification";
import { DataLoader } from "../../shared";
import { useNotifications } from "../../../hooks/useNotifications";
import { useSocketNotifications } from "../../../hooks/useSocketNotifications";
import "./overview-section.css";
import { useStats } from "../../../hooks/useStats";

export const OverviewSection = () => {
  const { data: stats, isLoading, error } = useStats();
  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    error: notificationsError,
    setNotifications,
    clearNotifications,
  } = useNotifications();
  useSocketNotifications(setNotifications, clearNotifications);

  const notificationCount = notifications?.length ?? 0;

  return (
    <DataLoader
      isLoading={isLoading || isNotificationsLoading}
      error={error || notificationsError}
    >
      <DataLoader.Loading> </DataLoader.Loading>
      <DataLoader.Error> </DataLoader.Error>
      <div className="overview-section">
        <div className="stats-cards">
          <StatCard
            icon={<CreditCardOutlined />}
            value={`${stats?.totalExpenses ?? "N/A"}`}
            label="Total Expenses"
            iconBackgroundColor="var(--icon-background-primary)"
            iconColor="var(--icon-primary)"
          />
          <StatCard
            icon={<UnorderedListOutlined />}
            value={`${stats?.totalLists ?? "N/A"}`}
            label="Lists"
            iconBackgroundColor="var(--icon-background-primary)"
            iconColor="var(--icon-primary)"
          />
          <StatCard
            icon={<UserOutlined />}
            value={`${stats?.totalUsers ?? "N/A"}`}
            label="Users"
            iconBackgroundColor="var(--icon-background-primary)"
            iconColor="var(--icon-primary)"
          />
          <StatCard
            icon={<DollarCircleOutlined />}
            value={`$${stats?.totalPrice?.toFixed(2) ?? "N/A"}`}
            label="Total Price"
            iconBackgroundColor="var(--icon-background-primary)"
            iconColor="var(--icon-primary)"
          />
        </div>
        <div className="notification-card">
          <NotificationHeader 
            clearNotifications={clearNotifications}
            notificationCount={notificationCount}
          />
          <Notification notifications={notifications || []} />
        </div>
      </div>
    </DataLoader>
  );
};

export default OverviewSection;