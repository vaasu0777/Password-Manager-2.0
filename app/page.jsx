"use client"
import { useEffect } from "react";
import Card from "@/components/Card";
import Password from "@/components/Password";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function Home() {
  const toastObj = useSelector((state) => state.toast.toastObj);

  useEffect(() => {
    toast("Good morning sir/mam", toastObj);
  }, []);

  return (
    <div className="min-h-screen w-full px-3 sm:px-6 md:px-10 py-8">
      <ToastContainer />

      {/* Logo */}
      <div className="logo flex items-center justify-center">
        <span className="text-green-700 text-3xl sm:text-4xl md:text-5xl w-text">&lt;</span>
        <p className="text-3xl sm:text-4xl md:text-5xl w-text">Pass</p>
        <span className="text-green-700 text-3xl sm:text-4xl md:text-5xl w-text italic">OP/&gt;</span>
      </div>

      {/* Subtitle */}
      <h2 className="text-center text-base sm:text-lg md:text-xl w-text my-4 px-2">
        Your own Password & Credit Card details Manager
      </h2>

      {/* Main layout — stacked on mobile, side by side on lg+ */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start justify-center mt-6">

        {/* Card section */}
        <div className="w-full lg:flex-1">
          <Card />
        </div>

        {/* Divider — only visible on desktop */}
        <div className="hidden lg:block w-px self-stretch bg-zinc-200 dark:bg-zinc-700 opacity-50" />

        {/* Password section */}
        <div className="w-full lg:flex-1">
          <Password />
        </div>

      </div>
    </div>
  );
}