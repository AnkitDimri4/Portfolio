// Loaded lazily with the Stack section so ~40 brand icons stay out of the main bundle.
import {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiTailwindcss, SiMui, SiBootstrap,
  SiHtml5, SiCss3, SiExpo, SiAndroidstudio, SiFirebase, SiNodedotjs, SiExpress, SiFastapi,
  SiDjango, SiFlask, SiClerk, SiPostgresql, SiMongodb, SiMysql, SiRedis, SiPython,
  SiScikitlearn, SiTensorflow, SiNumpy, SiPandas, SiJupyter, SiCplusplus, SiGit, SiGithub,
  SiPostman, SiPycharm, SiRender, SiVercel, SiRedux, SiPlotly, SiJenkins, SiKubernetes,
  SiCloudflare, SiAmazonwebservices, SiGooglecloud, SiGooglecloudstorage, SiXcode, SiIos, SiAndroid,
  SiAppstore, SiGoogleplay, SiClickhouse, SiDocker, SiSentry, SiMixpanel, SiClaude,
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
      ["App Store releases", SiAppstore], ["Google Play releases", SiGoogleplay], ["OTA updates (EAS)", SiExpo],
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
    items: [
      ["MongoDB", SiMongodb], ["PostgreSQL · Neon", SiPostgresql], ["ClickHouse", SiClickhouse], ["MySQL", SiMysql],
      ["Redis · Upstash", SiRedis],
    ],
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
      ["Cursor", TbPointerFilled], ["Claude Code", SiClaude], ["PyCharm", SiPycharm],
    ],
  },
  {
    group: "Cloud, DevOps & Monitoring",
    items: [
      ["Google Cloud (GCP)", SiGooglecloud], ["AWS", SiAmazonwebservices], ["Cloud Storage (GCS)", SiGooglecloudstorage],
      ["Cloudflare", SiCloudflare], ["Docker", SiDocker], ["Kubernetes (K8s)", SiKubernetes], ["Jenkins CI/CD", SiJenkins],
      ["NetBird", TbShieldLock], ["Sentry", SiSentry], ["Mixpanel", SiMixpanel], ["Render", SiRender], ["Vercel", SiVercel],
    ],
  },
];
