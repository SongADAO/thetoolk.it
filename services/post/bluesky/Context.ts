import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/services/post/PostServiceContext";

const BlueskyContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);

export { BlueskyContext };
