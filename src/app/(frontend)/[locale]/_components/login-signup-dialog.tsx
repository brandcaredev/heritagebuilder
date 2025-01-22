import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import Login from "./login";
import Register from "./register";

const LoginSignupDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [activeDialog, setActiveDialog] = useState<"login" | "register">(
    "login",
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-brown-200 z-[9999] mx-auto flex w-full flex-col justify-center space-y-6 border-none sm:w-[450px]">
        {activeDialog === "login" ? (
          <Login
            switchDialog={() => setActiveDialog("register")}
            closeDialog={() => setOpen(false)}
          />
        ) : (
          <Register switchDialog={() => setActiveDialog("login")} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginSignupDialog;
