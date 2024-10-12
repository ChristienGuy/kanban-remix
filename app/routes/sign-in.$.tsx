import { SignUp } from "@clerk/remix";

export default function Page() {
  return (
    <div className="grid h-dvh justify-center items-center">
      <SignUp />
    </div>
  );
}
