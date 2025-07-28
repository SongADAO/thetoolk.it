import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/services/post/PostServiceContext";

const NeynarContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);

export { NeynarContext };
