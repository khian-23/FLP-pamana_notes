import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import MyNotes from "../pages/MyNotes";
import UploadNote from "../pages/UploadNote";
import Bookmarks from "../pages/Bookmarks";
import FreedomWall from "../pages/FreedomWall";
import Profile from "../pages/Profile";

export default function StudentRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="my-notes" element={<MyNotes />} />
      <Route path="upload" element={<UploadNote />} />
      <Route path="bookmarks" element={<Bookmarks />} />
      <Route path="freedom-wall" element={<FreedomWall />} />
      <Route path="profile" element={<Profile />} />
    </Routes>
  );
}
