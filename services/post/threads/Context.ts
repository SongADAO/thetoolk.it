import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/services/post/PostServiceContext";

const ThreadsContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);

export { ThreadsContext };
