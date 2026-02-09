import { BsFiletypeHtml, BsFiletypeCss, BsBootstrap } from "react-icons/bs";
import { FaNodeJs } from "react-icons/fa";
import { TbBrandNextjs } from "react-icons/tb";
import { MdInsertChart, MdAddchart } from "react-icons/md";

import {
  SiJavascript,
  SiMui,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiExpress,
  SiTypescript,
  SiGithub,
  SiFirebase,
  SiRedis,
  SiFastapi,
  SiDocker,
  SiSvg,
  SiC,
  SiJquery,
  SiTensorflow,
  SiVisualstudiocode,
  SiScikitlearn,
  SiNumpy,
  SiPandas,
  SiExpo,
  SiAndroidstudio,
  SiPycharm,
  SiPostman,
  SiJupyter,
  SiFlask,
  SiDjango,
} from "react-icons/si";

export const TechstackList = [
  // Frontend
  { _id: 1, name: "HTML", icon: BsFiletypeHtml, category: "Frontend" },
  { _id: 2, name: "CSS / SCSS", icon: BsFiletypeCss, category: "Frontend" },
  { _id: 3, name: "Bootstrap", icon: BsBootstrap, category: "Frontend" },
  { _id: 4, name: "JavaScript", icon: SiJavascript, category: "Frontend" },
  { _id: 5, name: "TypeScript", icon: SiTypescript, category: "Frontend" },
  { _id: 6, name: "React JS", icon: SiReact, category: "Frontend" },
  { _id: 7, name: "Next.js", icon: TbBrandNextjs, category: "Frontend" },
  { _id: 8, name: "React MUI", icon: SiMui, category: "Frontend" },
  { _id: 9, name: "Tailwind CSS", icon: SiTailwindcss, category: "Frontend" },
  { _id: 10, name: "jQuery", icon: SiJquery, category: "Frontend" },

  // Mobile
  { _id: 11, name: "React Native", icon: SiReact, category: "Mobile" },
  { _id: 12, name: "Expo / Expo Router", icon: SiExpo, category: "Mobile" },
  { _id: 13, name: "Android Studio", icon: SiAndroidstudio, category: "Mobile",},
  { _id: 14, name: "Firebase", icon: SiFirebase, category: "Mobile / Backend" },

  // Backend
  { _id: 15, name: "Node.js", icon: FaNodeJs, category: "Backend" },
  { _id: 16, name: "Express.js", icon: SiExpress, category: "Backend / Framework" },
  { _id: 17, name: "Python", icon: SiPython, category: "Backend / ML" },
  { _id: 18, name: "FastAPI", icon: SiFastapi, category: "Backend / ML" },
  { _id: 19, name: "Clerk Auth", icon: SiFirebase, category: "Backend" },
  { _id: 41, name: "Django", icon: SiDjango, category: "Backend / Framework" },
  { _id: 42, name: "Flask", icon: SiFlask, category: "Backend / Framework" },
  { _id: 39, name: "REST APIs", icon: SiPython, category: "Backend / API" },

    // API Testing / Tools 
  { _id: 40, name: "Postman", icon: SiPostman, category: "Tools / API" },

  // Database
  { _id: 20, name: "PostgreSQL (Neon)", icon: SiPostgresql, category: "Database" },
  { _id: 21, name: "Redis (Upstash)", icon: SiRedis, category: "Database" },
  { _id: 22, name: "MongoDB", icon: SiMongodb, category: "Database" },
  { _id: 23, name: "SQL / MySQL", icon: SiMysql, category: "Database" },


  // Deployment / DevOps
  { _id: 24, name: "Render", icon: SiDocker, category: "Deployment" },
  // Languages
  { _id: 25, name: "C++", icon: SiC, category: "Languages" },
  { _id: 26, name: "Python", icon: SiPython, category: "Languages" },

  // Machine Learning / Data

  { _id: 27, name: "Scikit-learn", icon: SiScikitlearn, category: "ML" },
  { _id: 28, name: "TensorFlow / Keras", icon: SiTensorflow, category: "ML" },
  { _id: 29, name: "NumPy", icon: SiNumpy, category: "ML" },
  { _id: 30, name: "Pandas", icon: SiPandas, category: "ML" },
  { _id: 31, name: "Matplotlib", icon: MdInsertChart, category: "ML" },
  { _id: 32, name: "Seaborn", icon: MdAddchart, category: "ML" },


  // Charts
  { _id: 33, name: "react-native-chart-kit", icon: SiReact, category: "Charts" },
  { _id: 34, name: "react-native-svg", icon: SiSvg, category: "Charts" },


  // Tools / IDEs
  { _id: 35, name: "Git / GitHub", icon: SiGithub, category: "Tools" },
  { _id: 36, name: "VS Code", icon: SiVisualstudiocode, category: "Tools / IDEs",},
  { _id: 37, name: "Pycharm", icon: SiPycharm, category: "Tools / IDEs",},
  { _id: 38, name: "Jupyter Notebook", icon: SiJupyter, category: "Tools / IDEs",},

];
