import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

interface UserNavProps {
  user: User;
  signOut: () => void;
}

export function UserNav({ user, signOut }: UserNavProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground hidden sm:inline-block">
        {user.email}
      </span>
      <Button variant="ghost" size="sm" onClick={signOut}>
        Sign Out
      </Button>
    </div>
  );
}
