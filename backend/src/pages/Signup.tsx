import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogInIcon } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    // Your signup logic here
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md px-6 py-8 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-gray-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <Label htmlFor="confirm-password" className="text-gray-200">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600"
          >
            Sign Up
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm uppercase">
            <span className="bg-gray-800 px-2 text-gray-500">Or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full text-gray-400 hover:bg-gray-700"
        >
          <LogInIcon className="mr-2 h-4 w-4" /> Continue with Google
        </Button>
      </div>
    </section>
  );
}
