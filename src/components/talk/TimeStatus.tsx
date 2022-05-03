import { useEffect, useState } from "react";

const TimeStatus = () => {
    const [time, setTime] = useState<string>("00:00:00 p.m.");
    const [awake, setAwake] = useState<boolean>(true);

    function updateTime() {
        let currentDate = new Date();
        let current = currentDate.toLocaleString("en-US", { timeZone: "America/New_York" });
        setTime(`${current.slice(-11, -6)}${current.slice(-3, -1)}.M.`);
        setTimeout(updateTime, 1000);

        if (currentDate.getHours() < 7) setAwake(false);
    }

    useEffect(() => {
        updateTime();
    }, []);

    return (
        <p className="text-white/40 text-sm mb-10">
            It's currently <span className="font-semibold text-white/60">{time}</span> for me, so I'm probably{" "}
            <span className="font-semibold text-white/60">{awake ? "awake" : "sleeping"}</span>.
        </p>
    );
};

export default TimeStatus;
