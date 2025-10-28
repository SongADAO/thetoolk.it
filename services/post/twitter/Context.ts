import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/services/post/PostServiceContext";

export const TwitterContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);
