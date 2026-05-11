import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../stores/authSlice";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();

  const handleLogin = async (credentialResponse: any) => {
    var data: any = jwtDecode(credentialResponse.credential);

    try {
      const creation = await axios.post(
        "https://api.brokengpt.com/users/login",
        {
          name: data.name,
          email: data.email,
        },
        {
          withCredentials: true,
        }
      );

      dispatch(login(creation.data.user));

      toast.success("Login successful", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    } catch (error: any) {
      toast.error(error.message, {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }

    navigate("/");
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  return (
    <>
      <section className="flex flex-col justify-center items-center h-screen max-h-[calc(100vh-72px)] gap-y-3">
        <div className="flex flex-col items-center justify-center gap-y-4">
          <GoogleOAuthProvider clientId="813189406799-jl0bllmvc4fdg7njglnbup79iejqnllu.apps.googleusercontent.com">
            <GoogleLogin onSuccess={handleLogin} />
          </GoogleOAuthProvider>

          <div className="flex items-center justify-center space-x-2 items-top dark">
            <p className="text-sm text-text">
              By continuing, you agree to our <br />
              <Link
                to="/terms-and-conditions"
                className="text-blue-600 underline"
              >
                T&C
              </Link>{" "}
              and{" "}
              <Link to="/privacypolicy" className="text-blue-600 underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
