import { CreatorAuthProvider } from "../_contexts/creator-auth";

export default function CreatorPortalLayout({ children }: { children: React.ReactNode }) {
  return <CreatorAuthProvider>{children}</CreatorAuthProvider>;
}
