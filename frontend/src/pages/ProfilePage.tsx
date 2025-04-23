// src/pages/ProfilePage.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Appbar } from "../components/Appbar";
import { useToast } from "../hooks/use-toast";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(30, "Name must be at most 30 characters."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const ProfilePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState<string>("");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  // Populate form when we load
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setFetchError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setFetchError("You must be logged in.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
          headers: { Authorization: token },
        });
        form.reset({ name: data.name });
        setProfileEmail(data.email);
      } catch (err) {
        console.error(err);
        setFetchError("Could not load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [form]);

  const onSubmit = async (values: ProfileFormValues) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Not logged in", variant: "destructive" });
      return;
    }

    try {
      const { data } = await axios.put(
        `${BACKEND_URL}/api/v1/user/me`,
        { name: values.name },
        { headers: { Authorization: token } },
      );
      form.reset({ name: data.name });
      toast({
        title: "Profile updated",
        description: "Your name has been saved!",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Update failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <>
        <Appbar />
        <div className="container mx-auto max-w-md mt-10  rounded-lg">
          <div className="h-96 w-96 bg-gray-200 p-8 text-center animate-pulse"></div>
        </div>
      </>
    );
  }

  if (fetchError) {
    return (
      <>
        <Appbar />
        <div className="p-8 text-red-500 text-center">{fetchError}</div>
      </>
    );
  }

  return (
    <>
      <Appbar />
      <div className="container mx-auto max-w-md mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name shown on your profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Email</FormLabel>
              <p className="mt-1 text-gray-700">{profileEmail}</p>
            </div>

            <Button type="submit" disabled={!form.formState.isValid}>
              Save Changes
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};
