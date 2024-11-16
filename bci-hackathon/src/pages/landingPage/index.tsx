import React from 'react';
import { 
  AppBar, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Grid, 
  Typography, 
  useTheme, 
  Toolbar 
} from '@mui/material';
import { 
  Psychology, 
  BiometricOutlined, 
  HealthAndSafety, 
  Engineering 
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const LandingPage: React.FC = () => {
  const theme = useTheme();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Box>
      <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(20px)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BCI Hackathon
          </Typography>
          <Button color="inherit">O projekcie</Button>
          <Button color="inherit">Technologia</Button>
          <Button color="inherit">Kontakt</Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          pt: 12
        }}
      >
        <Container>
          <MotionBox
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h2" 
              component="h1" 
              color="white" 
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 4 }}
            >
              Przyszłość Interakcji Mózg-Komputer
            </Typography>

            <Typography 
              variant="h5" 
              color="white" 
              sx={{ mb: 6, maxWidth: '800px' }}
            >
              Odkryj możliwości bezpośredniej komunikacji między umysłem a technologią.
              Dołącz do rewolucji w dziedzinie interfejsów mózg-komputer.
            </Typography>

            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
            >
              Rozpocznij Projekt
            </Button>
          </MotionBox>

          <Grid container spacing={4} sx={{ mt: 8 }}>
            {[
              {
                icon: <Psychology fontSize="large" />,
                title: 'Innowacyjna Technologia',
                description: 'Wykorzystaj najnowsze osiągnięcia w dziedzinie interfejsów mózg-komputer.'
              },
              {
                icon: <BiometricOutlined fontSize="large" />,
                title: 'Precyzyjne Pomiary',
                description: 'Zaawansowane algorytmy przetwarzania sygnałów neurologicznych.'
              },
              {
                icon: <HealthAndSafety fontSize="large" />,
                title: 'Zastosowania Medyczne',
                description: 'Wspieramy rozwój rozwiązań dla osób z niepełnosprawnościami.'
              },
              {
                icon: <Engineering fontSize="large" />,
                title: 'Otwarte API',
                description: 'Łatwa integracja z istniejącymi systemami i aplikacjami.'
              }
            ].map((item, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <MotionBox
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <CardContent>
                      <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                        {item.icon}
                      </Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
