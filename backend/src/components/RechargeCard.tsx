import { Button } from "./ui/button";
import { DollarSign } from "lucide-react";
import Token from "../assets/Token";
import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface RechargeCardProps {
  amount: string;
  description: string;
  rechargeType: string;
  credits: number;
}

export default function RechargeCard({
  amount,
  description,
  rechargeType,
  credits,
}: RechargeCardProps) {
  const descArray = description.split("|");

  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async () => {
    try {
      const response = await axios.post(
        "https://api.brokengpt.com/payments/create-order",
        {
          itemName: rechargeType,
          amount: parseFloat(amount),
        },
        { withCredentials: true }
      );

      const { id } = response.data;
      return id;
    } catch (error: any) {
      setError(error.message);
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      await axios.post(
        `https://api.brokengpt.com/payments/capture-order/${data.orderID}`,
        {},
        { withCredentials: true }
      );
      setShowSuccess(true);
      setError(null);
    } catch (error: any) {
      setError(error.message);
      console.error("Error capturing order:", error);
    }
  };

  return (
    <>
      {showSuccess}
      {error}
      <div
        className={`p-4 rounded-md bg-primaryColor recharge-div w-[270px] ${
          rechargeType.toLowerCase() === "premium" ? "text-black" : "text-text"
        } ${rechargeType.toLowerCase()} flex flex-col gap-y-4`}
      >
        <p className="text-sm">{rechargeType}</p>
        <h1 className="flex items-end my-4">
          <span className="">
            <DollarSign />
          </span>
          <span className="text-5xl">{amount}</span>
        </h1>
        <div>
          {descArray.map((desc, index) => (
            <p key={index} className="my-2">
              • {desc}
            </p>
          ))}
        </div>

        <Drawer>
          <DrawerTrigger asChild>
            <a className="bg-white px-6 py-3 rounded-md text-black cursor-pointer hover:bg-slate-200 transition duration-150 flex items-center mt-6 w-full justify-center">
              Recharge {credits} <Token className="text-lg ml-2" />
            </a>
          </DrawerTrigger>
          <DrawerContent className="bg-backgroundColor max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle className="text-white text-lg">
                Pay for {rechargeType} Recharge
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex w-full justify-center max-h-[70vh]">
              <ScrollArea className="max-h-[600px] pr-6">
                <PayPalScriptProvider
                  options={{
                    clientId:
                      "AbZ8BqWRMCW7842Q7oPt6q4PvdhLVGU83_W3rNA_WySwQcWgYw8xtZ0ZhqsYadwCx-HtADFnKKj63McB", // Replace with your actual client ID
                    currency: "USD",
                  }}
                >
                  <div className="min-w-[300px] max-w-[320px]">
                    <PayPalButtons
                      className="w-full"
                      createOrder={createOrder}
                      onApprove={onApprove}
                    />
                  </div>
                </PayPalScriptProvider>
              </ScrollArea>
            </div>
            <DrawerFooter>
              <DrawerClose>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      <style>{`
        .premium {
          background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
          border: 2px solid #FFD700;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </>
  );
}
