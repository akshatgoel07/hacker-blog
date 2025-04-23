export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black font-['Instrument_Sans'] relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8f8f8_1px,transparent_1px),linear-gradient(to_bottom,#f8f8f8_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_110%)]"></div>
      <div className="flex flex-col items-center justify-center w-full max-w-3xl px-4 space-y-16 relative z-10">
        <div className="flex items-center text-sm text-gray-600  border-[.2px] p-2 rounded-xl">
          <span className="font-light">
            Share your stories & 3 am intrusive thoughts
          </span>
        </div>

        <h1 className="text-2xl font-bold text-center">Hacker Blog</h1>
        <p className="text-center tracking-tight text-gray-700">
          A space for thinkers and creators to share their stories and ideas
          with a global audience.
        </p>
        <p className="text-sm text-center tracking-wide text-gray-600">
          Start writing and connect with a community of passionate readers.
        </p>
      </div>
    </main>
  );
}
