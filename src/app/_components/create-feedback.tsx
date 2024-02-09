"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";

import { Textarea } from "~/components/ui/textarea";
import { z } from "zod";

import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { toast } from "sonner";

export function CreateFeedback() {
  const createFeedback = api.feedback.create.useMutation();

  const formSchema = z.object({
    name: z.string(),
    email: z.union([z.string().email(), z.literal("")]),
    message: z
      .string()
      .min(25, "The feedback needs to be at least 25 characters long."),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createFeedback.mutate(values, {
      onSuccess: () => {
        toast.success("Feedback submitted successfully!");
        form.reset();
      },
      onError: (error) => {
        toast.error("Error submitting feedback", {
          description: error.message,
        });
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter your feedback" {...field} />
              </FormControl>
              <FormDescription>
                Help us improve our service. We appreciate you comments.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {createFeedback.isLoading ? (
          <Button disabled>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit">Submit</Button>
        )}
      </form>
    </Form>
  );
}
