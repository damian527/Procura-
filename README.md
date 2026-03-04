# ProcuraControl — SLA Tracker

Panel de control de analistas de procura con seguimiento de SLA e integración SINCO ERP.

## Cómo subir a Vercel (5 minutos)

### Opción A — Sin instalar nada (recomendada)

1. Ve a **github.com** e inicia sesión (o crea cuenta gratis)
2. Crea un repositorio nuevo llamado `procura-control`
3. Sube todos estos archivos al repositorio
4. Ve a **vercel.com** e inicia sesión con tu cuenta de GitHub
5. Haz clic en **"Add New Project"**
6. Selecciona el repositorio `procura-control`
7. Vercel detecta automáticamente que es React → haz clic en **Deploy**
8. En ~2 minutos tendrás un link tipo: `https://procura-control.vercel.app`

### Opción B — Con Vercel CLI

```bash
npm install -g vercel
cd procura-app
npm install
vercel
```

Sigue las instrucciones en pantalla. Al finalizar te da el link.

## Estructura del proyecto

```
procura-app/
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   └── App.js          ← App principal
├── package.json
└── vercel.json
```

## Funcionalidades

- ✅ Crear, editar y eliminar Requisiciones (RQ)
- ✅ Avanzar etapas con registro de observaciones
- ✅ Semáforo SLA en tiempo real por etapa
- ✅ Kanban por estado del proceso
- ✅ Panel de carga de trabajo por analista
- ✅ Integración visual con flujo SINCO ERP
- ✅ Log de actividad con timestamps
