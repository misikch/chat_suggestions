import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Grid } from '@mui/material';

const questionTemplates = [
  {
    buttonText: 'Еще продаете?',
    messageText: 'Здравствуйте! Еще продаете автомобиль?'
  },
  {
    buttonText: 'Торг уместен?',
    messageText: 'Здравствуйте! Скажите, торг уместен?'
  },
  {
    buttonText: 'Когда можно посмотреть?',
    messageText: 'Здравствуйте! Когда можно посмотреть автомобиль?'
  },
  {
    buttonText: 'Пришлете видео?',
    messageText: 'Здравствуйте! Можете показать на видео, как выглядит автомобиль?'
  }
];

const SellerQuestions = () => {
  const [messageText, setMessageText] = useState('');

  const handleQuestionClick = (template) => {
    setMessageText(template.messageText);
  };

  const handleSend = () => {
    if (messageText.trim()) {
      alert(`Сообщение отправлено: ${messageText}`);
      setMessageText('');
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Спросите у продавца
      </Typography>
      
      {/* Кнопки с шаблонными вопросами */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {questionTemplates.map((template, index) => (
          <Grid item xs={6} key={index}>
            <Button
              variant="outlined"
              onClick={() => handleQuestionClick(template)}
              sx={{
                width: '100%',
                py: 1,
                fontSize: '0.875rem',
                textTransform: 'none',
                borderColor: '#e0e0e0',
                color: '#666',
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                }
              }}
            >
              {template.buttonText}
            </Button>
          </Grid>
        ))}
      </Grid>
      
      {/* Текстовое поле */}
      <TextField
        multiline
        rows={3}
        fullWidth
        placeholder="Напишите ваш вопрос..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        sx={{ mb: 2 }}
        variant="outlined"
      />
      
      {/* Кнопка отправить */}
      <Button
        variant="contained"
        onClick={handleSend}
        disabled={!messageText.trim()}
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          py: 1.2,
          px: 4,
          '&:hover': {
            backgroundColor: '#1565c0',
          },
          '&:disabled': {
            backgroundColor: '#e0e0e0',
            color: '#9e9e9e',
          }
        }}
      >
        Отправить
      </Button>
    </Box>
  );
};

export default SellerQuestions; 