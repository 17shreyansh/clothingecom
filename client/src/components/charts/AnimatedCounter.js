import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import './Charts.css';

const AnimatedCounter = ({ 
  value, 
  prefix = '', 
  suffix = '', 
  duration = 2, 
  decimals = 0,
  enableOnMount = false
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  useEffect(() => {
    if (enableOnMount) {
      setHasAnimated(true);
    }
  }, [enableOnMount]);

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView, hasAnimated]);

  return (
    <div ref={ref} className="animate-count">
      {hasAnimated ? (
        <CountUp
          start={0}
          end={value}
          duration={duration}
          separator=","
          decimals={decimals}
          decimal="."
          prefix={prefix}
          suffix={suffix}
        />
      ) : (
        <span>{prefix}0{suffix}</span>
      )}
    </div>
  );
};

export default AnimatedCounter;