import { useLanyard } from "use-lanyard";
import { motion } from "framer-motion";

const Spotify = () => {
    const { data: user } = useLanyard("705665813994012695");

    if (!user || !user.spotify) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: -100 }}
            transition={{ duration: 0.5, easing: [0, 0.5, 0.28, 0.99] }}
            className="fixed left-6 -bottom-20 w-[20rem] h-[7rem] hidden lg:flex flex-col items-start justify-start"
        >
            <h1 className="text-black dark:text-gray-100 font-semibold text-base mb-2 flex items-center justify-center">
                Listening to Spotify
                <span className="ml-2 w-2 h-2">
                    <span className="absolute w-2 h-2 bg-red-600 rounded-full animate-ping" />
                    <span className="absolute w-2 h-2 bg-red-600 rounded-full" />
                </span>
            </h1>

            <div className="w-full h-[6rem] flex flex-row items-center justify-start">
                <img
                    src={user.spotify.album_art_url}
                    className="w-[4.5rem] h-[4.5rem] rounded-md mr-4 pointer-events-none"
                    alt={user.spotify.album}
                />
                <div className="w-56 h-full flex flex-col items-start justify-center">
                    <a
                        href={`https://open.spotify.com/track/${user.spotify.track_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full font-medium text-gray-900 dark:text-[#e1eafd] hover:underline truncate"
                    >
                        {user.spotify.song}
                    </a>
                    <p className="w-full text-gray-600 dark:text-[#cad2e0] font-normal text-sm truncate">
                        {user.spotify.artist}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Spotify;
