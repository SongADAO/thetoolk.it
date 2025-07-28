import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/services/post/PostServiceContext";

const YoutubeContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);

export { YoutubeContext };
