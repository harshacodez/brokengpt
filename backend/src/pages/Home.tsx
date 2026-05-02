import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Start from "../assets/Start";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

export default function Home() {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);

  const chatNavigate = () => {
    if (user) {
      navigate("/chat");
    } else {
      toast.error("Login to continue", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  return (
    <>
      <section className="flex justify-center gap-y-5 items-center h-screen max-h-[calc(100vh-72px)] flex-col">
        <h1 className="flex items-center text-5xl font-semibold text-text inter-font lg:text-8xl">
          <span>
            <img src="/logo.png" alt="" className="lg:w-[120px] w-[80px]" />
          </span>
          BrokenGPT
        </h1>

        <Card className="dark bg-[#2f2e35] flex justify-center items-center border border-white">
          <div>
            <CardHeader>
              <CardTitle>Chat with AI</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="max-w-[250px]">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button className="flex dark gap-x-1" onClick={chatNavigate}>
                Chat Now <Start className="text-black" />
              </Button>
            </CardFooter>
          </div>
        </Card>
      </section>

      <style>
        {`
          svg {
            color : white;
          }
        `}
      </style>
    </>
  );
}
