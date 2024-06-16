import { Tooltip } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { UserPicture } from "../../../../shared";
import { InvitationNotificationProps } from "../../../../../@types/notification-props";
import "./notification-Invitation.css";

export function NotificationInvitation({
  avatarSrc,
  creatorName,
  listName,
  responses,
  timestamp,
}: InvitationNotificationProps) {
  return (
    <div className="notification-invitation">
      <UserPicture creatorImageUrl={avatarSrc} creatorName={creatorName} />
      <Tooltip title={new Date(timestamp).toLocaleString()}>
        <div className="notification-content">
          <p className="notification-description">
            Invited you to join <strong>{listName}</strong>
          </p>
          <div className="notification-invitee-avatars">
            {responses.map((response, index) =>
              response.accepted ? (
                <CloseOutlined key={index} className="cancel-icon" />
              ) : (
                <CheckOutlined key={index} className="accept-icon" />
              )
            )}
          </div>
        </div>
      </Tooltip>
    </div>
  );
}
