import { Link, useNavigate } from "react-router-dom";
import Hlogo from "../assets/hlogo.svg";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export const Appbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="border-b flex justify-between items-center px-4 md:px-8 lg:px-32 py-4">
      <Link to={"/blogs"} className="flex items-center gap-2 cursor-pointer">
        <img src={Hlogo} alt="Logo" />
        <span className="font-medium">Hacker Blog</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link to={`/publish`}>
          <Button variant="default" size="sm">
            Write
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
