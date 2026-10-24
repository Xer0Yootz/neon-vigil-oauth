-- Security advisor 0028/0029: the project's rls_auto_enable() event-trigger function (SECURITY DEFINER) was
-- callable over /rest/v1/rpc by anon and signed-in users. Event triggers still fire without EXECUTE.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
