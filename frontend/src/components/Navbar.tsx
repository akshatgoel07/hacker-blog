import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  return (
    <div>
      <header className="px-4 lg:px-20 h-14 flex items-center">
        <a className="flex items-center justify-center" href="#">
          <MountainIcon />
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a
            className="text-sm font-medium hover:underline underline-offset-4"
            href="https://www.linkedin.com/in/akshatgoel7/"
            target="_blank"
          >
            Linkedin
          </a>
          <a
            className="text-sm font-medium hover:underline underline-offset-4"
            href="https://github.com/akshatgoel07"
            target="_blank"
          >
            Github
          </a>

          <a
            className="text-sm font-medium hover:underline underline-offset-4"
            href="https://twitter.com/akshato7"
            target="_blank"
          >
            Contact
          </a>
          <a
            href="https://akshatgoel.com"
            target="_blank"
            className="text-sm font-medium text-indigo-500 hover:text-indigo-700 hover:underline underline-offset-4"
          >
            Portfolio
          </a>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;

function MountainIcon() {
  return (
    <svg
      // {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
