'use client';
import React from 'react';
import { Button, ButtonProps } from './button';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface CosmicButtonProps extends ButtonProps {
  loading?: boolean;
  icon?: React.ReactNode;
  loadingText?: string;
  successText?: string;
  success?: boolean;
  successIcon?: React.ReactNode;
  animate?: boolean;
}

const CosmicButton = React.forwardRef<HTMLButtonElement, CosmicButtonProps>(
  ({ 
    className, 
    variant = "cosmic", 
    size = "default", 
    children, 
    loading = false,
    icon,
    loadingText = "Loading...",
    successText,
    success = false,
    successIcon,
    animate = true,
    ...props 
  }, ref) => {
    const ButtonWrapper = animate ? motion.button : 'button';
    const animationProps = animate ? {
      whileHover: { scale: 1.05, boxShadow: "0px 0px 15px rgba(99, 102, 241, 0.6)" },
      whileTap: { scale: 0.95 },
    } : {};

    return (
      <ButtonWrapper
        {...animationProps}
        className={className}
        disabled={loading || success || props.disabled}
      >
        <Button
          ref={ref}
          variant={variant}
          size={size}
          {...props}
          className="flex items-center justify-center gap-2 min-w-[160px] relative"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{loadingText}</span>
            </>
          ) : success ? (
            <>
              {successIcon}
              <span>{successText || children}</span>
            </>
          ) : (
            <>
              {icon}
              {children}
            </>
          )}
        </Button>
      </ButtonWrapper>
    );
  }
);

CosmicButton.displayName = "CosmicButton";

export default CosmicButton;