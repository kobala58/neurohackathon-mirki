import React, { memo } from "react";
import cx from "clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const PageContainer = memo(({ children, className }: Props) => {
  return (
    <div
      className={cx(
        "mx-auto px-4 sm:max-w-4xl md:max-w-6xl max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
});
