import * as React from "react";
import './button.css';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const classNames = [
      'button',
      `variant-${variant}`,
      `size-${size}`,
      className
    ].filter(Boolean).join(' ');

    return (
      <button
        className={classNames}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };