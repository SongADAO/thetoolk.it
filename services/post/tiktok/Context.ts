import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/services/post/PostServiceContext";

const TiktokContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);

export { TiktokContext };
