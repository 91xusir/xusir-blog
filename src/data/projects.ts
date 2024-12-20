export type Project = {
  title: string;
  description: string;
  link: string;
  techs: string[];
  isComingSoon?: boolean;
};

export const projects: Project[] = [
  {
    title: "oauth-link",
    description: "A Single-player game trainer",
    link: "https://github.com/91xusir/",
    techs: ["Nuxt", "Typescript", "Vue"],
    isComingSoon: true
  },
  {
    title: "trainer-templates",
    description: "A Single-player game trainer",
    link: "https://github.com/91xusir/trainer-templates",
    techs: ["C#"],
    isComingSoon: false
  }
];
export default projects;
