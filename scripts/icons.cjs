const fs=require('node:fs');
const sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
// Letras desenhadas em vetor: sem dependência de fontes instaladas.
const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="18" fill="#ee4d2d"/><g fill="none" stroke="white" stroke-width="9" stroke-linejoin="round"><path d="M17 44h12q17 0 17 20t-17 20H17Z"/><path d="M83 44H58v40h25M58 64h21"/><path d="M98 44v40h18"/></g></svg>';
(async()=>{fs.writeFileSync('extension/icons/del.svg',svg);for(const size of [16,48,128])await sharp(Buffer.from(svg)).resize(size,size).png().toFile(`extension/icons/del${size}.png`);})();
