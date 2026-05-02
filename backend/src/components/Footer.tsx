import { Link, useLocation } from "react-router-dom";
import IconParkOutlinePersonalPrivacy from "../assets/Privacy";
import Clarify from "../assets/Clarify";

export default function Footer() {
  const location = useLocation();

  if (
    location.pathname === "/wallet" ||
    location.pathname.startsWith("/chat/")
  ) {
    return null; // Return null to hide the footer
  }

  return (
    <footer className="flex flex-col items-center py-3">
      <div className="flex justify-center gap-x-4 items-center flex-wrap py-4">
        <Link to="/privacypolicy" className="homelinks">
          Privacy Policy <IconParkOutlinePersonalPrivacy />
        </Link>
        <Link to="/terms-and-conditions" className="homelinks">
          Terms & Conditions <Clarify />
        </Link>
      </div>

      <span className="text-text flex gap-x-3 text-sm">
        <span className="text-text">© BrokenGPT 2024</span>
      </span>
    </footer>
  );
}
