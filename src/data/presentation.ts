type Social = {
  label: string;
  link: string;
  svg?: string;
};

type Presentation = {
  mail: string;
  title: string;
  description: string;
  description_zh: string;
  socials: Social[];
  profile?: string;
  techStack: string[];
};

const presentation: Presentation = {
  mail: "91xusir@proton.me",
  title: "Hi,there👋",
  description: `
    I'm a *full-stack developer*, an *independent developer*, and a *product person*, 
    focused on developing various interesting small products. 
    My tech stack includes Copilot, Cursor, and ChatGPT.
  `,
  description_zh: `
    全栈开发者，独立开发者和产品人，喜欢开发各种有趣的小玩具。
  `,
  techStack: ["*Copilot*+", "*Cursor*+", "*ChatGPT*", "👀"],
  socials: [
    {
      label: "Github",
      link: "https://github.com/91xusir",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`
    },
    {
      label: "Telegram",
      link: "https://t.me/xu_sir",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.633 3.373c-.17-.167-.425-.267-.708-.267-.117 0-.237.017-.355.05L2.55 9.042a1.578 1.578 0 0 0-.967.875c-.183.42-.167.887.042 1.292.208.404.583.687 1.033.775l4.733.967-1.475 6.625a1.42 1.42 0 0 0 .417 1.342c.325.287.75.412 1.175.333a1.643 1.643 0 0 0 .967-.542l3.342-3.917 4.733 3.842c.267.217.583.333.917.333.183 0 .367-.033.542-.1.467-.183.8-.583.917-1.075l3.575-16.317c.1-.433.017-.833-.267-1.1z"/></svg>`
    }
  ]
};

export default presentation;
