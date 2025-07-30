import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { X } from "lucide-react";

interface AnimatedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  open,
  onOpenChange,
  children,
  className = "",
  showCloseButton = true
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useOutsideClick(ref, () => onOpenChange(false));

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-50"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            {showCloseButton && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="flex absolute top-4 right-4 lg:hidden items-center justify-center bg-white dark:bg-gray-800 rounded-full h-8 w-8 shadow-lg"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </motion.button>
            )}
            <motion.div
              ref={ref}
              initial={{ 
                opacity: 0,
                scale: 0.95,
                y: 20
              }}
              animate={{ 
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{ 
                opacity: 0,
                scale: 0.95,
                y: 20,
                transition: { duration: 0.15 }
              }}
              transition={{ 
                duration: 0.2,
                ease: "easeOut"
              }}
              className={`w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-background border border-border sm:rounded-3xl overflow-hidden shadow-2xl ${className}`}
            >
              {children}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
};