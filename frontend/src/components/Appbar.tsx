import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const todaysDate = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const Appbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="bg-parchment-200 border-b border-ink">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-3">
        <div className="flex items-center justify-between text-[11px] font-smallcaps text-ink-soft tracking-widest">
          <span>Vol. MMXXVI · No. {(new Date().getDate()).toString().padStart(2, "0")}</span>
          <span className="hidden md:inline">"All the code that's fit to print"</span>
          <span>Price: Free</span>
        </div>
        <hr className="news-rule-thin my-2" />
        <Link to="/blogs" className="block text-center select-none">
          <h1 className="font-blackletter text-5xl md:text-7xl text-ink leading-none">
            The Hacker Blog
          </h1>
        </Link>
        <hr className="news-rule my-3" />
        <div className="flex items-center justify-between text-[12px] font-smallcaps text-ink-soft">
          <span className="hidden sm:inline">{todaysDate()}</span>
          <nav className="flex items-center gap-5">
            <Link to="/blogs" className="hover:underline underline-offset-4 decoration-1">
              Front Page
            </Link>
            <Link to="/publish" className="hover:underline underline-offset-4 decoration-1">
              Submit a Story
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:underline underline-offset-4 decoration-1 cursor-pointer">
                  The Editor
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-parchment-100 border-ink rounded-none font-serif"
              >
                <DropdownMenuItem
                  className="rounded-none focus:bg-parchment-300"
                  onClick={() => navigate("/profile")}
                >
                  My Desk
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-none focus:bg-parchment-300"
                  onClick={handleLogout}
                >
                  Sign Off
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
};
