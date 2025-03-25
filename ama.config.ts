import { AmaContentRef } from "./src/types/AmaContent";

type MainContent = AmaContentRef<
  "file.json",
  {
    title: string;
    description: string;
  }
>;

export type DEFINITIONS = [MainContent];

// Optional configuration
export const config = {
  description: "My Project AMA Definitions",
  // Uncomment and customize these as needed
  // url: "https://api.atmyapp.com",
  // token: process.env.AMA_TOKEN,
  args: {
    projectId: "my-project",
  },
};
