// Vercel build: injeta a URL do servidor (variável ETERNIA_SERVER_URL) e publica em public/
const fs=require('fs'),path=require('path');
const url=(process.env.ETERNIA_SERVER_URL||'').trim().replace(/\/+$/,'');
if(url&&!/^https?:\/\/[^\s"'<>\\]+$/i.test(url)){console.error('ETERNIA_SERVER_URL inválida');process.exit(1)}
if(!url)console.warn('AVISO: ETERNIA_SERVER_URL vazia — multiplayer/contas só funcionam se o jogador informar o servidor na tela.');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8').replace('__ETERNIA_SERVER_URL__',url);
fs.mkdirSync(path.join(__dirname,'public'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'public','index.html'),html);
console.log('public/index.html gerado; servidor =',url||'(não configurado)');
