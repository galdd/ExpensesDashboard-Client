import { useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import "./user-picture.css";

type Props = {
  creatorImageUrl?: string;
  creatorName?: string;
};

export const UserPicture = ({ creatorImageUrl, creatorName }: Props) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="user-icon-wrapper"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {creatorImageUrl ? (
        <img
          className="user-icon"
          src={creatorImageUrl}
          alt={creatorName}
          referrerPolicy="no-referrer"
        />
      ) : (
        <UserOutlined className="user-icon" />
      )}
      {showTooltip && (
        <div className="custom-tooltip">
          <div className="custom-tooltip-inner">{creatorName}</div>
        </div>
      )}
    </div>
  );
};
