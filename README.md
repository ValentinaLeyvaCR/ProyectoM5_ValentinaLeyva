# MCP Server GitHub Agent

El proyecto se basa en la creacion de un servidor MCP (Model Context Protocol) que se conecta con GitHub y permite automatizar operaciones en repositorios de GitHub desde lenguaje natural.

## Estructura del proyecto

```
src/
├── index.ts          
├── types.ts          
├── schemas/          
├── github/
│   ├── client.ts    
│   └── operations.ts 
├── errors/           
├── utils/
│   ├── logging.ts    
│   └── retry.ts      
└── tools/            

tests/                 
```

## Cómo ejecutar

```bash
git clone https://github.com/ValentinaLeyvaCR/ProyectoM5_ValentinaLeyva.git
npm install
cp .env.example .env
```

Completar `GITHUB_TOKEN` en el archivo `.env` con tu Personal Access Token de GitHub.

Para probar el proyecto completo conectado al agente de IA en Antigravity:

```bash
npm run build
```

(el comando del server en Antigravity tiene que ser `node dist/index.js`)

Para correr los tests:

```bash
npm run test
```

Para conectarlo a **Antigravity**, el comando del server tiene que ser `node dist/index.js` (después de correr `npm run build`). 

## Cómo usar el agente

Una vez conectado en Antigravity (MCP Servers → agregar `github-agent`), se le habla al agente en lenguaje natural desde el chat y él elige qué tool usar:

- "Crea un repositorio llamado ejemploM5 con la descripción 'Repositorio de ejemplo para el módulo 5'"
- "Muestra mis repositorios de GitHub"
- "Abre un issue en ejemploM5 que diga 'Configuracion del MCP Server'"
- "Haz una lista de los issues abiertos de ejemploM5"
- "Agrega un archivo README.md a ejemploM5 con el contenido '## MCP Server' y el mensaje de commit 'primer commit'"

No hace falta decirle el nombre del tool ni el formato exacto: el agente lee la descripción de cada uno y decide solo cuál invocar y con qué parámetros.
