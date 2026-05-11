import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./stores/store";
import App from "./App";
import { login, logout } from "./stores/authSlice";
import toast, { Toaster } from "react-hot-toast";
import Loader from "./assets/Loader";
import axios from "axios";
import "./index.css";
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
} from "react-router-dom";
import useSidebarStore from "./store/sideBarStore";

// Placeholder component while checking authentication
const Loading = () => (
  <div className="flex items-center justify-center w-screen h-screen text-white">
    <Loader />
  </div>
);

// Create a functional component to wrap authentication and rendering
function AuthWrapper() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const { setIsMobile, resizeDFalse } = useSidebarStore();

  const detectMobile = () => {
    const isCurrentlyMobile = window.innerWidth < 768;
    setIsMobile(isCurrentlyMobile);

    if (isCurrentlyMobile) {
      resizeDFalse();
    }
  };

  useEffect(() => {
    const handleResize = () => detectMobile();
    window.addEventListener("resize", handleResize);

    // Initial check
    detectMobile();

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setIsMobile, resizeDFalse]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          "https://api.brokengpt.com/users/check",
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          dispatch(login(response.data.user));
          toast.success(`Welcome back, ${response.data.user.name}!`, {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
        } else {
          dispatch(logout());
        }
      } catch (error) {
        dispatch(logout());
        if (location.pathname !== "/") {
          // Check if not on home page
          toast.error("Login to continue", {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
        }
        navigate("/");
      } finally {
        setIsLoading(false); // Mark loading as complete
      }
    };

    checkAuth();
  }, []);

  // Conditionally render based on loading state
  if (isLoading) {
    return <Loading />;
  } else {
    return <App />;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <Toaster />
    <Provider store={store}>
      <Router>
        <AuthWrapper />
      </Router>
    </Provider>
  </>
);
