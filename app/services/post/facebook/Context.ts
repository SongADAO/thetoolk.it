import { createContext } from "react";

import {
  postServiceContextDefault,
  type PostServiceContextType,
} from "@/app/services/post/PostServiceContext";

const FacebookContext = createContext<PostServiceContextType>(
  postServiceContextDefault,
);

export { FacebookContext };
