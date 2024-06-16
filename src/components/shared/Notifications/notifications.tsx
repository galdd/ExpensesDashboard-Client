import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { notification } from "antd";

export const Notifications = () => {
  const [socket] = useState(() => io("http://localhost:1337"));
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the server");
    });

    socket.on("notification", (data) => {
      console.log("Notification received: ", data);
      notification.info({
        message: "Notification",
        description: data.message,
        placement: "topRight",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return null;
};
