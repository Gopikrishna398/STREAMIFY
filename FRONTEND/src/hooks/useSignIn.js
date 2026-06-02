import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn } from "../lib/api";

const useSignIn = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signIn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  return { isPending, error, signInMutation: mutate };
};
export default useSignIn;