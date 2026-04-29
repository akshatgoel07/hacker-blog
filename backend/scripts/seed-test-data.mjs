import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password.ts";

const prisma = new PrismaClient();

const DELETE_IDS = [
  "7655bdae-98d3-4ef9-a916-4e56b10241f0", // hidden_draft_xyzzz
  "ffe7511e-4778-40aa-8d88-44dab3a727a2", // Orig
  "35e39353-904f-452d-a557-51b9788c5bc1", // Edited
  "ba3aad87-ff92-443d-8612-fbeb55a6ac38", // Defaults
  "fe9df286-6472-4851-bcf7-a7df42d37365", // My Draft / "secret"
  "db353a12-6adb-44a3-b0ad-3b8a9d01649f", // cache test
  "b9d09fa1-de95-4c5e-a286-b8277fc7c18d", // My Test
  "9e5add49-faaf-4cc3-ab6b-ccce79bc58c6", // "This is a test post..."
];

const TEST_USERS = [
  {
    email: "maya@test.local",
    name: "Maya Patel",
    password: "demopass",
    posts: [
      {
        title: "Why I stopped reaching for Postgres for side projects",
        content: `For years my default for any side project was Postgres. Doesn't matter if it's a Discord bot, a homepage, or a tiny tool I'll abandon in a week — the very first thing I'd do is \`createdb\` and write a migration. Eventually I noticed something: most of those projects never grew up. They sat on a single machine. They had one user (me). They served maybe a hundred requests a day. And every one of them was paying a Postgres-shaped tax in setup, deployment, and ops.

So I started using SQLite as the default instead, and reaching for Postgres only when the project crossed a real line. Six months in, I have not regretted it once.

### The friction Postgres adds

It's not the database itself — Postgres is wonderful. It's everything around it. Spinning up a managed instance somewhere costs money. Self-hosting means you own the backup story, the connection-pool story, the long-running-migration story. Even the local dev loop is heavier: a docker-compose file, a wait-for-it script, secrets in \`.env\` files I'll forget to rotate.

SQLite collapses all of that into a single file on disk. Backups become \`cp\`. Deploys become \`scp\`. Tests run against a fresh in-memory database in milliseconds. There is no port to open, no role to grant, no connection string to typo.

### Where SQLite actually struggles

Two cases: heavy concurrent writes, and multi-machine setups. WAL mode mitigates the first surprisingly well — for the kind of project where you have a handful of writers, it's effectively a non-issue. The second is the real cliff. If you need two machines reading and writing the same data, SQLite stops being a serious answer and you should reach for the network-database tier.

But the bar for "I need two machines" is much higher than I used to think. Most side projects never reach it. Most internal tools don't reach it. A surprising number of B2B SaaS products would be fine on one box for years.

### My new rule

Start on SQLite. Move to Postgres the day you can articulate, in a sentence, why your workload requires it. If you can't, you don't.`,
      },
      {
        title: "How to read a long stack trace without losing your mind",
        content: `Stack traces are a UI. They have an audience (you, in a hurry, possibly at 2am), they have a job (point at the broken line), and they fail at it constantly. Here's the protocol I use to read a long one fast.

### Read it inside-out

The most useful frame is almost never the top. The top of the stack is whichever language-runtime function ultimately raised — \`__getattr__\`, \`promise.then\`, \`reflect.invoke\`. The bug is almost always in the highest frame whose path contains your repo name.

So: scroll past the framework. Find the first frame in your code. Start there.

### Look for the verb

Most useful errors take the form *something happened to something*. Read the message looking for a noun and a verb:

- "TypeError: Cannot read properties of undefined (reading 'name')" — verb: read. Noun: \`undefined.name\`. Question: which call site is reading \`.name\`?
- "duplicate key value violates unique constraint" — verb: insert. Noun: a row that's already there. Question: who's trying to insert a duplicate?

Once you have the verb you usually have the bug class.

### One-line repro before you grep

If the trace points you at a function, your next step is *not* to grep around looking for callers. It's to write the smallest possible test that hits that function with the inputs from the trace. If you can reproduce in five lines, you've turned a 200-frame stack trace into a five-line bug. If you can't reproduce, the trace was lying about which call site was at fault — go back and read it more carefully.

### When the trace is in a build artifact

Source maps lie. Bundlers lie. \`.map\` files get out of date. If your stack trace says \`vendor.js:1:8421\`, you can't read that. Two moves:

1. Open the file at that line and look for any string literal you recognize.
2. If you can't find one, run the same code unminified locally — change one log message and watch which frame moves.

### Save the trace

Even if you fix the bug, copy the full trace into the commit message or PR. Future-you will be looking at a similar trace in three months and will appreciate finding the previous one indexed.`,
      },
    ],
  },
  {
    email: "theo@test.local",
    name: "Theo Lin",
    password: "demopass",
    posts: [
      {
        title: "Three rules I follow when reviewing a pull request",
        content: `Code review is the most leveraged kind of feedback you can give an engineer. It's also the most easily wasted. Here's the working set of rules I've converged on.

### Rule 1: Read the description before the diff.

If there's no description, ask for one before you read a single line. Reviewing the diff first is reviewing in the wrong order — you start forming opinions about implementation choices before you understand what the change is trying to accomplish. The right question for any review is *does this PR do what its description says?*, and if you don't know what it claims to do, you don't know whether it succeeded.

### Rule 2: Distinguish between blocking comments and notes.

Every review comment falls into one of three buckets: *correctness* (it's broken or unsafe), *clarity* (a future reader will be confused), and *taste* (I'd have written this differently). The first two are blocking. The third is a note. If I leave a taste comment, I prefix it "nit:" and explicitly say I'm not blocking on it.

This single habit has done more for the speed of my team's review cycle than anything else I've tried. It's not because I have fewer thoughts — it's because the author can immediately tell which thoughts to act on.

### Rule 3: Prefer suggesting, not asking.

Compare:

> "Why are you using a Map here instead of an object?"

with

> "Suggest using \`Object.fromEntries\` here — same shape, fewer imports."

The first is a quiz. The author has to defend their choice and then maybe change it. The second is a concrete alternative they can take or leave. The first wastes a round trip; the second resolves in one comment.

### What I deliberately don't do

I don't comment on style my linter could catch. I don't ask for "more tests" without saying which case is missing. I don't say "this is fine, but…" — if it's fine, leave it.

A code review is a small piece of writing aimed at a single reader. The standards are the same as for any other piece of writing: be specific, be useful, end at the right time.`,
      },
      {
        title: "The unbearable weight of meetings",
        content: `I worked at a company once where the weekly cost of a single recurring meeting was higher than my rent. Ten engineers, one hour, every Monday. By the time you fold in context-switching tax and the standard "let's circle back after" follow-up, that meeting was burning roughly fifteen engineer-hours a week. For a status update.

The defense was always that the meeting was *important*. And it was — once a quarter. The problem was that it ran weekly.

### Recurring meetings should age out

A meeting earns its place on the calendar by being useful *this* week. The default for a recurring meeting should be that it expires every quarter and has to be re-justified. Almost no team does this. Almost no team would lose anything from doing this.

When I've actually run this experiment — silently delete the recurring meeting and wait — usually nobody notices for at least a month. When somebody does notice, they raise the concrete topic that needed a meeting, and that one-off conversation is twice as productive as the recurring one would have been.

### "Async" is not always the answer

I'm wary of the reflex to replace meetings with documents. A document is a meeting that takes longer and reaches fewer people. The right replacement for most status meetings is *no meeting and no document* — the status was already in the ticket tracker, the chat log, and the deploy notifications.

Real meetings exist for: aligning humans on a hard decision, defusing tension, and brainstorming where you genuinely need someone's voice in the room. None of those are weekly. None of those need a recurring slot.

### What I do about it

I write the calendar invite I want to keep, and I delete every other one. Once a month I look at my calendar and ask, for each recurring meeting: if I started this job today, would I add this back? If no, I leave it. If hell no, I drop it.

Most people, asked plainly, are relieved when you cancel a meeting.`,
      },
    ],
  },
  {
    email: "saman@test.local",
    name: "Saman Hosseini",
    password: "demopass",
    posts: [
      {
        title: "Building a CLI in 100 lines of Go (no dependencies)",
        content: `Go's standard library is so good for command-line tools that pulling in cobra or urfave/cli for a small program feels excessive. Here's how I build CLIs with nothing but \`flag\` and a bit of discipline.

### The skeleton

\`\`\`go
package main

import (
    "flag"
    "fmt"
    "io"
    "os"
)

type cli struct {
    out io.Writer
    err io.Writer
}

func main() {
    c := &cli{out: os.Stdout, err: os.Stderr}
    if err := c.run(os.Args[1:]); err != nil {
        fmt.Fprintln(c.err, "error:", err)
        os.Exit(1)
    }
}

func (c *cli) run(args []string) error {
    if len(args) == 0 {
        return c.usage()
    }
    switch args[0] {
    case "list":
        return c.list(args[1:])
    case "add":
        return c.add(args[1:])
    default:
        return c.usage()
    }
}
\`\`\`

That's the whole pattern. Each subcommand is a method on \`*cli\` that takes the remaining args. The struct holds anything injectable — output writers, a clock, an HTTP client — so tests can substitute their own.

### Why a struct, not package-level globals

The minute you have \`os.Stdout\` hardcoded inside a subcommand, you can't write a test that checks what your CLI printed without redirecting the global. With a struct, your test creates a \`bytes.Buffer\`, passes it as \`out\`, and asserts on its contents. The whole CLI becomes unit-testable without a single network call or filesystem mock.

### Per-subcommand flag sets

Each subcommand should have its own \`flag.NewFlagSet\`. This way \`mytool list --json\` doesn't collide with \`mytool add --json\` — and the help text per subcommand is generated by Go's stdlib for free.

\`\`\`go
func (c *cli) list(args []string) error {
    fs := flag.NewFlagSet("list", flag.ContinueOnError)
    fs.SetOutput(c.err)
    asJSON := fs.Bool("json", false, "emit JSON")
    if err := fs.Parse(args); err != nil {
        return err
    }
    // ... do the listing, respecting *asJSON
    return nil
}
\`\`\`

### Why this approach scales further than people think

Most CLIs end up with maybe ten subcommands. At that scale, the cobra/urfave abstractions buy you about thirty lines of code and cost you a build dependency, a docs ecosystem you have to learn, and a habit of reaching for "their" features instead of stdlib ones. Below ten subcommands, the boring stdlib version is shorter and clearer.

When does it stop being enough? When you need shell completions, manpage generation, or nested subcommand trees three levels deep. At that point, reach for cobra. Until then, save yourself the import.`,
      },
      {
        title: "Reading and writing files in Rust without bringing in a dependency",
        content: `Rust's standard library has everything you need for ordinary file work. People reach for crates like \`fs-err\`, \`anyhow\`, or even \`std::fs\` wrappers because the default error messages are terrible — but the wrappers all do the same thing, and so can you.

### The default is not great

\`\`\`rust
let s = std::fs::read_to_string("config.yaml")?;
\`\`\`

If \`config.yaml\` doesn't exist, you get \`No such file or directory (os error 2)\` — and nothing about which file. In a binary that touches a dozen files, this is a debugging nightmare.

### A 12-line helper that fixes it forever

\`\`\`rust
use std::path::Path;
use std::io;

fn read_to_string(path: impl AsRef<Path>) -> io::Result<String> {
    let path = path.as_ref();
    std::fs::read_to_string(path).map_err(|e| {
        io::Error::new(
            e.kind(),
            format!("reading {}: {}", path.display(), e),
        )
    })
}
\`\`\`

Drop this in a \`fs.rs\` module and use it everywhere. Now your error messages say \`reading config.yaml: No such file or directory\`, which tells you the actual file. Same idea for \`write\`, \`metadata\`, \`canonicalize\` — five-minute job to add wrappers as you need them.

### Don't write your own \`Result<T, MyError>\` until you need to

It's tempting to define a project-wide error enum from day one. Don't, until you can name two distinct callers that need to discriminate between two distinct error variants. \`io::Result<T>\` is already an alias for \`Result<T, io::Error>\` and \`io::Error\` already carries an \`ErrorKind\` you can match on.

When the day comes that you really do need \`MyError\`, \`thiserror\` is the cleanest macro for it. Until that day, \`io::Result<T>\` paired with the wrapper above will get you a long way.

### Buffered writes are not optional for performance

This trips up almost everyone:

\`\`\`rust
let mut f = std::fs::File::create("out.log")?;
for line in lines {
    writeln!(f, "{}", line)?;  // syscall per line
}
\`\`\`

vs.

\`\`\`rust
let f = std::fs::File::create("out.log")?;
let mut w = std::io::BufWriter::new(f);
for line in lines {
    writeln!(w, "{}", line)?;  // buffered
}
w.flush()?;
\`\`\`

The first version makes one \`write(2)\` syscall per line. On a million-line file, that's a million syscalls. The second batches them into 8 KB chunks. Same code, two orders of magnitude faster, no dependencies.`,
      },
    ],
  },
];

console.log("Step 1: deleting 8 test posts...");
const del = await prisma.post.deleteMany({ where: { id: { in: DELETE_IDS } } });
console.log(`  deleted ${del.count} posts`);

console.log("Step 2: creating test users + posts...");
for (const u of TEST_USERS) {
  // upsert in case the user re-runs the script
  const passwordHash = await hashPassword(u.password);
  const user = await prisma.user.upsert({
    where: { email: u.email },
    create: { email: u.email, name: u.name, password: passwordHash },
    update: { name: u.name, password: passwordHash },
  });
  console.log(`  user: ${user.name} <${user.email}>`);
  for (const p of u.posts) {
    // skip if a post with the same title from this author already exists
    const existing = await prisma.post.findFirst({
      where: { authorId: user.id, title: p.title },
    });
    if (existing) {
      console.log(`    (already exists) ${p.title}`);
      continue;
    }
    const post = await prisma.post.create({
      data: {
        title: p.title,
        content: p.content,
        published: true,
        authorId: user.id,
      },
    });
    console.log(`    created post: ${post.title} (${post.content.length} chars)`);
  }
}

console.log("\nStep 3: final post count");
const counts = await prisma.post.groupBy({
  by: ["published"],
  _count: { _all: true },
});
console.log(counts);

await prisma.$disconnect();
