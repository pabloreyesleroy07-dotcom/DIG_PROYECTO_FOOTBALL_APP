# Documentación Técnica del Proyecto

## 2. Arquitectura del Sistema y Tecnologías

El software respeta la segregación de responsabilidades mediante componentes independientes:

1. **Núcleo de Datos (Backend Python):** 
   - Script `football.py`. Es el cerebro del scraping de datos y la minería.
   - Utiliza la librería de red `requests` para contactar con proveedores DataaaS (Data as a Service) ubicados en la nube (`v3.football.api-sports.io`), sorteando los bloqueos por tasa de refresco (`rate limits`) mediante cronometrajes exactos de subprocesos (`time.sleep()`).
2. **Interfaz Gráfica / Dashboard (Flask):** 
   - El script `app.py` orquesta un servidor local (Localhost REST API).
   - Flask convierte tu computadora en un entorno capaz de renderizar Front-end (HTML5 / CSS3 responsivo) sirviendo datos crudos desde JSONs al navegador del analista.
3. **Persistencia Local Segura (NoSQL - Key/Value):**
   - No utiliza bases de datos de hardware relacional (MySQL). Se apoya en micro-transacciones físicas de ficheros `.json` (`predicciones.json`, `apuestas.json`) permitiendo al usuario una migración en frío: todo tu historial de operaciones pesa unos pocos kilobytes y puede enviarse por correo electrónico o comprimirse.
4. **Módulos de Control de Calidad y Testing (QA):**
   - El proyecto goza de una base estricta de pruebas para que el desarrollador pueda auditar la API externamente sin sobrecargar el servidor Flask.
   - Cuenta con scripts como `test_check.py` y `test_api_corners.py` encargados de testear aisladamente la veracidad técnica de los datos de "Córners" antes de lanzarlos a la producción principal, asegurando un QA (Quality Assurance) robusto frente a caídas temporales del proveedor API.
   - Implementa módulos inyectores automatizados (`patch_html.py`) capaces de alterar la interfaz gráfica `index.html` para incorporar utilidades nuevas (ej. Importador de Histórico) sin afectar al estado de ejecución en vivo.

---

## 3. Manual de Instalación y Despliegue

La premisa del proyecto exige accesibilidad universal sin la necesidad de tener un ingeniero instalando servidores gigantes en la máquina destino. A continuación los manuales para ambos ecosistemas.

### 3.1. Despliegue directo en Windows
El proyecto está pensado para funcionar de forma completamente autónoma (Plug-and-Play) en cualquier ordenador con Windows gracias a sus scripts de **auto-despliegue**.

1. **La Magia del Doble Clic:** Navega hasta la carpeta del proyecto (o tu versión *Analizador_Pendrive*) y localiza el archivo **`INICIAR_WINDOWS.bat`**. Haz doble clic sobre él.
2. **Auto-Instalación Silenciosa (Python y Librerías):** No necesitas saber programar ni instalar nada previo. El script `.bat` realizará una auditoría del sistema:
   - Si detecta que no tienes **Python** instalado en tu PC, se conectará a la web oficial de Python, descargará el paquete y **lo instalará por ti de forma automática y oculta** (añadiéndolo al PATH de sistema sin que veas instaladores).
   - Inmediatamente después, auditará las librerías necesarias (`Flask` o `requests`) y las descargará velozmente en segundo plano.
3. **Arranque Transparente:** Por último, ejecutará el servidor internamente de forma invisible (apoyado mediante código VBScript) y, al cabo de 2 segundos, **abrirá por sí solo tu Navegador Web** local en `http://127.0.0.1:5000`. ¡Ya estás dentro del Panel de Análisis!

### 3.2. Despliegue Portable (Modos "Pendrive" e Invisibilidad .exe)
Pensando en entornos corporativos o analistas viajeros, el código trae *Herramientas de Compilación Avanzadas*:
- **`Generar_EXE_Windows.bat`:** Script automatizado que empaqueta todo el framework Flask, las plantillas HTML y el núcleo de Python en un **ÚNICO ARCHIVO `AnalizadorFutbol_Windows.exe`** valiéndose de PyInstaller. Este ejecutable permite llevarse el software completo en un USB y abrirlo en cualquier ordenador del mundo aunque este no tenga Python instalado.
- **`AnalizadorFutbol_Oculto.vbs`:** Lanza el script eludiendo la ventana negra de la terminal de comandos de Windows (Modo Silent), abriendo estrictamente el navegador y creando una experiencia de Usuario Inmaculada libre de matrices de depuración por consola.

### 3.3. Despliegue para Ubuntu / Linux / Sistemas UNIX
El bot también es un ente auto-gestionado en ecosistemas de código abierto, adaptándose inteligentemente a la distribución que utilices:

1. **Ejecución del Script Auto-Gestor:** Abre la terminal, navega a la carpeta principal y dota de permisos de ejecución al instalador SH:
   ```bash
   chmod +x INICIAR_LINUX.sh
   ./INICIAR_LINUX.sh
   ```
2. **Detección Dinámica de Kernel (Apt/Dnf/Pacman):** No necesitas adivinar si debes correr un manual `sudo apt install`. El mágico archivo `.sh` investiga tu sistema:
   - Identifica instantáneamente si estás sobre *Debian/Ubuntu* (Apt), *RedHat/Fedora* (Dnf), *CentOS* (Yum) o *Arch Linux* (Pacman). 
   - Utiliza automáticamente tu administrador nativo de paquetes para inyectar Python 3 y `pip3` de raíz si tu ordenador carecía del entorno.
   - Resuelve conflictos cruzados y provee los módulos `Flask` y `requests` de forma infalible (sorteando barreras estrictas como *--break-system-packages*).
3. **Acceso Local:** Tras auto-configurarse todo al vuelo en red invisible, el host quedará vivo en el puerto local; tú sólo deberás entrar a tu explorador web de confianza y navegar a `http://127.0.0.1:5000`.

---

## 4. Guía Interactiva de Uso

La interfaz Web de usuario (GUI) posee 3 partes clave diseñadas para la Operativa (OT).

### Paso 1: Generación y Rastreo de Anomalías
- Pulsa sobre **"Analizar Hoy"** (o "Analizar Mañana") en la parte superior del Portal Web.
- **Acción Oculta:** Durante 3 a 15 segundos los botones quedarán bloqueados; el bot está filtrando aproximadamente 100 eventos de ligas rusas, alemanas, inglesas, etc. Busca únicamente anomalías (Ej: Un equipo que lleva 5 jornadas promediando más saques de portería y tiros de la media matemática estricta).
- Una vez termine, una Alerta emergente te indicará el éxito de la Operación y la lista de días analizados abajo se iluminará con una nueva fecha.

### Paso 2: Lectura Financiera y Análisis de Valor
- Haz clic sobre la "Fecha" (Por ejemplo, el fichero *Reporte_2026-03-03.txt*) en tu historial de análisis del panel inferior.
- Un visualizador renderizará de manera limpia qué partidos poseen **"ALTA CONFIANZA 🟢"** y el porqué exhaustivo del razonamiento desglosado.

### Paso 3: Dashboard de Aciertos y Registro "Bet Slip"
- **Inteligencia Retrospectiva:** La barra superior visual (Títulos azules y dorados) es el cerebro histórico. Cada vez que abras el programa, rastreará su API para saber *qué ocurrió en la realidad* con los pronósticos que te lanzó el día anterior. Actualizará el **Total Won (Aciertos)** y **Total Hit Rate (%)** de tus inversiones de forma automática.
- **Bet Slip Integrado:** Tienes una calculadora económica integrada. Si decides abrir una operación basándote en un "Ambos Marcan" del bot, la aplicación te permite agendar "Cuánto dinero metiste" y te hace una sumatoria global de Rentabilidad Final Neta (*Net Profit*) entre "inversiones ganadas" frente a "inversiones perdidas", controlando todo el *Bankroll*.

### Paso 4: El Optimizador Matemático de Lógica Combinatoria
- En el panel derecho de la interfaz de usuario reside oculto el **Optimizador Matemático**. Una función Javascript avanzada basada conceptualmente en `test_grouping.js`.
- Este sistema algorítmico captura todas tus apuestas pendientes, las ordena según sus "cuotas o peso probabilístico" y las balancea automáticamente creando **3 combinadas (grupos)** perfectas basadas en unidades fijas de inversión de 3.5€.
- Esta profunda ingeniería de Frontend logra que la interfaz web calcule de inmediato cuál sería tu Retorno de Beneficio Neto (Net Profit) si aciertas solo dos de esos tres grupos generados, eximiendo al inversor de realizar ninguna fórmula de Excel manual a la hora de estructurar riesgos.
