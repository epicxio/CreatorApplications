import { ComponentType } from 'react';

declare module 'framer-motion' {
  export interface AnimatePresenceProps {
    children?: React.ReactNode;
    mode?: 'sync' | 'wait' | 'popLayout';
    initial?: boolean;
    onExitComplete?: () => void;
    custom?: any;
    presenceAffectsLayout?: boolean;
  }

  export const AnimatePresence: ComponentType<AnimatePresenceProps>;
} 