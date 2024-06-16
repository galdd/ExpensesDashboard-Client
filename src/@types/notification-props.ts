export interface NotificationExpenseProps {
  id: string;
  avatarSrc: string;
  expenseDescription: string;
  listName: string;
  price: number;
  timestamp: string;
  action: "add" | "update" | "remove";
  creatorName: string;
}

export interface InvitationNotificationProps {
  id: string;
  avatarSrc: string;
  listName: string;
  responses: { accepted: boolean }[];
  timestamp: string;
  creatorName: string;
}

export interface ListNotificationProps {
  id: string;
  avatarSrc: string;
  listName: string;
  timestamp: string;
  action: "add" | "update" | "remove";
  creatorName: string;
}

export type NotificationType =
  | { type: "expense"; props: NotificationExpenseProps }
  | { type: "invitation"; props: InvitationNotificationProps }
  | { type: "list"; props: ListNotificationProps };
