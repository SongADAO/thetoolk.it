import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/app/services/post/PostServiceContext";

const BlueskyContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);

export { BlueskyContext };
