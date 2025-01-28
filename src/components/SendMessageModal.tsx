import { cn } from "../util/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { MailIcon, SendIcon } from "./Icons";

export const SendMessageModal = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    if (messageModalOpen) setMessageSent(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && messageModalOpen) {
        setMessageModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [messageModalOpen, setMessageModalOpen]);

  return (
    <>
      <div onClick={() => setMessageModalOpen(true)}>{children}</div>

      <AnimatePresence>
        {messageModalOpen && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMessageSent(true);
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className="fixed left-0 top-0 z-[10] h-[100dvh] w-full bg-black/10"
              onClick={(e) =>
                e.target === e.currentTarget ? setMessageModalOpen(false) : null
              }
            >
              <motion.div
                initial={{
                  scale: 0.9,
                  transformOrigin: "top left",
                  opacity: 0,
                }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, transformOrigin: "top left", opacity: 0 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 200,
                  mass: 1,
                }}
                className="relative z-[100] top-[13rem] left-[22rem] flex min-h-32 w-full max-w-96 flex-col gap-2 rounded-xl border border-tertiary/20 bg-background p-2.5 shadow-lg shadow-primary/10"
              >
                <div className="flex h-full w-full flex-row items-center gap-2 rounded-md border border-tertiary/20 bg-light px-2 text-sm transition-colors duration-150 ease-out focus-within:border-gray-300">
                  <MailIcon className="size-4 max-h-5 min-h-5 min-w-5 max-w-5 text-secondary" />
                  <input
                    className="h-full w-full bg-transparent px-1 py-1.5 outline-none"
                    type="email"
                    placeholder="hello@cnrad.dev"
                    disabled={messageSent}
                  />
                </div>

                <textarea
                  className="h-[6rem] rounded-md border border-tertiary/20 bg-light px-2 py-1 text-sm outline-none transition-all duration-150 ease-out focus:border-gray-300"
                  placeholder="Message"
                  disabled={messageSent}
                />

                <button
                  className={cn(
                    "cursor-pointer relative w-full overflow-hidden rounded-full bg-gray-900 p-[1.5px] font-semibold text-white transition-all duration-150 ease-out hover:scale-[0.98] active:scale-[0.97]",
                    {
                      "before:absolute before:left-1/2 before:top-1/2 before:-ml-[500px] before:-mt-[500px] before:h-[1000px] before:w-[1000px] before:origin-center before:animate-spin before:bg-[conic-gradient(#ff2b2b_0deg,#ffff04_40deg,#00ff6e_80deg,#005eff_120deg,#6600ff_160deg,transparent_200deg)] before:p-1 before:opacity-0 before:transition-opacity before:duration-100 before:content-[''] before:[animation-direction:reverse] before:[animation-duration:3s] hover:before:opacity-100":
                        !messageSent,
                    }
                  )}
                >
                  <div className="relative z-[10] flex flex-row h-full w-full items-center gap-2 justify-center rounded-full bg-gray-900 py-1.5 transition-all duration-200 ease-out">
                    Send
                    <SendIcon className="size-5 text-white" />
                  </div>
                </button>
              </motion.div>
            </motion.div>
          </form>
        )}
      </AnimatePresence>
    </>
  );
};
