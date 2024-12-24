import { Link, useNavigate } from "react-router-dom";
import Hlogo from "../assets/hlogo.svg";
export const Appbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  return (
    <div className="border-b flex justify-between px-32 py-4">
      <Link
        to={"/blogs"}
        className="flex flex-col justify-center cursor-pointer "
      >
        <div className="flex gap-4">
          <img className="" src={Hlogo} alt="Logo" />
          Hacker Blog
        </div>
      </Link>

      <div className="flex gap-x-3">
        <Link to={`/publish`}>
          <button className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Write
          </button>
        </Link>

        <button
          onClick={handleLogout}
          className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Logout
        </button>
        {/* <Avatar size={"big"} name="akshat" /> */}
      </div>
    </div>
  );
};
