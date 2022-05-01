import GradientBar from "../components/GradientBar";
import { useEffect, useState } from "react";
import MessageComponent from "../components/MessageComponent";

const Talk = () => {
    return (
        <div className="mt-12 w-full h-screen">
            <h1 className="text-white font-bold text-3xl mb-8">Let's chat 💬</h1>
            <p className="text-gray-200 mb-8">
                Have an inquiry, or want to connect? Feel free to leave a message below, or get in touch via Discord,
                Twitter, or email.
            </p>

            <div className="grid grid-cols-2 grid-rows-3 gap-4">
                <MessageComponent />

                <div className="row-span-3">
                    <div className="bg-opacity-50 bg-slate-500/10 rounded-md p-4">
                        <h1 className="font-bold text-sm text-slate-500 mb-1">DISCORD</h1>
                    </div>
                    <div className="bg-opacity-50 bg-slate-500/10 rounded-md p-4">
                        <h1 className="font-bold text-sm text-slate-500 mb-1">TWITTER</h1>
                    </div>
                    <div className="bg-opacity-50 bg-slate-500/10 rounded-md p-4">
                        <h1 className="font-bold text-sm text-slate-500 mb-1">EMAIL</h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Talk;
