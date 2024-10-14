import { Client, GatewayIntentBits, TextChannel, AttachmentBuilder, ForumChannel } from 'discord.js';
import { BugReport } from "@libs/bugReportAgents/types";
import { Files } from "plugins/bugReporting";
import fetch from "node-fetch";

const getFileType = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'txt':
      return 'text/plain';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
};

const fetchFiles = async (fileList: Files[]): Promise<AttachmentBuilder[] | null> => {
  const fetchedFiles = await Promise.all(
    fileList.map(async (file) => {
      try {
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        const filename = file.url.split('/').pop() || 'unknown';
        const contentType = getFileType(file.url);
        return new AttachmentBuilder(Buffer.from(buffer), { name: filename });
      } catch (error) {
        console.error(`Error fetching file ${file.url}:`, error);
        return null;
      }
    })

  );

  const validFiles = fetchedFiles.filter((file): file is AttachmentBuilder => file !== null);
  console.log(`Successfully fetched ${validFiles.length} out of ${fileList.length} files`);
  return validFiles;
};

const createNewThread = async (bugData: BugReport, fileList: Files[]) => {
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
  const CHANNEL_ID = process.env.Discord_BOT_CHANNEL || "";
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  try {
    await client.login(BOT_TOKEN);

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel || !(channel instanceof ForumChannel)) {
      throw new Error('Channel not found or is not a forum channel');
    }

    const repoSteps = bugData.replicationSteps
      .map((step) => `- ${step}`)
      .join("\n");

    const contentMsg = `Created by {{username}}
### Title:
${bugData.shortDescription}
### Observed:
${bugData.observed}
### Expected:
${bugData.expected}
### Bug Type:
${bugData.bugType}
### Replication Rate:
${bugData.replicationRate}
### How To Replicate:
${repoSteps}
`;

    const attachments = await fetchFiles(fileList);

    const thread = await channel.threads.create({
      name: bugData.shortDescription,
      message: {
        content: contentMsg,
        files: attachments? attachments : []
      },
      reason: 'Bug report thread',
    });

    return { threadId: thread.id };
  } catch (error) {
    console.error("Error in createNewThread:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return { threadId: null };
  } finally {
    client.destroy();
  }
};

export { createNewThread };
