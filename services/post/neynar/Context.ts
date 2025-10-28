import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/services/post/PostServiceContext";

export const NeynarContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);
