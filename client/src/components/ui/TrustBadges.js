import React from 'react';
import styled from 'styled-components';

const TrustSection = styled.section`
  padding: 2rem 0;
  background: #ffffff;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const BadgesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
`;

const BadgeCard = styled.div`
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }
`;

const BadgeIcon = styled.div`
  width: 35px;
  height: 35px;
  margin: 0 auto 0.8rem;
  background: #D4AF37;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const BadgeTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.3rem 0;
`;

const BadgeDesc = styled.p`
  font-size: 0.75rem;
  color: #666;
  margin: 0;
  line-height: 1.3;
`;

const getIconByType = (iconType) => {
  const icons = {
    secure: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
      </svg>
    ),
    shipping: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3,4A2,2 0 0,0 1,6V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V12L20,8H17V4M10,6L14,10L10,14V11H4V9H10M6,18.5A1.5,1.5 0 0,1 7.5,17A1.5,1.5 0 0,1 9,18.5A1.5,1.5 0 0,1 7.5,20A1.5,1.5 0 0,1 6,18.5M18,18.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 21,18.5A1.5,1.5 0 0,1 19.5,20A1.5,1.5 0 0,1 18,18.5Z"/>
      </svg>
    ),
    support: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A3,3 0 0,1 15,5V7H19A1,1 0 0,1 20,8V19A1,1 0 0,1 19,20H5A1,1 0 0,1 4,19V8A1,1 0 0,1 5,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4M6,9V18H18V9H6M8,11H16V13H8V11M8,15H13V17H8V15Z"/>
      </svg>
    ),
    quality: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
      </svg>
    ),
    rating: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
      </svg>
    ),
    returns: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10.08L23,10M1,21H5V9H1V21Z"/>
      </svg>
    )
  };
  return icons[iconType] || icons.secure;
};

const defaultBadges = [
  { title: 'Secure Payment', desc: '100% Safe & Secure', iconType: 'secure' },
  { title: 'Free Shipping', desc: 'On orders above ₹999', iconType: 'shipping' },
  { title: '24/7 Support', desc: 'Always here to help', iconType: 'support' },
  { title: 'Quality Assured', desc: 'Premium materials only', iconType: 'quality' },
  { title: '5 Star Rated', desc: 'Loved by customers', iconType: 'rating' },
  { title: 'Easy Returns', desc: '30-day return policy', iconType: 'returns' }
];

const TrustBadges = ({ data }) => {
  const badges = data?.badges || defaultBadges;
  
  return (
    <TrustSection>
      <Container>
        <BadgesGrid>
          {badges.map((badge, index) => (
            <BadgeCard key={badge.title || index}>
              <BadgeIcon>
                {getIconByType(badge.iconType)}
              </BadgeIcon>
              <BadgeTitle>{badge.title}</BadgeTitle>
              <BadgeDesc>{badge.desc}</BadgeDesc>
            </BadgeCard>
          ))}
        </BadgesGrid>
      </Container>
    </TrustSection>
  );
};

export default TrustBadges;