"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { BACKEND_URL } from "../config";
import { Appbar } from "../components/Appbar";
import { useToast } from "../hooks/use-toast";
import { useDrafts } from "../hooks";
import { formatPublishedDate } from "../lib/date";

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
  const { drafts, loading: draftsLoading } = useDrafts();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

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
      setFetchError("Could not load your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
        <div className="container mx-auto max-w-md mt-10 rounded-lg">
          <div className="h-96 w-96 bg-parchment-300 p-8 text-center animate-pulse"></div>
        </div>
      </>
    );
  }

  if (fetchError) {
    return (
      <>
        <Appbar />
        <div className="p-8 text-destructive text-center font-serif italic">
          {fetchError}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <Appbar />
      <main className="max-w-2xl mx-auto px-6 md:px-10 py-10">
        <div className="text-center font-smallcaps text-xs text-sepia tracking-[0.4em] mb-2">
          ❦ The Editor's Desk ❦
        </div>
        <h1 className="text-center font-display text-3xl md:text-4xl text-ink mb-2">
          Your Column
        </h1>
        <hr className="news-rule-double mb-8" />

        <section className="bg-parchment-100 border border-ink p-6 md:p-8 mb-10">
          <h2 className="font-display text-xl text-ink mb-1">Pen name</h2>
          <hr className="news-rule-thin mb-4" />

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-smallcaps tracking-widest text-xs text-ink-soft">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        className="bg-parchment-200 border-ink rounded-none font-serif"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="font-serif text-xs italic text-ink-faded">
                      Shown above every story you publish.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="font-smallcaps tracking-widest text-xs text-ink-soft">
                  Email
                </FormLabel>
                <p className="mt-1 font-serif text-ink">{profileEmail}</p>
              </div>

              <Button
                type="submit"
                disabled={!form.formState.isValid}
                className="font-smallcaps tracking-[0.3em] text-xs bg-ink text-parchment-100 border border-ink hover:bg-ink-soft rounded-none px-6"
              >
                Save changes
              </Button>
            </form>
          </Form>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="font-display text-xl text-ink">Drafts in the drawer</h2>
            <Link
              to="/publish"
              className="font-smallcaps tracking-widest text-[11px] text-sepia hover:text-sepia-dark underline decoration-1 underline-offset-4"
            >
              New story →
            </Link>
          </div>
          <hr className="news-rule-thin mb-4" />

          {draftsLoading ? (
            <p className="font-serif italic text-ink-faded">Pulling drafts…</p>
          ) : drafts.length === 0 ? (
            <p className="font-serif italic text-ink-faded">
              Your drawer is empty. Start a story and "Save as draft" to keep it
              here.
            </p>
          ) : (
            <ul className="divide-y divide-ink">
              {drafts.map((d) => (
                <li key={d.id} className="py-3">
                  <Link
                    to={`/edit/${d.id}`}
                    className="block group"
                  >
                    <div className="font-display text-lg text-ink leading-snug capitalize group-hover:underline decoration-1 underline-offset-4">
                      {d.title || <em className="italic">Untitled</em>}
                    </div>
                    <div className="font-smallcaps text-[11px] text-ink-soft tracking-widest mt-1">
                      Last edited {formatPublishedDate(d.updatedAt)}
                      <span className="mx-2">·</span>
                      <span className="text-sepia group-hover:text-sepia-dark">
                        Continue →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};
