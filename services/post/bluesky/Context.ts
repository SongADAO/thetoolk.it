import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/services/post/PostServiceContext";

export const BlueskyContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);
