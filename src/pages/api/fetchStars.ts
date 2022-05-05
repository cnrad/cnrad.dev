import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    stars: number;
    forks: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    const stats = await fetch(`https://api.github-star-counter.workers.dev/user/cnrad`).then(res =>
        res.json()
    );

    return res.status(200).json({ stars: stats.stars ?? 0, forks: stats.forks });
}
