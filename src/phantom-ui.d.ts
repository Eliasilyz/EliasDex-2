import type { PhantomUiAttributes } from '@aejkatappaja/phantom-ui';
import type React from 'react';

type ExtendedPhantomUiAttributes = PhantomUiAttributes &
  React.HTMLAttributes<HTMLElement> & {
    class?: string;
  };

declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface IntrinsicElements {
      'phantom-ui': ExtendedPhantomUiAttributes;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'phantom-ui': ExtendedPhantomUiAttributes;
    }
  }
}
