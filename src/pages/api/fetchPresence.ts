import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    data: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    let presence = await fetch("https://api.lanyard.rest/v1/users/705665813994012695").then(res => res.json());

    return res.status(200).json({ data: JSON.stringify(presence.data) });
}
