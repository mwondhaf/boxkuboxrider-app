import { HeroUINativeProvider } from "heroui-native";
import type { ReactNode } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  return <HeroUINativeProvider>{children}</HeroUINativeProvider>;
};

export default Providers;
