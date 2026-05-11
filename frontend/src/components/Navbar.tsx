import { Button } from "./ui/button";

import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Wallet } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const user = useSelector((state: any) => state.auth.user);

  const showNavbar =
    location.pathname !== "/login" &&
    location.pathname !== "/signup" &&
    location.pathname !== "/wallet" &&
    !location.pathname.startsWith("/chat/");

  return (
    showNavbar && (
      <nav className="flex px-4 py-4 justify-between items-center">
        <Link
          to="/"
          className="text-text text-xl font-semibold flex items-center"
        >
          <img src="/logo.png" alt="" className="w-[40px]" />
          <span>BrokenGPT</span>
        </Link>
        <div className="flex gap-x-3">
          {!user && (
            <Link to="/login">
              <Button className="dark">Login</Button>
            </Link>
          )}
          {user && (
            <Link to="/wallet">
              <Button className="dark flex gap-x-1 items-center">
                Wallet <Wallet className="text-black text-xl" />
              </Button>
            </Link>
          )}
        </div>
      </nav>
    )
  );
}
