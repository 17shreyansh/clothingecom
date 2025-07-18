import React, { useState, useRef } from 'react';
import styled from 'styled-components';

// Styled Components
const HeroWrapper = styled.section`
  min-height: 70vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: #ffffff;
  padding: 4rem 0;
  
  @media (max-width: 768px) {
    padding: 5rem 0 0 0;
    min-height: 50vh;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`;

const TextContent = styled.div`
  z-index: 2;
  
  @media (max-width: 768px) {
    order: 2;
  }
`;

const Title = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 800;
  margin-bottom: 1rem;
  color: #333;
  line-height: 1.1;
  
  .hero-title-primary {
    font-family: 'Playfair Display', serif;
  }
  
  .hero-title-secondary {
    font-family: 'Great Vibes', cursive;
  }
`;

const Subtitle = styled.h2`
  font-size: clamp(1rem, 2.5vw, 1.8rem);
  font-weight: 300;
  max-width: 600px;
  color: #666;
  margin-bottom: 0;
  line-height: 1.4;
`;

const SliderWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 500px;
  margin: 0 auto;
  perspective: 1000px;
  
  @media (max-width: 768px) {
    order: 1;
    height: 400px;
    max-width: 300px;
  }
`;

const SlideContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
`;

const Slide = styled.div`
  position: absolute;
  width: 280px;
  height: 400px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: grab;
  will-change: transform;
  
  &:active {
    cursor: grabbing;
  }
  
  ${props => {
    const index = props.$index;
    const active = props.$active;
    const total = props.$total;
    
    if (index === active) {
      return `
        transform: translateX(-50%) translateZ(50px) scale(1.05);
        left: 50%;
        z-index: 5;
        opacity: 1;
        filter: brightness(1.1);
      `;
    } else if (index === (active + 1) % total) {
      return `
        transform: translateX(-10%) translateZ(-80px) rotateY(-35deg) scale(0.85);
        left: 65%;
        z-index: 3;
        opacity: 0.8;
        filter: brightness(0.9);
      `;
    } else if (index === (active - 1 + total) % total) {
      return `
        transform: translateX(-90%) translateZ(-80px) rotateY(35deg) scale(0.85);
        left: 35%;
        z-index: 3;
        opacity: 0.8;
        filter: brightness(0.9);
      `;
    } else {
      return `
        transform: translateX(-50%) translateZ(-150px) scale(0.7);
        left: 50%;
        z-index: 1;
        opacity: 0.4;
        filter: brightness(0.7);
      `;
    }
  }}
  
  @media (max-width: 768px) {
    width: 220px;
    height: 320px;
  }
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;



const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
`;

const Dot = styled.button`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$active ? '#D4AF37' : 'rgba(0,0,0,0.3)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const HeroSection = ({ data }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef(null);
  const startX = useRef(0);
  const isDragging = useRef(false);
  
  const defaultImages = [
    'https://thenmozhidesigns.com/cdn/shop/files/091A9116.jpg?v=1724212541',
    'https://www.vastranand.in/cdn/shop/files/1_68502a91-0be7-4d4a-9b61-c32b60b10708.jpg?v=1743078757',
    'https://www.sairasboutique.net/cdn/shop/files/ShimmerPeacockBlackDesignerEmbroideredSilkWeddingPartyWearSaree-Saira_sBoutique_2_1024x1024.jpg?v=1725210195',
  ];
  
  const images = data?.sliderImages && data.sliderImages.length > 0 
    ? data.sliderImages.map(img => img.url || img) 
    : defaultImages;
    
  const heroTitle = data?.title || 'Bhuvi Creations';
  const heroSubtitle = data?.subtitle || 'Where Tradition Meets Elegance: Exquisite Indian Wear for Every Occasion.';

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % images.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + images.length) % images.length);
  
  const handleStart = (e) => {
    isDragging.current = true;
    startX.current = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
  };
  
  const handleEnd = (e) => {
    if (!isDragging.current) return;
    const endX = e.type === 'mouseup' ? e.clientX : e.changedTouches[0].clientX;
    const diff = startX.current - endX;
    
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
    isDragging.current = false;
  };

  return (
    <HeroWrapper>
      <Container>
        <ContentGrid>
          <TextContent>
            <Title>
              {data?.titleParts ? (
                <>
                  <span className={data.titleParts.primaryClass || "hero-title-primary"}>
                    {data.titleParts.primary || "Bhuvi"}
                  </span>{' '}
                  <span className={data.titleParts.secondaryClass || "hero-title-secondary"}>
                    {data.titleParts.secondary || "Creations"}
                  </span>
                </>
              ) : heroTitle === 'Bhuvi Creations' ? (
                <>
                  <span className="hero-title-primary">Bhuvi</span>{' '}
                  <span className="hero-title-secondary">Creations</span>
                </>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: heroTitle }} />
              )}
            </Title>
            <Subtitle>
              {heroSubtitle}
            </Subtitle>
          </TextContent>

          <SliderWrapper
            ref={sliderRef}
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
          >
            <SlideContainer>
              {images.map((image, index) => (
                <Slide
                  key={index}
                  $index={index}
                  $active={activeSlide}
                  $total={images.length}
                  onClick={() => setActiveSlide(index)}
                >
                  <SlideImage
                    src={image}
                    alt={`Collection ${index + 1}`}
                    draggable={false}
                  />
                </Slide>
              ))}
            </SlideContainer>
          </SliderWrapper>
        </ContentGrid>
      </Container>
    </HeroWrapper>
  );
};

export default HeroSection;