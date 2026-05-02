import useSidebarStore from "@/store/sideBarStore";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import SessionButton from "./SessionButton";
import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Ellipsis } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Token from "../assets/Token";
import { LogOutIcon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/stores/authSlice";
import useSessionStore from "@/store/sessionStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import toast from "react-hot-toast";

export default function SideBar() {
  const isSideBarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const isMobile = useSidebarStore((state) => state.isMobile);
  const user = useSelector((state: any) => state.auth.user);
  const getSessions = useSessionStore((state) => state.getSessions);
  const sessions = useSessionStore((state) => state.sessions);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const controls = useAnimation();

  const handleLogout = async () => {
    const response = await axios.post(
      "https://api.brokengpt.com/users/logout",
      {},
      {
        withCredentials: true,
      }
    );

    dispatch(logout());

    toast.success(`${response.data.message}`, {
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });

    navigate("/");
  };

  // Use useEffect to update animation when isSideBarOpen changes
  useEffect(() => {
    controls.start({ width: isSideBarOpen ? 275 : 0 });
  }, [isSideBarOpen, controls]);

  useEffect(() => {
    getSessions();
  }, [getSessions]);

  return (
    <>
      {!isMobile && (
        <motion.div
          className={`flex flex-col h-screen bg-black ${
            !isMobile ? "z-20" : ""
          }`}
          animate={controls}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div className="flex justify-center py-8">
            {/* Conditionally render Link based on isSideBarOpen */}
            {isSideBarOpen ? (
              <Link to="/chat">
                <motion.div
                  className="flex items-center py-2 font-semibold text-center text-white cursor-pointer px-7 hover:bg-opacity-60 bg-primaryColor bg-opacity-80 text-opacity-90 rounded-2xl gap-x-1"
                  animate={{
                    opacity: isSideBarOpen ? 1 : 0,
                    pointerEvents: isSideBarOpen ? "all" : "none",
                    x: isSideBarOpen ? 0 : -50,
                    width: isSideBarOpen ? "100%" : "0px",
                  }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <PlusIcon /> New Chat
                </motion.div>
              </Link>
            ) : (
              <motion.div
                className="flex items-center py-2 font-semibold text-center text-white cursor-pointer px-7 bg-primaryColor bg-opacity-80 text-opacity-90 rounded-2xl gap-x-1"
                style={{ opacity: 0, pointerEvents: "none" }}
              >
                <PlusIcon /> New Chat
              </motion.div>
            )}
          </motion.div>
          <motion.p
            className="px-5 text-sm font-semibold text-text"
            animate={{
              opacity: isSideBarOpen ? 1 : 0,
              x: isSideBarOpen ? 0 : -50,
            }}
          >
            Your chats
          </motion.p>
          <motion.div
            className="px-5 mt-2 h-[100%-275px-120px] overflow-y-scroll"
            animate={{
              opacity: isSideBarOpen ? 1 : 0,
            }}
          >
            <motion.div
              animate={{
                opacity: isSideBarOpen ? 1 : 0,
                x: isSideBarOpen ? 0 : -50,
              }}
            >
              {Object.entries(sessions).map(([_, session]) => (
                <SessionButton
                  key={session.id}
                  id={session.id}
                  name={session.name}
                />
              ))}
            </motion.div>
          </motion.div>
          <motion.div
            className="h-[120px] w-full bg-black mt-auto flex justify-center items-center flex-shrink-0"
            animate={{
              opacity: isSideBarOpen ? 1 : 0,
              x: isSideBarOpen ? 0 : -50,
            }}
          >
            <motion.div
              animate={{
                opacity: isSideBarOpen ? 1 : 0,
                x: isSideBarOpen ? 0 : -50,
              }}
              className="flex items-center justify-between w-full px-5 py-1 rounded-full bg-opacity-70 bg-primaryColor mx-7 gap-x-3"
            >
              <span className="text-text">{user.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="p-2 text-sm bg-black rounded-full cursor-pointer bg-opacity-70 hover:bg-black hover:bg-opacity-40">
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark">
                  <Link to="/wallet" className="cursor-pointer">
                    <DropdownMenuItem className="flex text-base gap-x-2">
                      <span className="text-amber-500">Buy Credits</span>{" "}
                      <Token className="text-amber-500" />
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    className="flex text-base gap-x-2"
                    onClick={handleLogout}
                  >
                    <span className="text-red-600">Logout</span>
                    <LogOutIcon className="text-red-600 scale-90" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
