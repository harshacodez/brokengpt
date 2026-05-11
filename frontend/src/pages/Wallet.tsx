import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { login } from "@/stores/authSlice";
import { useEffect, useState } from "react";
import RechargeCard from "@/components/RechargeCard";
import { Link } from "react-router-dom";
import Start from "../assets/Start";
import Token from "../assets/Token";

export default function Profile() {
  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);

  useEffect(() => {
    setBalance(user.balance);
  }, [user.balance]);

  const balanceStatus =
    balance < 2 ? "text-red-500" : balance > 5 ? "text-green-500" : "";

  async () => {
    try {
      await axios.post(
        "https://api.brokengpt.com/users/logout",
        {},
        { withCredentials: true }
      );

      dispatch(login(null));

      navigate("/");
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  if (user === null) {
    navigate("/");
  }

  return (
    <>
      <nav className="text-white py-5 px-6 flex justify-between">
        <Link to="/" className="flex items-center gap-x-1">
          {" "}
          <span className=" rotate-180">
            <Start />
          </span>{" "}
          Back
        </Link>

        <div className="flex justify-between items-end gap-x-2">
          <span>Balance : </span>
          <span className={`text-3xl ${balanceStatus} flex items-end`}>
            {balance}
            <Token className=" text-lg -translate-y-1" />
          </span>
        </div>
      </nav>

      <section className="flex justify-center gap-x-6 items-center min-h-[calc(100vh-76px)] px-3 py-4">
        <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-6">
          <RechargeCard
            rechargeType="Basic"
            credits={1500}
            amount="1.59"
            description="Limited conversations|More cost/message|Best for new users"
          />
          <RechargeCard
            rechargeType="Pro"
            credits={7000}
            amount="4.99"
            description="More conversations|Less cost/message than trial|Best for regular users"
          />
          <RechargeCard
            rechargeType="Premium"
            credits={50000}
            amount="16.99"
            description="Best experience|Least cost/message|Best for power users|Conversations that keep going"
          />
        </div>
      </section>
    </>
  );
}
