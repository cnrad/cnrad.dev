import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

type Data = {
  email: string;
  message: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {

  const discordBotToken = "MTEwMzU2MDY5MzE5OTk0NTgxOA.GEfgrm.m_vcaZtE8W5nJBYDKrYGFDRJ2gvb66bum7t-9k"; // Add discord bot token here
  const discordChannelId = "1103564071627919472"; // Add discord channel ID here 

  const data = req.body as Data;

  if (!data) return res.status(500).json({ result: "Nice try :)" });

  if (data.message.length < 1 || data.email.length < 1)
    return res.status(500).json({ result: "FIELD_EMPTY" });

  if (data.message.length > 1000)
    return res.status(500).json({ result: "MESSAGE_TOO_LONG" });

  if (data.email.length > 500)
    return res.status(500).json({ result: "NAME_TOO_LONG" });

  axios
    .post(`https://discord.com/api/v9/channels/${discordChannelId}/messages`, {
      content: `**New message from:** ${data.email}\n\n${data.message}`,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${discordBotToken}`,
      }
    })
    .then((response: { data: { id: any; }; }) => {
      if (!response.data.id) 
        return res.status(500).json({ result: "DISCORD_API_ERROR" });

      return res.status(200).json({ result: "Success" });
    });
}
