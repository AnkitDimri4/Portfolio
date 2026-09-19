// Loaded lazily with the Stack section so ~40 brand icons stay out of the main bundle.
import {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiTailwindcss, SiMui, SiBootstrap,
  SiHtml5, SiCss3, SiExpo, SiAndroidstudio, SiFirebase, SiNodedotjs, SiExpress, SiFastapi,
  SiDjango, SiFlask, SiClerk, SiPostgresql, SiMongodb, SiMysql, SiRedis, SiPython,
  SiScikitlearn, SiTensorflow, SiNumpy, SiPandas, SiJupyter, SiCplusplus, SiGit, SiGithub,
  SiPostman, SiPycharm, SiRender, SiVercel, SiRedux, SiPlotly, SiClaude, SiJenkins, SiKubernetes,
  SiCloudflare, SiAmazonwebservices, SiGooglecloud, SiGooglecloudstorage, SiXcode, SiIos, SiAndroid,
} from "react-icons/si";
import { TbBrandVscode, TbApi, TbChartDots, TbPointerFilled, TbShieldLock } from "react-icons/tb";

export const STACK = [
  {
    group: "Frontend",
    items: [
      ["React", SiReact], ["Next.js", SiNextdotjs], ["TypeScript", SiTypescript], ["JavaScript", SiJavascript],
      ["Redux", SiRedux], ["Tailwind CSS", SiTailwindcss], ["Material UI", SiMui], ["Bootstrap", SiBootstrap],
      ["HTML5", SiHtml5], ["CSS / SCSS", SiCss3],
    ],
  },
  {
    group: "Mobile",
    items: [
      ["React Native", SiReact], ["Expo & Expo Router", SiExpo], ["iOS apps", SiIos], ["Android apps", SiAndroid],
      ["Xcode", SiXcode], ["Android Studio", SiAndroidstudio], ["Firebase", SiFirebase], ["RN Chart Kit & SVG", TbChartDots],
    ],
  },
  {
    group: "Backend",
    items: [
      ["Node.js", SiNodedotjs], ["Express", SiExpress], ["FastAPI", SiFastapi], ["Django", SiDjango],
      ["Flask", SiFlask], ["REST APIs", TbApi], ["Clerk Auth", SiClerk],
    ],
  },
  {
    group: "Databases",
    items: [["PostgreSQL · Neon", SiPostgresql], ["MongoDB", SiMongodb], ["MySQL", SiMysql], ["Redis · Upstash", SiRedis]],
  },
  {
    group: "AI / ML & Data",
    items: [
      ["Python", SiPython], ["scikit-learn", SiScikitlearn], ["TensorFlow · Keras", SiTensorflow], ["NumPy", SiNumpy],
      ["Pandas", SiPandas], ["Matplotlib · Seaborn", SiPlotly], ["Jupyter", SiJupyter],
    ],
  },
  {
    group: "Languages & Tools",
    items: [
      ["C++", SiCplusplus], ["Git", SiGit], ["GitHub", SiGithub], ["Postman", SiPostman], ["VS Code", TbBrandVscode],
      ["Cursor", TbPointerFilled], ["Claude", SiClaude], ["PyCharm", SiPycharm],
    ],
  },
  {
    group: "Cloud & DevOps",
    items: [
      ["AWS", SiAmazonwebservices], ["Google Cloud (GCP)", SiGooglecloud], ["Cloud Storage (GCS)", SiGooglecloudstorage],
      ["Cloudflare", SiCloudflare], ["Kubernetes (K8s)", SiKubernetes], ["Jenkins", SiJenkins], ["NetBird", TbShieldLock],
      ["Render", SiRender], ["Vercel", SiVercel],
    ],
  },
];
