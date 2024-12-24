import { SignIn, SignUp } from "@clerk/clerk-react";
// import { useNavigate } from "react-router-dom";

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
  //   const navigate = useNavigate();

  return (
    <div className="h-screen flex justify-center flex-col">
      <div className="flex justify-center">
        {type === "signup" ? (
          <SignUp
            routing="path"
            path="/signup"
            signInUrl="/signin"
            afterSignUpUrl="/blogs"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none",
                formButtonPrimary: "bg-gray-800 hover:bg-gray-900",
              },
            }}
          />
        ) : (
          <SignIn
            routing="path"
            path="/signin"
            signUpUrl="/signup"
            afterSignInUrl="/blogs"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none",
                formButtonPrimary: "bg-gray-800 hover:bg-gray-900",
              },
            }}
          />
        )}
      </div>
    </div>
  );
};
