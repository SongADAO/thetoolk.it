import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/app/services/post/PostServiceContext";

const TiktokContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);

export { TiktokContext };
