import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Start from "../assets/Start";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import Presets from "@/components/Presets";

export default function ChatSelection() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const user = useSelector((state: any) => state.auth.user);
  const navigate = useNavigate();

  const nameSchema = z.string().min(3).max(50);
  const roleLength = description.length;

  const createSession = async () => {
    try {
      nameSchema.parse(name);
    } catch (error: any) {
      toast.error("Name should be between 3 and 50 characters.", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }

    const response = axios.post(
      "https://api.brokengpt.com/sessions/create",
      {
        name: name,
        role: description,
      },
      { withCredentials: true }
    );

    await toast.promise(response, {
      loading: "Creating session",
      success: "Session created successfully",
      error: "Error creating session",
    });

    navigate(`/chat/${(await response).data.id}`);
  };

  const toastShown = useRef(false);

  useEffect(() => {
    if (!user && !toastShown.current) {
      toast.error("Login to continue", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      toastShown.current = true; // Mark that the toast has been shown
      navigate("/");
      return;
    }
  }, [navigate, user]);

  return (
    <>
      <section className="w-full py-3 px-7">
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="flex items-center my-2 dark gap-x-2">
              <PlusCircle />
              <span>Create your own Bot</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-backgroundColor">
            <div className="w-full max-w-sm mx-auto">
              <DrawerHeader>
                <DrawerTitle className="text-2xl text-text">
                  Create your own bot
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-y-3">
                <Input
                  placeholder="Enter bot's name"
                  className="bg-transparent text-text placeholder:text-text placeholder:text-opacity-70"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                ></Input>
                <Textarea
                  placeholder="Describe your bot"
                  className="bg-transparent text-text min-h-[100px] placeholder:text-text placeholder:text-opacity-70"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                ></Textarea>
                <p className="text-xs text-right text-text">{roleLength}/500</p>
              </div>
              <DrawerFooter>
                <Button className="dark" onClick={createSession}>
                  Start Chat <Start className="ml-1" />
                </Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        <h1 className="mb-1 text-4xl font-bold text-white mt-7 ">
          Select a bot
        </h1>

        <Presets />
      </section>
    </>
  );
}
