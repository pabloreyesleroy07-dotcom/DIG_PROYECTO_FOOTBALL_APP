# 🧠 Football Stats Analyzer - Developer Documentation (Wiki)

Esta sección de la Wiki está destinada a ingenieros de software e implementadores que deseen comprender la arquitectura subyacente o realizar integraciones complejas sobre el sistema.

## Arquitectura General

El proyecto se sustenta en un entorno **Cliente-Servidor (SPA)** con un *backend* muy focalizado en tareas asíncronas de minería de datos, desarrollado bajo **Python 3.11** y **Flask**. Todo el motor se divide lógicamente en:

- `run.py`: Punto de entrada del servidor WSGI. Detecta entornos de despliegue dinásticos leyendo variables como el `PORT`.
- `api/routes.py`: El router Flask o centro de mando que captura las invocaciones HTTP RESTful del Frontend (`/api/generate`, `/api/dashboard`, etc.).
- `core/engine_football.py`: El corazón matemático del programa. Consiste en las definiciones de minería de datos pura y la lógica asíncrona sobre bibliotecas de I/O de Python.
- Frontend (`/templates/index.html` y `/static/`): Proveen una interfaz gráfica interactiva, la cual realiza continuas llamadas AJAX utilizando `fetch()` hacia las bases de datos generadas por el motor.

## Control de Bases de Datos (`data/`)
En lugar de depender de gigantescos servidores SQL, todo el tracking de inteligencia y valor se guarda en archivos de almacenamiento plano dentro de `data/db/`:
- `data/db/predicciones.json`: Historial de predicciones y resultados verificados.
- `data/db/apuestas.json`: Registro de apuestas gestionadas desde la interfaz.
- `data/reports/`: Directorio donde se almacenan los reportes generados (formato `Reporte_YYYY-MM-DD.txt`).

El backend iterativamente abre estos archivos y contrasta si los eventos (IDs de partido de apuestas anteriores) "Han ocurrido", recalculando con fórmulas matemáticas el *Hit Rate* o la tasa de éxito al vuelo, escribiéndolo después de forma segura.

## Extracción de Datos (API-Sports)
El motor se comunica activamente mediante peticiones GET altamente agresivas (decenas de llamadas simultáneas) a la interfaz pública de API-Sports:
1. **Endpoint Fixtures**: Rescata la id del partido en el día en curso en base a diferentes zonas horarias mundiales.
2. **Endpoint Statistics/Odds**: Lee los promedios previos de cada equipo por separado.
   
👉 **Limitaciones Técnicas (Rate Limits):** Hay que mantener extremo cuidado con las credenciales `x-apisports-key` en `config.py`. En modo gratuito se cuenta con 100 llamadas por día, las cuales pueden agotarse en escanear únicamente 2 ligas mediante multi-hilos si no logras optimizar en caché local la invocación. *(Para evitar penalizaciones, implementa funciones `sleep` asíncronas si es necesario).*

## Seguridad del Ejecutable (`pyarmor`)
Debido a regulaciones y potencialidades económicas, el proyecto cuenta con un entorno de *build seguro* (`build_seguro/` y `.spec` files). Antes de distribuir el archivo compilado con tecnología PyInstaller para Linux/Windows, ofuscamos drásticamente el código crítico mediante bibliotecas de ocultación binara, evitando *Reverse Engineering* al núcleo de toma de decisiones o el secuestro de APIS privadas.

## Contribuidores
Por favor, lee estrictamente el documento centralizado en la raíz llamado `CONTRIBUTING.md` para conocer nuestras reglas éticas y estándares del código antes de manipular el árbol principal y realizar *Pull Requests*.
