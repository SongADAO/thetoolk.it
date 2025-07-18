import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/app/services/post/PostServiceContext";

const InstagramContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);

export { InstagramContext };
