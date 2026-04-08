// global.d.ts
import React from "react";
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "lord-icon": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement 
      > & {
        src?: string;
        trigger?: string;
        stroke?: string;
        colors?: string;
      };
    }
  }
}

declare module "*.css";