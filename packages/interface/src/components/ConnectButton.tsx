import { usePrivy } from "@privy-io/react-auth";

import { Button } from "./ui/Button";

export const ConnectButton = (): JSX.Element => {
  const { login, logout, authenticated } = usePrivy();

  const handleLogout = () => {
    localStorage.removeItem("maciPrivKey");
    localStorage.removeItem("maciPubKey");
    localStorage.removeItem("semaphoreIdentity");
    logout();
  };

  return <Button onClick={authenticated ? handleLogout : login}>{authenticated ? "Logout" : "Login"}</Button>;
};
