import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Send from "../assets/Send";
import Chat from "@/components/Chat";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import Loader from "@/assets/Loader";
import randomstring from "randomstring";
import { useSelector } from "react-redux";
import SideBar from "@/components/SideBar";
import ChatNav from "@/components/ChatNav";
import useSidebarStore from "@/store/sideBarStore";
import useSessionStore from "@/store/sessionStore";

interface MessageStructure {
  content: string;
  sentBy: "user" | "ai";
  time: string;
  id: string | null;
}

export default function ChatEnv() {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);
  const isSideBarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const isMobile = useSidebarStore((state) => state.isMobile);
  const setActiveSession = useSessionStore((state) => state.setActiveSession);

  const chatEnvRef = useRef<HTMLDivElement>(null);
  const { activeSession } = useParams<{ activeSession?: string }>();

  const [activeSessionId, setactiveSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageStructure[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (activeSession) {
      setactiveSessionId(activeSession);
      setActiveSession(activeSession);
    } else {
      setactiveSessionId(null); // or any default value you prefer
      setActiveSession("default"); // or any default session name
    }
  }, [activeSession, setActiveSession]);

  const messagePush = async () => {
    if (message.trim() !== "") {
      const sanitizedHumanMessage = DOMPurify.sanitize(await marked(message));
      const newMessage: MessageStructure = {
        content: sanitizedHumanMessage,
        sentBy: "user",
        time: new Date().toUTCString(),
        id: randomstring.generate(10),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");
    }

    setLoadingMessages(true);

    try {
      const response = await axios.post(
        "https://api.brokengpt.com/messages/send",
        {
          message: message,
          sessionId: activeSessionId,
        },
        { withCredentials: true }
      );

      const { content, id, time } = response.data;
      const sanitizedMessage = DOMPurify.sanitize(await marked(content));

      const newMessage: MessageStructure = {
        content: sanitizedMessage,
        sentBy: "ai",
        time: time,
        id: id,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const setActive = useSessionStore((state) => state.setActiveSession);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await axios.post(
          `https://api.brokengpt.com/messages/get/${activeSession}`,
          {},
          { withCredentials: true }
        );
        setMessages(response.data.messages);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          setMessages([]);
        } else {
          console.log("An error occurred while fetching messages");
        }
      }
    };

    if (activeSession) {
      async () => setActive(activeSession);
      getMessages();
    }
  }, [activeSession]);

  return (
    <>
      <section className="flex w-full">
        <SideBar />
        <section
          className={`chat-env h-screen ${
            isSideBarOpen && !isMobile ? "w-[calc(100%-275px)]" : "w-[100%]"
          }`}
        >
          <ChatNav />
          <section className="chat-area flex flex-col h-[calc(100%-64px)] w-full">
            <div
              id="message-container"
              className="flex flex-col-reverse items-center w-full h-full overflow-y-scroll"
              ref={chatEnvRef}
            >
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-3xl font-semibold text-text">BrokenGPT</p>
                </div>
              )}
              <ul id="message-list" className="flex flex-col w-11/12">
                {messages.map((message, index) => (
                  <Chat
                    key={message.id || index} // Use message.id or fallback to index if id is null
                    content={message.content}
                    type={message.sentBy}
                    time={message.time}
                    id={message.id}
                  />
                ))}

                {loadingMessages && (
                  <li className="flex justify-start p-5">
                    <Loader />
                  </li>
                )}
              </ul>
            </div>
            <div className="message-input h-[130px] flex items-center">
              <div className="grid w-full gap-1.5 place-items-center">
                <div className="flex items-center justify-center w-full gap-x-2">
                  <Textarea
                    placeholder="Type your message here."
                    id="message-2"
                    className="w-11/12 p-3 mx-3 bg-transparent outline-none resize-none lg:mx-0 dark text-text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        messagePush();
                      }
                    }}
                    disabled={loadingMessages}
                  />
                  <Button className="dark" onClick={messagePush}>
                    <Send className="text-black" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our T&C and Privacy Policy
                </p>
              </div>
            </div>
          </section>
        </section>
      </section>

      <style>
        {`
          svg {
            color : white;
          }
        `}
      </style>
    </>
  );
}
