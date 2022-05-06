import axios from "axios";
import { useRef, useState } from "react";
import { RiSendPlane2Fill } from "react-icons/ri";

const MessageComponent = () => {
    const email = useRef<string>("");
    const message = useRef<string>("");
    let [errMsg, setErrMsg] = useState("");

    const sendMessage = async () => {
        if (email.current == "" || message.current == "") return setErrMsg("Error: Field empty");

        let response = await axios.post("/api/send", {
            email: email.current,
            message: message.current,
        });

        console.log("sent");

        if (response.data.result === "FIELD_EMPTY") return setErrMsg("Error: Field empty");
        if (response.data.result === "DISCORD_API_ERROR") return setErrMsg("Error: Could not process request");

        return setErrMsg("Thanks for reaching out!");
    };

    return (
        <div className="md:col-span-2 row-span-3 bg-opacity-50 bg-white dark:bg-white/5 rounded-md p-4 border border-zinc-800/50">
            <h1 className="font-bold text-sm dark:text-slate-500 mb-1">EMAIL</h1>
            <input
                placeholder="example@gmail.com"
                type="text"
                onChange={(e: any) => (email.current = e.target.value)}
                className="w-full p-2 mb-4 rounded-md bg-slate-300/50 dark:bg-slate-200/5 text-sm placeholder:text-gray-600 dark:placeholder:text-slate-200/20"
            />

            <h1 className="font-bold text-sm dark:text-slate-500 mb-1">MESSAGE</h1>
            <textarea
                placeholder="Hi Conrad, what's up?"
                onChange={(e: any) => (message.current = e.target.value)}
                className="w-full p-2 h-36 mb-4 rounded-md bg-slate-300/50 dark:bg-slate-200/5 text-sm placeholder:text-gray-600 dark:placeholder:text-slate-200/20"
            />

            <div className="w-full flex flex-row justify-between items-center">
                <p className="text-gray-600 text-sm">{errMsg}</p>

                <button
                    onClick={sendMessage}
                    className="border border-gray-800 hover:bg-gray-200 dark:border-indigo-600/80 dark:bg-indigo-600/70 dark:hover:bg-indigo-500/70 flex flex-row items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition-colors duration-75"
                >
                    <span className="mt-[2px]">Send</span>
                    <RiSendPlane2Fill className="ml-2" />
                </button>
            </div>
        </div>
    );
};

export default MessageComponent;
