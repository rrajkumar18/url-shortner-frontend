"use client";

import { motion, AnimatePresence } from "motion/react";

interface AnimatedNumberProps {
    value: number;
}

export default function AnimateNumber({value}:AnimatedNumberProps) {
    return (
        <span className="inline-flex overflow-hidden align-bottom">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span 
                    key={value} 
                    initial={{y:"100%"}}
                    animate={{y:0}}
                    exit={{y:"-100%"}}
                    transition={{
                        duration: 0.3,
                        ease: "easeInOut"
                    }}
                    className="inline-block"
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}