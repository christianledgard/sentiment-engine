import { ReloadIcon } from "@radix-ui/react-icons";
import React from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

interface DeleteFeedbackProps {
  feedbackId: number;
  refetch: () => void;
}

export const DeleteFeedback = ({
  feedbackId,
  refetch,
}: DeleteFeedbackProps) => {
  const deleteFeedbackById = api.feedback.deleteFeedbackById.useMutation();

  if (deleteFeedbackById.isLoading)
    return (
      <Button disabled variant="secondary">
        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </Button>
    );

  return (
    <Button
      variant="secondary"
      onClick={() =>
        deleteFeedbackById.mutate(
          { id: feedbackId },
          {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSuccess: () => {
              refetch();
              toast.success("Eliminado correctamente");
            },
          },
        )
      }
    >
      Delete
    </Button>
  );
};
