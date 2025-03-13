import { useAmaContent } from "../../src/hooks/useAmaContent";
import { useAmaFile } from "../../src/hooks/useAmaFile";
import { useAmaImage } from "../../src/hooks/useAmaImage";
import { AmaContentRef } from "../../src/types/AmaContent";
import { AmaFileRef } from "../../src/types/AmaFile";
import { AmaImage, AmaImageRef } from "../../src/types/AmaImage";

type User = {
  /**
   * Name of the user
   * @maxLength 10
   */
  name: string;
  age: number;
};

export type LandingContentDef = {
  title: string;
  description: string;
  image: AmaImage<{
    optimizeFormat: "webp";
    ratioHint: {
      x: 1;
      y: 1;
    };
  }>;
  users: User[];
  mainUser: User;
};

export type _AMA_LandingContentRef = AmaContentRef<
  "landing/content.json",
  LandingContentDef
>;

export type _AMA_TxtRawFileRef = AmaFileRef<
  "landing/file.txt",
  {
    contentType: "text/plain";
  }
>;

export type _AMA_ImageRef = AmaImageRef<
  "landing/image.png",
  {
    optimizeFormat: "webp";
  }
>;

export const landingComponent = () => {
  const ama = useAmaContent<_AMA_LandingContentRef>("landing/content.json");
  const txt = useAmaFile<_AMA_TxtRawFileRef>("landing/file.txt");
  const image = useAmaImage<_AMA_ImageRef>("landing/image.png");

  if (ama.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{ama.data.title}</h1>
      <p>{ama.data.description}</p>
      <img src={ama.data.image.src} />
    </div>
  );
};
