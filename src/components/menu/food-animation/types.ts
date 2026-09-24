import type {FoodAnimationConfig} from '@/data/menu-animation-data';
import type {MotionValue} from 'motion/react';
export type SceneProps={config:FoodAnimationConfig;withCheese?:boolean;scrollDriven?:boolean;progress?:MotionValue<number>};
