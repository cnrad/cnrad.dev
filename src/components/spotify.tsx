import { useLanyard } from "use-lanyard";
import styled from "styled-components";
import { motion } from "framer-motion";

export function Spotify() {
    //code inspired by alistair @ github.com/alii, design inspired by phineas @ github.com/Phineas

    const { data: user } = useLanyard("705665813994012695");

    if (!user || !user.spotify) {
        return <></>;
    }

    return (
        <Presence initial={{opacity: 0, y: -50}} animate={{opacity: 1, y: -100}} transition={{duration: 1.25, easing: [0, 0.5, 0.28, 0.99]}}>
            <ListeningTo>Listening to Spotify</ListeningTo>
            <SpotifyCont>
                <AlbumImg src={user.spotify.album_art_url} />
                <SpotifyIcon src='/assets/spotify-logo.svg' />
                <TextCont>
                    <SongTitle 
                        href={`https://open.spotify.com/track/${user.spotify.track_id}`}
                        target="_blank"
                    >
                        {user.spotify.song}
                    </SongTitle>
                    <SongArtist>{user.spotify.artist}</SongArtist>
                </TextCont>
            </SpotifyCont>
        </Presence>
    );
}

const Presence = styled(motion.div)`
    font-family: Karla, sans-serif;
    width: 20rem;
    height: 7rem;

    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;

    position: absolute;
    bottom: 2rem;
    transform: translate(0, -100%);

    @media (max-height: 600px) {
        display: none;
    }
`;

const ListeningTo = styled(motion.p)`
    font-weight: 600;
    color: #e6e6e6;
    font-size: 1.1rem;
    margin: 0 0 0.75rem 0;
`;

const SpotifyCont = styled(motion.div)`
    width: 100%;
    height: 6rem;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
`;

const AlbumImg = styled(motion.img)`
    width: 5rem;
    height: 5rem;
    border-radius: 0.75rem;
    margin-right: 1rem;
    pointer-events: none;
`;

const SpotifyIcon = styled(motion.img)`
    position: absolute;
    bottom: -5px;
    left: 60px;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background-color: #000;
    border: 2px solid #000;
    pointer-events: none;
`

const TextCont = styled(motion.div)`
    width: auto;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
`;

const SongTitle = styled(motion.a)`
    font-weight: 500;
    color: #e1eafd;
    font-size: 1.15rem;
    margin: 0.15rem 0;

    &:hover {
        text-decoration: underline;
    }
`;

const SongArtist = styled(motion.p)`
    font-weight: 400;
    color: #cad2e0;
    font-size: 1.05rem;
    margin: 0.15rem 0;
`;
