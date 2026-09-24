import {menuItems} from './menu-data';
import {getMenuItemAnimation} from '@/lib/menu-animation-resolver';
/** Complete registry, generated from the verified menu rather than a second product list. */
export const menuVisualRegistry=Object.fromEntries(menuItems.map(item=>[item.id,getMenuItemAnimation(item)]));
