# 🤝 Guía de Contribución: Football Stats Analyzer Pro

¡Gracias por tu interés en colaborar con nuestro proyecto! Este analizador aspira a ser la mejor herramienta de inversión deportiva apoyada en matemáticas de la comunidad Open Source. Si eres programador, analista de datos, o simplemente tienes buenas ideas, adoraríamos contar contigo.

## 🚀 Cómo Contribuir

Hemos diseñado este flujo de trabajo para mantener el proyecto seguro y estable sin entorpecer los análisis asíncronos actuales:

1. **Haz un Fork del Proyecto** (Bifúrcalo hacia tu usuario).
2. **Clona tu repositorio localmente**:
   `git clone https://github.com/tu-usuario/Football_Stats.git`
3. **Crea tu Rama de Trabajo** (Branch):
   `git checkout -b fix/error-estadistico` o `git checkout -b feature/nuevo-scanner-tarjetas`
4. **Programa las Mejoras**: Asegúrate de seguir las directrices de estilo definidas abajo.
5. **Realiza los Commits Formales**:
   `git commit -m "Añadida mejora en el filtro asíncrono para incluir segundas partes"`
6. **Sube los cambios a tu rama** (Push):
   `git push origin feature/nuevo-scanner-tarjetas`
7. **Abre un Pull Request (PR)**: Explícanos detalladamente qué problema resuelve tu código y lo evaluaremos para fusionarlo en el núcleo principal (`main`).

---

## 📐 Directrices de Estilo
- **Python (PEP 8)**: Usa convenciones estándar de Python. Respeta el uso de nombres en minúscula con guion bajo (`snake_case`) para variables y funciones.
- **Asincronía**: El corazón del `Engine_Football` es de alto rendimiento (usando `aiohttp`). Evita programar funciones de red bloqueantes (`requests_sync` clásicos) dentro del loop principal.
- **Seguridad**: Nunca envíes `API_KEYS` o credenciales estáticas en tus "commits". Acuérdate de ignorarlas en tus archivos locales (idealmente usando `.env`).

---

## 🔮 Roadmap y Ampliaciones de Interés

Si buscas inspiración sobre cómo mejorar el programa, te dejamos nuestro listado oficial de "Ampliaciones de Interés". Estos puntos catapultarán al Football Stats Analyzer al nivel institucional:

### 1. Integración de Alertas Instantáneas (Bots)
Actualmente, el usuario debe escanear el "Dashboard" manualmente para ver las anomalías (`Value Bets`).
- *Objetivo:* Crear submódulos integrando la API de **Telegram** o **Discord** para que lance el pitido de alerta en el móvil del usuario al segundo exacto que se detecte una cuota desfavorable.

### 2. Machine Learning de Auto-Corrección
El archivo `predicciones.json` evalúa internamente el *Hit Rate* (ratio de acierto).
- *Objetivo:* Usar bibliotecas como `scikit-learn` o `TensorFlow` para que el propio analizador cambie su lógica asíncrona si detecta que sus "alertas de Córners" están fallando últimamente, creando un sistema autónomo de corrección matemática.

### 3. API Websocket de Cuotas de Casas de Apuestas (Live Odds)
El motor lee estadísticas previas y cuotas estáticas.
- *Objetivo:* Conectar el proyecto a puertos de datos que ofrezcan los movimientos del dinero en vivo en las diferentes casas (*Pinnacle, Bet365*).

### 4. Nuevos Filtros Secundarios 
Casi todas las simulaciones operan bajo "Goles", "Córners" y "Ambos Marcan".
- *Objetivo:* Implementar lectura de métricas exóticas valiosas: `Tarjetas (Cards)`, `Posesión (Ball Possession)`, y `Faltas / Tiros a Puerta`. 

¡Estamos deseando descubrir de lo que eres capaz! Si encuentras un fallo y no te atreves a solucionarlo por código, siéntete libre de abrir un *Issue* describiendo la situación meticulosamente.
