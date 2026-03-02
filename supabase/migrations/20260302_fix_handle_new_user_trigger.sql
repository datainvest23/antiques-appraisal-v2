-- Fix handle_new_user trigger to be fault-tolerant
-- "Database error saving new user" is caused by this trigger raising an unhandled exception.
-- Wrap everything in EXCEPTION WHEN OTHERS so auth signup is NEVER blocked by our trigger.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users (idempotent)
  INSERT INTO public.users (user_id, email, created_at, user_type)
  VALUES (NEW.id, NEW.email, NEW.created_at, 'user')
  ON CONFLICT (user_id) DO NOTHING;

  -- Initialize token balance with 5 free tokens (idempotent)
  INSERT INTO public.tokens (user_id, token_balance, transaction_history)
  VALUES (
    NEW.id,
    5,
    '[{"reason":"initial_signup","tokens":5}]'::jsonb
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log the error but NEVER fail auth signup because of our trigger
  RAISE WARNING 'handle_new_user trigger error for user %: % %', NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (DROP first in case it already exists with old definition)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
