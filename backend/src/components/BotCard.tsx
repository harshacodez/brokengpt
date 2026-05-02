import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import Start from "../assets/Start";
import Chat from "../assets/Chat";
import { Input } from "./ui/input";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import toast from "react-hot-toast";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface BotCard {
  name: string;
  imagelink: string;
  isNsfw: boolean;
  description: string;
  count: number;
  presetId: string;
}

export default function BotCard({
  name,
  imagelink,
  isNsfw,
  description,
  count,
  presetId,
}: BotCard) {
  let nsfwStatus = null;

  if (isNsfw) {
    nsfwStatus = "NSFW";
  }

  //States

  const [botname, setName] = useState("");

  const nameSchema = z.string().min(3).max(50);
  const navigate = useNavigate();

  const createSession = async () => {
    try {
      nameSchema.parse(botname);

      const response = await axios.post(
        "https://api.brokengpt.com/sessions/create",
        {
          bot: presetId,
          name: botname,
        },
        { withCredentials: true }
      );

      toast.success("Session created successfully");

      navigate(`/chat/${response.data.id}`);
    } catch (error: any) {
      toast.error("Name should be between 3 and 50 characters");
      return;
    }
  };

  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Card className="flex items-center cursor-pointer dark hover:shadow-lg hover:shadow-zinc-800 hover:transition-shadow">
            <div className="relative flex-shrink-0">
              <img
                src={imagelink}
                alt=""
                className="w-[100px] h-[160px] object-cover"
              />

              <div className="absolute flex justify-end bottom-1 left-2 gap-x-2">
                {nsfwStatus && (
                  <div className="p-1 text-xs text-white bg-red-500 rounded-md bg-opacity-80 w-fit">
                    NSFW
                  </div>
                )}

                <div className="flex items-center p-1 text-xs text-white bg-gray-800 bg-opacity-50 rounded-md w-fit gap-x-1">
                  <span>{count} </span>
                  <Chat />
                </div>
              </div>
            </div>
            <div className="max-w-[230px]">
              <CardContent>
                <CardTitle className="my-2 text-xl">{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardContent>
            </div>
          </Card>
        </DrawerTrigger>
        <DrawerContent className="justify-center outline-none dark bg-backgroundColor">
          <div className="w-full max-w-sm mx-auto text-text py-9">
            <DrawerHeader>
              <div className="flex items-center gap-x-6">
                <div className="flex-shrink-0">
                  <img
                    src={imagelink}
                    alt=""
                    className="w-[120px] h-[180px] object-cover "
                  />
                </div>
                <div className="flex flex-col items-center gap-y-4">
                  <DrawerTitle className="text-2xl">
                    Chat with {name}
                  </DrawerTitle>

                  <DrawerDescription>{description}</DrawerDescription>

                  <Input
                    placeholder={`Name your ${name}`}
                    value={botname}
                    onChange={(e) => setName(e.target.value)}
                    className="w-[250px]"
                  ></Input>
                </div>
              </div>
            </DrawerHeader>

            <DrawerFooter>
              <Button className="dark" onClick={createSession}>
                Start Chat <Start className="ml-1" />
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
