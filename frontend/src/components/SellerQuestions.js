import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Grid, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { Edit, Close, Delete } from '@mui/icons-material';

// Системные шаблоны (всегда доступны)
const systemTemplates = [
  {
    id: 'system_1',
    buttonText: 'Еще продаете?',
    messageText: 'Здравствуйте! Еще продаете автомобиль?',
    isSystem: true
  },
  {
    id: 'system_2',
    buttonText: 'Торг уместен?',
    messageText: 'Здравствуйте! Скажите, торг уместен?',
    isSystem: true
  },
  {
    id: 'system_3',
    buttonText: 'Когда можно посмотреть?',
    messageText: 'Здравствуйте! Когда можно посмотреть автомобиль?',
    isSystem: true
  },
  {
    id: 'system_4',
    buttonText: 'Пришлете видео?',
    messageText: 'Здравствуйте! Можете показать на видео, как выглядит автомобиль?',
    isSystem: true
  }
];

const STORAGE_KEY = 'userQuestionTemplates';
const MAX_USER_TEMPLATES = 5;
const MAX_TITLE_LENGTH = 50;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const DEBOUNCE_DELAY = 1000; // 1 секунда

const SellerQuestions = () => {
  const [messageText, setMessageText] = useState('');
  const [userTemplates, setUserTemplates] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    buttonText: '',
    messageText: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedTemplates, setSelectedTemplates] = useState([]); // Выбранные шаблоны
  const [isLoading, setIsLoading] = useState(false); // Loader состояние
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Загрузка пользовательских шаблонов из localStorage при монтировании
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const templates = JSON.parse(saved);
        setUserTemplates(templates);
      } catch (error) {
        console.error('Ошибка загрузки шаблонов:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Сохранение пользовательских шаблонов в localStorage
  const saveUserTemplates = (templates) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    setUserTemplates(templates);
  };

  // Объединение системных и пользовательских шаблонов
  const allTemplates = [...systemTemplates, ...userTemplates];

  // Функция для отправки запроса на бэкенд
  const combineMessages = async (messages) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/chat/suggests/combine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.combined_message;
    } catch (error) {
      console.error('Ошибка при комбинировании сообщений:', error);
      // В случае ошибки возвращаем простое объединение
      return messages.join(' ');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced функция для отправки запроса
  const debouncedCombineMessages = useCallback((messages) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(async () => {
      const combined = await combineMessages(messages);
      setMessageText(combined);
    }, DEBOUNCE_DELAY);

    setDebounceTimer(timer);
  }, [debounceTimer]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleQuestionClick = (template) => {
    const isSelected = selectedTemplates.some(t => t.id === template.id);
    
    if (isSelected) {
      // Убираем шаблон из выбранных
      const newSelected = selectedTemplates.filter(t => t.id !== template.id);
      setSelectedTemplates(newSelected);
      
      if (newSelected.length === 0) {
        setMessageText('');
      } else if (newSelected.length === 1) {
        // Если остался один шаблон, просто вставляем его текст
        setMessageText(newSelected[0].messageText);
      } else {
        // Если больше одного, отправляем запрос на бэкенд
        const messages = newSelected.map(t => t.messageText);
        debouncedCombineMessages(messages);
      }
    } else {
      // Добавляем шаблон к выбранным
      const newSelected = [...selectedTemplates, template];
      setSelectedTemplates(newSelected);
      
      if (newSelected.length === 1) {
        // Один шаблон - просто вставляем текст
        setMessageText(template.messageText);
      } else {
        // Несколько шаблонов - отправляем запрос на бэкенд
        const messages = newSelected.map(t => t.messageText);
        debouncedCombineMessages(messages);
      }
    }
  };

  const handleSend = () => {
    if (messageText.trim()) {
      alert(`Сообщение отправлено: ${messageText}`);
      setMessageText('');
      setSelectedTemplates([]);
    }
  };

  const handleOpenDialog = () => {
    if (userTemplates.length >= MAX_USER_TEMPLATES) {
      alert(`Максимальное количество пользовательских шаблонов: ${MAX_USER_TEMPLATES}`);
      return;
    }
    setIsDialogOpen(true);
    setNewTemplate({ buttonText: '', messageText: '' });
    setErrors({});
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewTemplate({ buttonText: '', messageText: '' });
    setErrors({});
  };

  const validateTemplate = () => {
    const newErrors = {};
    
    if (!newTemplate.buttonText.trim()) {
      newErrors.buttonText = 'Заголовок обязателен';
    } else if (newTemplate.buttonText.length > MAX_TITLE_LENGTH) {
      newErrors.buttonText = `Максимальная длина заголовка: ${MAX_TITLE_LENGTH} символов`;
    }
    
    if (!newTemplate.messageText.trim()) {
      newErrors.messageText = 'Шаблон вопроса обязателен';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTemplate = () => {
    if (!validateTemplate()) {
      return;
    }

    const template = {
      id: `user_${Date.now()}`,
      buttonText: newTemplate.buttonText.trim(),
      messageText: newTemplate.messageText.trim(),
      isSystem: false
    };

    const updatedTemplates = [...userTemplates, template];
    saveUserTemplates(updatedTemplates);
    handleCloseDialog();
  };

  const handleDeleteTemplate = (templateId) => {
    const updatedTemplates = userTemplates.filter(t => t.id !== templateId);
    saveUserTemplates(updatedTemplates);
    // Также убираем из выбранных, если был выбран
    setSelectedTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Спросите у продавца
        </Typography>
        <Tooltip title="Создать шаблон">
          <IconButton 
            onClick={handleOpenDialog}
            disabled={userTemplates.length >= MAX_USER_TEMPLATES}
            sx={{ 
              color: userTemplates.length >= MAX_USER_TEMPLATES ? '#ccc' : '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              }
            }}
          >
            <Edit />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Loader или кнопки с шаблонными вопросами */}
      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 120,
          mb: 2 
        }}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ ml: 2, color: '#666' }}>
            Комбинируем сообщения...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {allTemplates.map((template) => {
            const isSelected = selectedTemplates.some(t => t.id === template.id);
            return (
              <Grid item xs={6} key={template.id}>
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() => handleQuestionClick(template)}
                    sx={{
                      width: '100%',
                      py: 1,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      borderColor: isSelected ? '#1976d2' : '#e0e0e0',
                      backgroundColor: isSelected ? '#1976d2' : 'transparent',
                      color: isSelected ? 'white' : '#666',
                      '&:hover': {
                        borderColor: '#1976d2',
                        backgroundColor: isSelected ? '#1565c0' : 'rgba(25, 118, 210, 0.04)',
                      }
                    }}
                  >
                    {template.buttonText}
                  </Button>
                  {!template.isSystem && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTemplate(template.id)}
                      sx={{
                        position: 'absolute',
                        right: -8,
                        top: -8,
                        backgroundColor: '#f44336',
                        color: 'white',
                        width: 20,
                        height: 20,
                        '&:hover': {
                          backgroundColor: '#d32f2f',
                        }
                      }}
                    >
                      <Close sx={{ fontSize: 12 }} />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
      
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
        disabled={!messageText.trim() || isLoading}
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

      {/* Popup окно для создания шаблона */}
      <Dialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Создать шаблон вопроса
          <IconButton onClick={handleCloseDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Заголовок"
            fullWidth
            margin="normal"
            value={newTemplate.buttonText}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, buttonText: e.target.value }))}
            error={!!errors.buttonText}
            helperText={errors.buttonText || `${newTemplate.buttonText.length}/${MAX_TITLE_LENGTH}`}
            inputProps={{ maxLength: MAX_TITLE_LENGTH }}
          />
          <TextField
            label="Шаблон вопроса"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={newTemplate.messageText}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, messageText: e.target.value }))}
            error={!!errors.messageText}
            helperText={errors.messageText}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Отмена
          </Button>
          <Button 
            onClick={handleSaveTemplate}
            variant="contained"
            disabled={!newTemplate.buttonText.trim() || !newTemplate.messageText.trim()}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerQuestions; 