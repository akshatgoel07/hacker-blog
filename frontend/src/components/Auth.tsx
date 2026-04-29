import { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [postInputs, setPostInputs] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    username: "",
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
    const usernameError =
      type === "signup" && !postInputs.username.trim()
        ? "Username is required"
        : "";

    setErrors({
      email: emailError,
      password: passwordError,
      username: usernameError,
    });

    return (
      !emailError && !passwordError && (!usernameError || type !== "signup")
    );
  };

  const isFormValid = () => {
    if (type === "signup") {
      return (
        postInputs.email.trim() &&
        postInputs.password.trim() &&
        postInputs.username.trim()
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
    } catch (e: any) {
      setLoading(false);
      const status = e?.response?.status;
      const apiMessage = e?.response?.data?.message;
      let message: string;
      if (!e?.response) {
        message = "Couldn't reach the server. Is the backend running?";
      } else if (apiMessage) {
        message = apiMessage;
      } else if (status === 401) {
        message = "Invalid email or password";
      } else if (status === 411) {
        message = "Email already exists";
      } else {
        message = "Something went wrong. Please try again.";
      }
      setErrors({ ...errors, email: message });
    }
  }

  return (
    <div className="h-screen flex justify-center flex-col bg-parchment-200">
      <div className="flex justify-center">
        <div className="w-full max-w-md px-10">
          <div className="text-center font-smallcaps text-xs text-sepia tracking-[0.4em] mb-2">
            ❦ {type === "signin" ? "Press Credentials" : "New Subscription"} ❦
          </div>
          <h1 className="font-blackletter text-5xl text-center text-ink leading-none">
            {type === "signin" ? "Sign In" : "Join the Press"}
          </h1>
          <hr className="news-rule-double my-4" />
          <p className="text-center font-serif text-sm text-ink-soft">
            {type === "signin"
              ? "New reader of these pages? "
              : "Already keep a column with us? "}
            <Link
              className="font-smallcaps tracking-widest text-sepia underline decoration-1 underline-offset-4 hover:text-sepia-dark"
              to={type === "signin" ? "/signup" : "/signin"}
            >
              {type === "signin" ? "Subscribe" : "Sign in"}
            </Link>
          </p>
          <div className="pt-6">
            {type === "signup" && (
              <LabelledInput
                label="Username"
                placeholder="Enter your username..."
                onChange={(e) => {
                  setPostInputs({
                    ...postInputs,
                    username: e.target.value,
                  });
                  setErrors({ ...errors, username: "" });
                }}
                error={errors.username}
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
              className={`mt-8 w-full font-smallcaps tracking-[0.3em] text-sm py-3 border ${
                isFormValid()
                  ? "bg-ink text-parchment-100 border-ink hover:bg-ink-soft"
                  : "bg-parchment-300 text-ink-faded border-ink-faded cursor-not-allowed"
              } focus:outline-none focus:ring-1 focus:ring-ink`}
            >
              {loading
                ? "Setting Type…"
                : type === "signup"
                ? "Submit Manuscript"
                : "Enter the Newsroom"}
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
      <label className="block mb-1 font-smallcaps text-xs text-ink-soft tracking-widest pt-4">
        {label}
      </label>
      <input
        onChange={onChange}
        type={type || "text"}
        className={`bg-parchment-100 border ${
          error ? "border-destructive" : "border-ink"
        } text-ink font-serif text-base block w-full px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ink`}
        placeholder={placeholder}
        required
      />
      {error && (
        <p className="mt-1 text-xs italic text-destructive font-serif">
          {error}
        </p>
      )}
    </div>
  );
}
