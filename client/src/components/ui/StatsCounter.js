import React from 'react';
import { motion } from 'framer-motion';
// Using Box, Typography, Container, Grid from @mui/material for layout and text
import { Box, Typography, Container, Grid } from '@mui/material';
// useInView hook from react-intersection-observer for scroll-based animations
import { InView } from 'react-intersection-observer';
// CountUp for animated number counting
import CountUp from 'react-countup';
// styled-components for custom CSS styling
import styled from 'styled-components';
// Material-UI Icons for visual representation of stats
import { TrendingUp, People, LocationOn, Star } from '@mui/icons-material';

// Styled component for the main section of the stats counter
const StatsSection = styled.section`
  // Gradient background for a modern, dark aesthetic
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  color: white; // Text color
  padding: 5rem 0; // Vertical padding
  position: relative; // Needed for the pseudo-element border
  width: 100%; // Ensure the section takes full width
  box-sizing: border-box; // Include padding and border in the element's total width and height

  // Top border with a gradient effect
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #D4AF37, transparent); // Gold-like gradient
  }
`;

// Styled component for individual stat cards
const StatCard = styled(motion.div)`
  text-align: center; // Center align content
  padding: 2rem 1rem; // Padding inside the card
  border-radius: 20px; // Rounded corners
  background: rgba(255,255,255,0.05); // Semi-transparent background
  backdrop-filter: blur(10px); // Frosted glass effect
  border: 1px solid rgba(255,255,255,0.1); // Subtle border
  transition: all 0.3s ease; // Smooth transitions for hover effects

  // Hover effects for interactivity
  &:hover {
    transform: translateY(-5px); // Lift card slightly
    background: rgba(255,255,255,0.08); // Slightly less transparent background
    box-shadow: 0 10px 30px rgba(212,175,55,0.2); // Gold-tinted shadow
  }

  // Styling for the icon within the card
  .icon {
    font-size: 3rem; // Large icon size
    color: #D4AF37; // Gold color
    margin-bottom: 1rem; // Space below the icon
  }

  // Styling for the number display
  .number {
    font-size: 3rem; // Large font size for numbers
    font-weight: 800; // Extra bold font weight
    background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); // Gold gradient for numbers
    -webkit-background-clip: text; // Clip background to text for gradient effect
    -webkit-text-fill-color: transparent; // Make text transparent to show background gradient
    background-clip: text;
    margin-bottom: 0.5rem; // Space below the number

    // Responsive font size for smaller screens
    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }

  // Styling for the label below the number
  .label {
    font-size: 1.1rem; // Font size for labels
    color: #e0e0e0; // Light grey color
    font-weight: 500; // Medium font weight
    letter-spacing: 0.5px; // Slight letter spacing
  }
`;

// Array of statistics data
const stats = [
  { number: 25000, suffix: '+', label: 'Happy Customers', icon: People },
  { number: 800, suffix: '+', label: 'Products', icon: TrendingUp },
  { number: 100, suffix: '+', label: 'Cities Served', icon: LocationOn },
  { number: 4.9, suffix: '/5', label: 'Customer Rating', icon: Star }
];

// Main React component for the Stats Counter
const StatsCounter = ({ title, subtitle, stats: customStats }) => {
  // Using state to track if component is in view
  const [inView, setInView] = React.useState(false);

  return (
    // The main section
    <InView threshold={0.3} triggerOnce onChange={(inView) => setInView(inView)}>
      {({ ref }) => (
        <StatsSection ref={ref}>
        {/* Motion div for animating the section title and subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} // Initial state (hidden, slightly below)
          animate={inView ? { opacity: 1, y: 0 } : {}} // Animate to visible when in view
          style={{ textAlign: 'center', marginBottom: '3rem' }} // Centered text with margin
        >
          {/* Section title */}
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
            {title || 'Our Journey in Numbers'}
          </Typography>
          {/* Section subtitle */}
          <Typography variant="h6" sx={{ color: '#ccc', maxWidth: '600px', mx: 'auto' }}>
            {subtitle || 'Building trust through quality and excellence'}
          </Typography>
        </motion.div>

        {/* Grid container for arranging individual stat cards */}
        <Grid container spacing={4} justifyContent="center" sx={{ width: '100%', mx: 'auto', px: 2 }}> {/* spacing={4} adds space between grid items */}
          {(customStats || stats).map((stat, index) => {
            // Dynamically get the icon component
            const IconComponent = stat.icon;
            return (
              // Grid item for each stat card
              // xs={6}: On extra small screens, each card takes 6 columns (2 cards per row)
              // md={3}: On medium screens and up, each card takes 3 columns (4 cards per row)
              <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                {/* StatCard component with Framer Motion animations */}
                <StatCard
                  initial={{ opacity: 0, y: 50 }} // Initial state (hidden, further below)
                  animate={inView ? { opacity: 1, y: 0 } : {}} // Animate to visible when in view
                  transition={{ delay: index * 0.15, duration: 0.6 }} // Staggered animation delay
                  whileHover={{ scale: 1.05 }} // Scale up slightly on hover
                >
                  {/* Render the icon */}
                  <IconComponent className="icon" />
                  <div className="number">
                    {/* Render CountUp animation only when the component is in view */}
                    {inView && (
                      <CountUp
                        end={stat.number} // Target number
                        duration={2.5} // Animation duration
                        suffix={stat.suffix} // Suffix (e.g., '+', '/5')
                        decimals={stat.suffix === '/5' ? 1 : 0} // Show one decimal for ratings
                      />
                    )}
                  </div>
                  <div className="label">{stat.label}</div>
                </StatCard>
              </Grid>
            );
          })}
        </Grid>
        </StatsSection>
      )}
    </InView>
  );
};

export default StatsCounter;
