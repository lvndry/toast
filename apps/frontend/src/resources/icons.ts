import { IconType } from "react-icons";

import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlinePaperAirplane,
  HiOutlineRocketLaunch,
} from "react-icons/hi2";


export const iconLibrary: Record<string, IconType> = {
  rocket: HiOutlineRocketLaunch,
  plane: HiOutlinePaperAirplane,
  arrowLeft: HiOutlineArrowLeft,
  arrowRight: HiOutlineArrowRight,
};

export type IconLibrary = typeof iconLibrary;
export type IconName = keyof IconLibrary;
