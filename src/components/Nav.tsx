import { motion } from "framer-motion";

const LandingButton = ({ name }: any) => {
    return <h1 className="p-2 text-white bg-transparent hover:bg-gray-500 bg-opacity-50">{name}</h1>;
};

const Nav = () => {
    return (
        <div className="w-full h-52 bg-black border-b border-gray-800 flex flex-row">
            <LandingButton name="Home" />
            <LandingButton name="About" />
            <LandingButton name="Contact" />
        </div>
    );
};

export default Nav;
