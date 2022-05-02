import React from "react";
import MessageComponent from "../components/talk/MessageComponent";
import ContactLink from "../components/talk/ContactLink";
import { SiTwitter, SiDiscord } from "react-icons/si";
import { FiMail } from "react-icons/fi";

const Talk = () => {
    return (
        <div className="mt-12 w-full h-screen">
            <h1 className="text-white font-bold text-3xl mb-2">Let's chat 💬</h1>
            <p className="text-gray-200 mb-8">
                Have an inquiry, or want to connect? Feel free to leave a message below, or get in touch via Discord,
                Twitter, or email.
            </p>

            <div className="grid grid-cols-3 gap-4">
                <MessageComponent />

                <div className="">
                    <ContactLink
                        name="cnrad#0566"
                        icon={<SiDiscord className="w-6 h-6 text-[#5865F2]" />}
                        link="https://discord.com/users/705665813994012695"
                    />

                    <ContactLink
                        name="@notcnrad"
                        icon={<SiTwitter className="w-6 h-6 text-[#1DA1F2]" />}
                        link="https://twitter.com/notcnrad"
                    />

                    <ContactLink
                        name="hello@cnrad.dev"
                        icon={<FiMail className="w-6 h-6 text-gray-400" />}
                        link="mailto:hello@cnrad.dev"
                    />
                </div>
            </div>
        </div>
    );
};

export default Talk;
