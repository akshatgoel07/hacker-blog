import { Sparkles, Code, Clock, Command, Feather } from "lucide-react";

interface Feature {
  id: number;
  name: string;
  description: string;
  icon: JSX.Element;
}

const iconSize = 18;

const FeaturesData: Feature[] = [
  {
    id: 1,
    name: "Easy to Use",
    description:
      "HackerBlog components are designed to be intuitive and easy to use, even for beginners.",
    icon: <Sparkles size={iconSize} />,
  },
  {
    id: 3,
    name: "Developer-Friendly",
    description:
      "HackerBlog is built with developers in mind so that you can contribute to open source easily!.",
    icon: <Code size={iconSize} />,
  },
  {
    id: 4,
    name: "Responsive",
    description:
      "HackerBlog components are designed to be responsive and work seamlessly across devices.",
    icon: <Feather size={iconSize} />,
  },
  {
    id: 5,
    name: "Accessible",
    description:
      "HackerBlog prioritizes accessibility, ensuring that your components are usable by everyone.",
    icon: <Command size={iconSize} />,
  },
  {
    id: 6,
    name: "Regularly Updated",
    description:
      "HackerBlog is actively maintained and regularly updated with new features and improvements.",
    icon: <Clock size={iconSize} />,
  },
];

const FeaturesGrid = () => {
  return (
    <div>
      <div className="mt-8 grid w-full grid-cols-2 gap-12 md:grid-cols-2 lg:grid-cols-3">
        {FeaturesData.map((feature) => {
          return (
            <div key={feature.id} className="width-fit text-left">
              <div className="mb-2 w-fit rounded-lg bg-blue-500 p-1 text-center text-white ">
                {feature.icon}
              </div>
              <div className="text-md mb-1 font-semibold text-gray-900 dark:text-gray-100">
                {feature.name}
              </div>
              <div className="font-regular max-w-sm text-xs text-gray-600  dark:text-gray-400">
                {feature.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FeaturesWithHeading = () => {
  return (
    <div className="my-12 flex w-full flex-col items-center justify-center px-4">
      <h1 className="mb-2 max-w-3xl text-center text-2xl font-semibold tracking-tighter text-gray-900 md:text-3xl dark:text-gray-100">
        Hacker blogs is constantly developing!
      </h1>
      <p className="max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
        Hacker Blog is an open source project that aims to provide a platform
        for developers to share their knowledge and experiences with the
        community.
      </p>
      <FeaturesGrid />
    </div>
  );
};

export default FeaturesWithHeading;
