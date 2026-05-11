import { Link } from "react-router-dom";
import useSidebarStore from "@/store/sideBarStore";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import SessionButton from "./SessionButton";
import useSessionStore from "@/store/sessionStore";
import { PlusIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import Token from "../assets/Token";
import { LogOutIcon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { logout } from "@/stores/authSlice";

export default function ChatNav() {
  const sessions = useSessionStore((state) => state.sessions);

  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const isMobile = useSidebarStore((state) => state.isMobile);
  const user = useSelector((state: any) => state.auth.user);
  const getSessions = useSessionStore((state) => state.getSessions);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleSidebarFn = () => {
    if (!isMobile) {
      toggleSidebar();
    } else {
      return;
    }
  };

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

  useEffect(() => {
    getSessions();
  }, [getSessions]);

  return (
    <>
      <nav className="w-full py-3 pl-[30px] gap-x-3 items-center flex justify-start">
        {!isMobile && (
          <div
            className="p-2 transition rounded-full cursor-pointer bg-primaryColor hover:opacity-70"
            onClick={toggleSidebarFn}
          >
            <Menu className="text-xl" />
          </div>
        )}
        {isMobile && (
          <Sheet>
            <SheetTrigger>
              <div className="p-2 transition rounded-full cursor-pointer bg-primaryColor hover:opacity-70">
                <Menu className="text-xl" />
              </div>
            </SheetTrigger>
            <SheetContent className="dark" side={"left"}>
              <SheetTitle>
                <VisuallyHidden.Root>Menu</VisuallyHidden.Root>
              </SheetTitle>
              <motion.div className={`flex flex-col h-screen`}>
                <motion.div className="flex justify-center py-8">
                  <Link to="/chat">
                    <motion.div
                      className="flex items-center py-2 font-semibold text-center text-white cursor-pointer px-7 hover:bg-opacity-60 bg-primaryColor bg-opacity-80 text-opacity-90 rounded-2xl gap-x-1"
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <PlusIcon /> New Chat
                    </motion.div>
                  </Link>
                </motion.div>
                <motion.p className="text-sm font-semibold text-text">
                  Your chats
                </motion.p>
                <motion.div className="mt-2 h-[100%-275px-120px] overflow-y-scroll">
                  <motion.div>
                    {Object.entries(sessions).map(([_, session]) => (
                      <SessionButton
                        key={session.id}
                        id={session.id}
                        name={session.name}
                      />
                    ))}
                  </motion.div>
                </motion.div>
                <motion.div className="h-[120px] w-full mt-auto flex justify-center items-center flex-shrink-0">
                  <motion.div className="flex items-center justify-between w-full px-5 py-1 rounded-full bg-opacity-70 bg-primaryColor mx-7 gap-x-3">
                    <span className="text-text">{user.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="p-2 text-sm bg-black rounded-full cursor-pointer bg-opacity-70 hover:bg-black hover:bg-opacity-40">
                          <Ellipsis />
                        </div>
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
            </SheetContent>
          </Sheet>
        )}
        <Link to="/">
          <p className="text-xl font-semibold text-text">BrokenGPT</p>
        </Link>
      </nav>
    </>
  );
}
