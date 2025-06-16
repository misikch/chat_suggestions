import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Divider,
  TextField,
  Grid,
  Container
} from '@mui/material';
import { Phone, Message } from '@mui/icons-material';
import ImageCarousel from './ImageCarousel';
import SellerQuestions from './SellerQuestions';

// Данные автомобилей
const carData = [
  {
    id: 1,
    brand: 'Mercedes-Benz GL-Class (X166)',
    specs: {
      'Двигатель': '3.0 дизельный, 249 л. с.',
      'Коробка передач': 'Автоматическая',
      'Привод': 'Полный',
      'Год выпуска': '2014',
      'Состояние': 'Б/у'
    },
    description: 'Продаю Mercedes-Benz GL-Class в отличном состоянии. Автомобиль был куплен в этом году, все документы в порядке. Мощный дизельный двигатель обеспечивает отличную динамику и экономичность. Полный привод позволяет уверенно чувствовать себя в любых дорожных условиях.',
    images: ['1/image.png', '1/image2.png', '1/image3.png']
  },
  {
    id: 2,
    brand: 'Volkswagen Jetta VI',
    specs: {
      'Двигатель': '1.6 бензиновый, 105 л. с.',
      'Коробка передач': 'Автоматическая',
      'Привод': 'Передний',
      'Год выпуска': '2013',
      'Состояние': 'Б/у'
    },
    description: 'Надежный Volkswagen Jetta в хорошем техническом состоянии. Экономичный бензиновый двигатель, удобная автоматическая коробка передач. Автомобиль был куплен в 2024 году, проведено полное техническое обслуживание. Идеальный вариант для городской езды.',
    images: ['2/image.png', '2/image2.png', '2/image3.png']
  },
  {
    id: 3,
    brand: 'KIA Sorento (4G)',
    specs: {
      'Двигатель': '2.5 бензиновый, 179 л. с.',
      'Коробка передач': 'Автоматическая',
      'Привод': 'Полный',
      'Год выпуска': '2022',
      'Состояние': 'Б/у'
    },
    description: 'Современный KIA Sorento последнего поколения. Мощный и надежный двигатель, современная система полного привода. Автомобиль 2022 года выпуска, куплен в 2024 году. Отличное состояние, все системы работают исправно. Просторный салон и большой багажник.',
    images: ['3/image.png', '3/image2.png', '3/image3.png']
  }
];

const ProductCard = () => {
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    // Выбираем случайный автомобиль при загрузке
    const randomIndex = Math.floor(Math.random() * carData.length);
    setSelectedCar(carData[randomIndex]);
  }, []);

  if (!selectedCar) {
    return <div>Загрузка...</div>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={0} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Карусель изображений */}
          <ImageCarousel images={selectedCar.images} />
          
          {/* Кнопки действий */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Phone />}
              sx={{
                backgroundColor: 'rgb(2, 209, 92)',
                color: 'white',
                flex: 1,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgb(2, 189, 82)',
                }
              }}
            >
              Позвонить
            </Button>
            <Button
              variant="contained"
              startIcon={<Message />}
              sx={{
                backgroundColor: 'rgb(0, 170, 255)',
                color: 'white',
                flex: 1,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgb(0, 150, 235)',
                }
              }}
            >
              Написать
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Характеристики */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Характеристики
            </Typography>
            {Object.entries(selectedCar.specs).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {key}:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Описание */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Описание
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {selectedCar.description}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Блок вопросов продавцу */}
          <SellerQuestions />
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProductCard; 