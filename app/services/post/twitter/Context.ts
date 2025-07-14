import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/app/services/post/PostServiceContext";

const TwitterContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);

export { TwitterContext };
