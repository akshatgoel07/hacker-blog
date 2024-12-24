// import { SignInButton } from "@clerk/clerk-react";

// const ClerkSignUp = () => {
//   return (
//     <div className="signup-container">
//       <SignInButton
//         fallbackRedirectUrl="/blogs"
//         signUpFallbackRedirectUrl="/blogs"
//       />
//     </div>
//   );
// };

// export default ClerkSignUp;

import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { Blogs } from "./Blogs";

export default function ClerkSignUp() {
  const { user } = useUser();

  if (!user) {
    return (
      <>
        <h1>Sign in or sign up</h1>
        <div>
          <SignIn
            fallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/onboarding"
          />
          <SignUp
            fallbackRedirectUrl="/onboarding"
            signInFallbackRedirectUrl="/dashboard"
          />
        </div>
      </>
    );
  }

  return (
    <div>
      <Blogs />
    </div>
  );
}
