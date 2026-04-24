# ⚽ Football Stats Analyzer Pro

## 🌟 Motivación del Proyecto
El mundo de las inversiones y el análisis deportivo suele estar dominado por la intuición y el tiempo gastado manualmente evaluando datos, lo que a menudo lleva a decisiones sesgadas o a la pérdida de oportunidades ocultas de alto valor. 

La motivación fundamental de **Football Stats Analyzer Pro** es **democratizar y automatizar el análisis avanzado de datos futbolísticos**. Hemos creado un motor de alto rendimiento que evalúa miles de parámetros estadísticos a escala global en cuestión de milisegundos. Esta herramienta busca "anomalías" y patrones matemáticos (value bets), transformando el tedioso análisis humano basado en hojas de cálculo en un sistema de un solo clic. Su arquitectura limpia, modular y asíncrona busca ofrecer resultados precisos en una interfaz totalmente accesible para cualquier perfil de usuario, garantizando el máximo rigor técnico en el backend.

---

## 🚀 Despliegue de la Aplicación (Para Todos los Públicos)

A continuación, indicamos los pasos paso a paso para poner en marcha la herramienta en tu propio ordenador. No hace falta experiencia previa si sigues las instrucciones.

### 🪟 Opción A: Despliegue en Windows (Desde el código fuente)
Para garantizar el mejor rendimiento en Windows, ejecutaremos la aplicación usando el código base en Python.

1. **Instalar Python:** Descarga e instala [Python 3.11 o superior](https://www.python.org/downloads/).  
   ⚠️ **¡IMPORTANTE!** Durante la instalación, fíjate en la primera pantalla y marca la casilla que dice **"Add Python to PATH"** *(Añadir Python al PATH de Windows)* antes de hacer clic en instalar.
2. **Descargar el Proyecto:** Descarga este repositorio (botón "Download ZIP") o clónalo, y extrae la carpeta en un directorio fácil de encontrar (por ejemplo, en Documentos, resultando en `C:\Users\TuUsuario\Documents\Football_Stats`).
3. **Abrir Símbolo del Sistema:** Pulsa la tecla de Windows, escribe `cmd` y presiona Enter.
4. **Navegar a la Carpeta:** Escribe el siguiente comando reemplazando con la ruta correspondiente y presiona Enter:
   ```cmd
   cd C:\Users\TuUsuario\Documents\Football_Stats
   ```
5. **Crear un Entorno Virtual:** Para no mezclar complementos en tu PC, crearemos un entorno seguro (y esperamos unos segundos):
   ```cmd
   python -m venv venv
   ```
6. **Activar el Entorno:** Ahora indicamos a Windows que lo utilice:
   ```cmd
   venv\Scripts\activate
   ```
   *(Verás que la línea ahora comienza con `(venv)`, ¡significa que funcionó!)*
7. **Instalar Dependencias:** Instalamos todas las librerías necesarias con un click:
   ```cmd
   pip install -r requirements.txt
   ```
8. **Inicia el Analizador:** Arranca la aplicación con este último comando:
   ```cmd
   python run.py
   ```
9. **¡Listo!** Abre tu navegador favorito (Chrome, Edge, Firefox) y escribe en la barra superior: **`http://127.0.0.1:5000`**

### 🐧 Opción B: Despliegue en Linux (Ubuntu, Debian, Mint...)
Para Linux, hemos preparado un binario pre-compilado dentro de este proyecto para facilitarte al máximo las cosas. Para arrancar fácilmente:

1. **Abrir Terminal:** Dirígete a la carpeta `Football_Stats` y abre una terminal pulsando clic derecho -> "Abrir terminal aquí".
2. **Dar permisos al Ejecutable:** Necesitamos autorizar el binario localizado en la carpeta interna `dist/`. Escribe:
   ```bash
   chmod +x dist/AnalizadorFutbol_Linux
   ```
3. **Arrancar el Analizador:** Lanza la aplicación mediante:
   ```bash
   ./dist/AnalizadorFutbol_Linux
   ```
4. **¡Listo!** Abre tu navegador web y dirígete a: **`http://127.0.0.1:5000`**

> 💡 **Alternativa (código fuente):** Si prefieres ejecutar directamente desde el código fuente en lugar del binario, repite los pasos de Windows adaptando el paso 6 a `source venv/bin/activate` y arranca con `python3 run.py`.

---

## 🛠️ Ejemplos de Uso

**Ejemplo 1: Escaneo y Predicción de Anomalías Diarias**
1. Abre la aplicación en tu navegador web.
2. En el **Dashboard** principal, utiliza el selector de fecha ("date-picker") y elige el día de hoy, y posteriormente pincha en el botón primario de inicio de escaneo.
3. El motor (gracias a la tecnología asíncrona) evaluará ligas de todo el mundo al mismo tiempo en cuestión de segundos.
4. Revisa los paneles informativos dinámicos, que te señalarán de forma filtrada escenarios como:
   > `[!!!] ALERTA DE VALOR: El Equipo Local promedia 75% o más en Córners Over 9.5. Cuota del mercado fuera de lugar (Anomalía).`

**Ejemplo 2: Exploración por Ligas Específicas**
1. Si no deseas mirar partidos de ligas secundarias o desconocidas, utiliza los filtros superiores del Dashboard.
2. Puedes marcar exclusivamente las "Big 5" (Premier League, La Liga, Serie A, etc.).
3. El reporte general te devolverá no solo un listado de partidos, sino un factor de *Confidence* (Nivel de Confianza Numérico) basado en los últimos encuentros estrictamente en casa para el Local, y de visitante para la visita. 

**Ejemplo 3: Extracción asíncrona de la API (Uso Profesional)**
Si desarrollas modelos de Machine Learning y requieres consultar las matemáticas detrás sin abrir el navegador, puedes atacar directamente al puerto habilitado accediendo de forma local por GET al endpoint provisto: `http://127.0.0.1:5000/api/v1/stats/...`.

---
## 📄 Detalles Adicionales
Consulta los detalles sobre los desarrolladores implicados en [CONTRIBUTING.md](CONTRIBUTING.md) (si existe), las licencias en [LICENSE](LICENSE) y el árbol de actualizaciones pasadas en [CHANGELOG.md](CHANGELOG.md).
