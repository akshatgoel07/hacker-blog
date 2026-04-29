import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/Signin";
import { Blogs } from "./pages/Blogs";
import { Landing } from "./pages/Landing";
import { NotFound } from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { Spinner } from "./components/Spinner";

const Publish = lazy(() =>
  import("./pages/Publish").then((m) => ({ default: m.Publish })),
);
const Blog = lazy(() =>
  import("./pages/Blog").then((m) => ({ default: m.Blog })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const AuthorProfile = lazy(() =>
  import("./pages/AuthorProfile").then((m) => ({ default: m.AuthorProfile })),
);

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-parchment-200">
    <Spinner />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/edit/:id" element={<Publish />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/u/:id" element={<AuthorProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
