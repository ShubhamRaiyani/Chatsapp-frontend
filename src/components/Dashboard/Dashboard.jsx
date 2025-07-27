import React from "react";
import Sidebar from "./SideBar";
import ChatList from "./ChatList";
import ChatArea from "./ChatArea";
import  {ChatProvider}  from "../../contexts/ChatProvider";
import TypingArea from "./TypingArea";
import MessageList from "./MessageList";

export default function Dashboard() {
  return (
    <ChatProvider>
      
      <div className="h-screen bg-[#121212] flex text-white">
          <Sidebar />
          <ChatList />
        <ChatArea />  
        
      </div>
    </ChatProvider>
  );
}
