import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

const newSocket = io(import.meta.env.VITE_BASEAPP_BACKEND_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize the socket connection when the component mounts
    newSocket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  // Function to send messages to the server
  const sendMessage = (eventName, message) => {
    console.log("Sending message:", message);
    socket.emit(eventName, message);
  };

  // Function to listen for messages from the server
  const recieveMessage = (eventName, callback) => {
    console.log("Listening for event:", eventName);
    socket.on(eventName, callback);
  };

  const value = {
    socket,
    isConnected,
    sendMessage,
    recieveMessage,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
