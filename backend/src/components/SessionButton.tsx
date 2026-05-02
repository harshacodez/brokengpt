import { motion } from "framer-motion";
import Edit from "../assets/Edit";
import Bin from "../assets/Bin";
import { useNavigate } from "react-router-dom";
import useSessionStore from "@/store/sessionStore";
import toast from "react-hot-toast";

interface SessionButtonProps {
  id: string;
  name: string;
}

export default function SessionButton({ id, name }: SessionButtonProps) {
  const activeSession = useSessionStore((state) => state.activeSession);
  const deleteSession = useSessionStore((state) => state.deleteSession);
  const navigate = useNavigate();

  const sessionNavigate = () => {
    navigate(`/chat/${id}`);
  };

  const isActive = activeSession == id;

  const handleSessionDelete = async () => {
    deleteSession(id, toast);
  };

  return (
    <>
      <motion.button
        className={`text-text ${
          isActive ? "bg-primaryColor bg-opacity-60" : ""
        } w-full py-2 my-2 rounded-md text-[15px] flex justify-between px-3 items-center hover:bg-primaryColor hover:bg-opacity-60`}
        onClick={sessionNavigate}
      >
        <span>{name}</span>
        <span
          className={`${isActive ? "flex" : "hidden"} items-center gap-x-2`}
          id="controls"
        >
          <a className="text-lg hover:opacity-75">
            <Edit />
          </a>
          <a className="hover:opacity-75" onClick={handleSessionDelete}>
            <Bin className="hover:text-red-600" />
          </a>
        </span>
      </motion.button>
    </>
  );
}
