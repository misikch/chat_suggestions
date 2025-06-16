import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box
        sx={{
          width: 374,
          height: 328,
          borderRadius: '3px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#f5f5f5'
        }}
      >
        <img
          src={`/images/${images[currentIndex]}`}
          alt={`Car ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        
        {/* Стрелка влево */}
        {images.length > 1 && (
          <IconButton
            onClick={prevImage}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
              width: 40,
              height: 40,
            }}
          >
            <ArrowBackIos sx={{ fontSize: 18 }} />
          </IconButton>
        )}
        
        {/* Стрелка вправо */}
        {images.length > 1 && (
          <IconButton
            onClick={nextImage}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
              width: 40,
              height: 40,
            }}
          >
            <ArrowForwardIos sx={{ fontSize: 18 }} />
          </IconButton>
        )}
        
        {/* Индикаторы */}
        {images.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
            }}
          >
            {images.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ImageCarousel; 