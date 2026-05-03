import { AppNavContext } from "./appNavContext";

export default function NavProvider({ value, children }) {
  return <AppNavContext.Provider value={value}>{children}</AppNavContext.Provider>;
}
