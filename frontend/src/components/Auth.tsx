import { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [postInputs, setPostInputs] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    name: "",
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Invalid email format";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const validateForm = () => {
    const emailError = validateEmail(postInputs.email);
    const passwordError = validatePassword(postInputs.password);
    const nameError =
      type === "signup" && !postInputs.name.trim() ? "Name is required" : "";

    setErrors({
      email: emailError,
      password: passwordError,
      name: nameError,
    });

    return !emailError && !passwordError && (!nameError || type !== "signup");
  };

  const isFormValid = () => {
    if (type === "signup") {
      return (
        postInputs.email.trim() &&
        postInputs.password.trim() &&
        postInputs.name.trim()
      );
    }
    return postInputs.email.trim() && postInputs.password.trim();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/blogs");
    }
  }, [navigate]);

  async function sendRequest() {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
        postInputs,
      );

      if (response.data) {
        const jwt = response.data;
        localStorage.setItem("token", jwt);
        navigate("/blogs");
      } else {
        throw new Error("Authentication failed");
      }
    } catch (e) {
      setLoading(false);
      setErrors({
        ...errors,
        email:
          type === "signin"
            ? "Invalid email or password"
            : "Email already exists",
      });
    }
  }

  return (
    <div className="h-screen flex justify-center flex-col">
      <div className="flex justify-center">
        <div>
          <div className="px-10">
            <div className="text-3xl font-extrabold">Create an account</div>
            <div className="text-slate-500">
              {type === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}
              <Link
                className="pl-2 underline"
                to={type === "signin" ? "/signup" : "/signin"}
              >
                {type === "signin" ? "Sign up" : "Sign in"}
              </Link>
            </div>
          </div>
          <div className="pt-8">
            {type === "signup" && (
              <LabelledInput
                label="Name"
                placeholder="Akshat goel..."
                onChange={(e) => {
                  setPostInputs({
                    ...postInputs,
                    name: e.target.value,
                  });
                  setErrors({ ...errors, name: "" });
                }}
                error={errors.name}
              />
            )}
            <LabelledInput
              label="Email"
              placeholder="akshatgoel@gmail.com"
              onChange={(e) => {
                setPostInputs({
                  ...postInputs,
                  email: e.target.value,
                });
                setErrors({ ...errors, email: "" });
              }}
              error={errors.email}
            />
            <LabelledInput
              label="Password"
              type="password"
              placeholder="123456"
              onChange={(e) => {
                setPostInputs({
                  ...postInputs,
                  password: e.target.value,
                });
                setErrors({ ...errors, password: "" });
              }}
              error={errors.password}
            />
            <button
              onClick={sendRequest}
              type="button"
              disabled={!isFormValid()}
              className={`mt-8 w-full text-white ${
                isFormValid()
                  ? "bg-gray-800 hover:bg-gray-900"
                  : "bg-gray-400 cursor-not-allowed"
              } focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2`}
            >
              {loading
                ? "Loading..."
                : type === "signup"
                ? "Sign up"
                : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LabelledInputType {
  label: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
}

function LabelledInput({
  label,
  placeholder,
  onChange,
  type,
  error,
}: LabelledInputType) {
  return (
    <div>
      <label className="block mb-2 text-sm text-black font-semibold pt-4">
        {label}
      </label>
      <input
        onChange={onChange}
        type={type || "text"}
        className={`bg-gray-50 border ${
          error ? "border-red-500" : "border-gray-300"
        } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
        placeholder={placeholder}
        required
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
