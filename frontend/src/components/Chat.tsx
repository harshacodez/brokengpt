import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import formatTimestamp from "@/scripts/timeFormatter";

export interface ChatMessage {
  content: string;
  type: string;
  time: string;
  id: string | null;
}

const Chat = ({ content, type, time, id }: ChatMessage) => {
  const messageVariants = {
    hidden: { opacity: 0.8, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const [contents, setContents] = useState("");

  const formattedTime = formatTimestamp(time);

  useEffect(() => {
    const chat = document.querySelector(`.message-${id}`) as HTMLElement;
    if (type === "ai") {
      setContents("");
      chat.innerHTML = content;
    } else {
      setContents("");
      chat.innerHTML = content;
    }
  });

  return (
    <motion.li
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`px-3 py-1 rounded-md w-fit max-w-[700px] my-2 ${
        type === "user" ? "bg-text text-primaryColor self-end" : ""
      } ${
        type === "ai" ? "bg-primaryColor text-text self-start" : ""
      } flex flex-col gap-y-0`}
    >
      <div
        className={`text-[15px] font-medium ${`message-${id} chat`} leading-6`}
      >
        {contents}
      </div>
      <p className="self-end text-[10px]">{formattedTime}</p>

      <style>
        {`
          .chat hr {
            margin : 7px 0;
            opacity : 0;
          }

          .chat p {
            margin : 3px;
          }

          .chat a {
            color : #56803f;
            text-decoration : underline;
          }
        `}
      </style>
    </motion.li>
  );
};

export default Chat;
