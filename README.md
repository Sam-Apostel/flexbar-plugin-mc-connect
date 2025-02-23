# Plugin Example

Example plugin for FlexDesigner.

## Installation

### **Prerequisites**

- Node.js 18 or later  
- FlexDesigner v1.0.0 or later  
- A Flexbar device  
- A code editor (we recommend VS Code)  

> We recommend using `nvm` to install and manage your Node.js environment.  
>  
> [nvm for MacOS](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)  
>  
> [nvm for Windows](https://github.com/coreybutler/nvm-windows/releases)  

- Install FlexCLI  

  ```
  npm install -g @eniac/flexcli
  ```

### Clone & Setup

```
git clone https://github.com/ENIAC-Tech/Plugin-Example.git
cd Plugin-Example
npm install
```

## Debug

```
npm run dev
```

## Build & Pack

```
npm run build
npm run plugin:pack --path com.eniac.example.plugin
```

