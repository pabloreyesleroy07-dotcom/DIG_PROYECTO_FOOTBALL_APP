# Evaluación Estratégica y de Negocio (Football Stats Analyzer Pro)

Este documento responde de forma pormenorizada a los criterios estratégicos de evaluación (6a - 6h) contextualizando el impacto empresarial, operativo y tecnológico del software desarrollado.

---

### Criterio 6a) Objetivos estratégicos
**¿Qué objetivos estratégicos específicos de la empresa aborda tu software?**
Aborda el objetivo estratégico principal de maximizar el Retorno de Inversión (ROI) en el mercado bursátil deportivo mediante la toma de decisiones fundamentada en datos duros, eliminando el "gut feeling" (instinto) o sesgo subjetivo inherente al deporte. Al automatizar la detección de "Value Bets" o anomalías, el modelo de negocio pasa de una evaluación heurística lenta a un análisis predictivo altamente escalable.

**¿Cómo se alinea el software con la estrategia general de digitalización?**
Se alinea garantizando la transición del trabajo manual y analógico (analistas revisando casas de apuestas y rastreando hojas de Excel dispersas) a un ecosistema centralizado digital. Toda la ingesta de datos a través de APIs de terceros se unifica en una experiencia única y reactiva tipo Dashboard interactivo, encajando en los principios de Digitalización Operativa (OT).

---

### Criterio 6b) Áreas de negocio y comunicaciones
**¿Qué áreas de la empresa (producción, negocio, comunicaciones) se ven más beneficiadas con tu software?**
El Área de Negocio (Analistas de Inversión y Data Scientists) son los beneficiarios inmediatos ya que se les dota de un motor automático que evalúa cientos de parámetros. A su vez, el Área de Producción se beneficia porque puede programar análisis desatendidos cada amanecer, lo que estandariza la cadena de investigación antes de invertir.

**¿Qué impacto operativo esperas en las operaciones diarias?**
Una reducción de los tiempos de investigación superior al 95%. Lo que antes tomaba a un grupo de humanos 10-14 minutos de cruce de métricas liga por liga al día, se transforma en un flujo asincrónico (vía `aiohttp`) que vomita evaluaciones de miles de partidos procesando la API global en apenas 2.5 segundos de carga de la web.

---

### Criterio 6c) Áreas susceptibles de digitalización
**¿Qué áreas de la empresa son más susceptibles de ser digitalizadas con tu software?**
La auditoría de métricas previas de equipos (estadísticas de *Shots on Target*, *Córners*, Posesión, H2H y *Standings*). Estos elementos son pura ingesta e interpretación estadística y, por lo tanto, no aportan nada en un proceso humano manual. Son datos planos extremadamente digitalizables.

**¿Cómo mejorará la digitalización las operaciones en esas áreas?**
Asegurando un análisis exhaustivo *sin fallos matemáticos humanos*. Al aplicar una "línea base" o Benchmark de liga que evalúa rígidamente si un evento está ocurriendo más del doble que la media esperada (`x > benchmark * 2`), garantizamos que ninguna oportunidad oculta pase inadvertida bajo el radar debido a la fatiga del operario.

---

### Criterio 6d) Encaje de áreas digitalizadas (AD)
**¿Cómo interactúan las áreas digitalizadas con las no digitalizadas?**
El software digitalizado se dedica estrictamente a localizar y clasificar anomalías con su sistema tipo "Semáforo" ("High Confidence", "Low Confidence"). El área NO digitalizada está formada por los *Traders* o Ejecutivos Financieros que leen esos informes procesados localmente en `Reporte_YYYY-MM-DD.txt` o en el panel Flask local: el software alerta, pero es el individuo *no digitalizado* quien realiza la revisión de riesgos finales y materializa monetariamente la apuesta.

**¿Qué soluciones o mejoras propondrías para integrar estas áreas?**
1. Crear *Webhooks* o conectividad por Bots (Telegram/Discord) para que el operario no tenga que estar actualizando la pantalla del explorador manualmente, sino que se le "empuje" o notifique digitalmente a su smartphone.
2. Integrar API de *Websockets* directos de casas de apuestas para que la inversión se realice de forma *Auto-Bet* (total digitalización sin presencia humana), lo que ya cubríamos como futuros desarrollos en la guía del repositorio (`CONTRIBUTING.md`).

---

### Criterio 6e) Necesidades presentes y futuras
**¿Qué necesidades actuales de la empresa resuelve tu software?**
Actualmente, soluciona tres necesidades dolorosas: 
1) La lentitud e ineficiencia de procesar grandes repositorios (APIs de datos deportivos masivos). 
2) Superar las severas restricciones asíncronas de llamadas por minuto ("API Rate-limits") mediante un motor semáforo controlado.
3) La protección del código frente a analistas que intentarían robar o adivinar el algoritmo heurístico de inversión.

---

### Criterio 6f) Relación con tecnologías
**¿Qué tecnologías habilitadoras has empleado y cómo impactan en las áreas de la empresa?**
- **Python y AsyncIO/aiohttp:** Permite paralelizar las peticiones bloqueantes de red IO, impactando radicalmente en el recorte de tiempos del Analista.  
- **Arquitectura REST (Flask SPA):** Desacopla la vista (HTML/Vanilla JS CSS) de la lógica interna.
- **PyInstaller y PyArmor:** Ejecutables ofuscados criptográficamente.

**¿Qué beneficios específicos aporta la implantación de estas tecnologías?**
Flexibilidad y seguridad militar corporativa. Al crear archivos `.bin`/`.exe` blindados mediante PyArmor en lugar de distribuir el código en .py normal, controlamos que solo los operarios elegidos por la cúpula directiva puedan lanzar análisis sin entender ni robar la fórmula secreta del éxito matemático.

---

### Criterio 6g) Brechas de seguridad
**¿Qué posibles brechas de seguridad podrían surgir al implementar tu software?**
1. **Robo de la API_KEY** o accesos a los proveedores de la nube costosos. 
2. **Reverse Engineering (Ingeniería Inversa)** de las variables matemáticas para montar competencia paralela (brecha de propiedad intelectual).
3. **Escalada de Privilegios Local** en los ordenadores de la oficina.

**¿Qué medidas concretas propondrías para mitigarlas?**
1. Ya hemos evitado escribir la llave maestra en texto plano (`API_KEY`) utilizando decodificación por **Criptografía XOR Dinámica** como se ve en `config.py` (los analistas estáticos no pueden entender la clave).
2. Se ha implementado **PyArmor** para ofuscación y virtualización del Bytecode nativo de Python en todo el backend por línea de comandos automatizada (`dist/`).
3. Estricto **Sanitizado de Parámetros Input**: `dia = data.get("dia")` obliga a una validación forzosa del Regex `YYYY-MM-DD` para evitar cualquier inyección malintencionada en sistemas locales o bases Linux.

---

### Criterio 6h) Tratamiento de datos y análisis
**¿Cómo se gestionan los datos en tu software y qué metodologías utilizas?**
Utilizamos la metodología **NoSQL Local / Flat-File Database**. Se descarta la lentitud de servidores relacionales MySQL para apostar por diccionarios ultra veloces cargados temporalmente en `data/predicciones.json`. 
Se aplica una retro-computación: El software tiene la capacidad diaria y asíncrona de evaluarse a sí mismo consultando si su "predicción interna" almacenada ayer acertó hoy, generando en bucle y dinámicamente tu `Hit-Rate` (Porcentaje de exactitud).

**¿Qué haces para garantizar la calidad y consistencia de los datos?**
Todo el flujo de procesamiento descarta la basura de datos rotos de forma elegante: si un equipo de segunda B no dispone de estadísticas contables, métodos como `s['value'] is not None else 0` salvaguardan un fallo en cadena y descartan las posibles métricas anómalas (asignando ceros y bajando la calificación para que nuestra herramienta asigne su estado "LOW" por defecto y nunca un falso positivo "HIGH" inseguro). Las cachés en multi-nivel de memoria (`self.results_cache`) evitan corrupciones de peticiones idénticas de partidos inter-dependientes.
