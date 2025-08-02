import * as React from "react";
import './badge.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const classNames = [
    'badge',
    `variant-${variant}`,
    className
  ].filter(Boolean).join(' ');
  return (
    <div className={classNames} {...props} />
  );
}

export { Badge };