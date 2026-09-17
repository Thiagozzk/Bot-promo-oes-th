# Bot Promo PC Cloud

Versão adaptada para procurar e publicar promoções de hardware/periféricos sem depender de grupos do Telegram.

## Pronto nesta versão
- Node.js único (remove a mistura Python + Node do projeto antigo).
- Painel web.
- WhatsApp Web por QR em `/whatsapp`.
- Grupos configurados por `TARGET_GROUPS`.
- Filtro padrão de 30% OFF.
- Banco SQLite anti-repetição.
- Busca periódica.
- Mercado Livre por API com `ML_ACCESS_TOKEN`.
- AliExpress Affiliate API com App Key/Secret/Tracking ID.
- Feed JSON opcional para Shopee/Amazon/Terabyte ou outra fonte autorizada.
- Lista de termos focada em PC e periféricos.
- `AUTO_SEND=false` por padrão para testar com segurança antes de ligar o envio automático.
- Preparado para Railway.

## Atenção
O modo `whatsapp-web.js` não é a API oficial do WhatsApp. Ele depende do WhatsApp Web e pode desconectar ou sofrer limitações. Use somente em grupos onde você tem permissão para publicar e evite frequência abusiva.

As lojas alteram APIs e programas de afiliados. O bot não inventa credenciais e não tenta burlar proteção de sites. Mercado Livre e AliExpress só são ativados quando as credenciais correspondentes forem configuradas.

## Railway
1. Suba estes arquivos para seu repositório.
2. Railway → New Project → Deploy from GitHub.
3. Adicione as variáveis copiando `.env.example`.
4. Defina `ADMIN_KEY` e `TARGET_GROUPS`.
5. Adicione as credenciais das lojas.
6. Crie um Volume persistente e monte-o no diretório do projeto para preservar `data` e `.wwebjs_auth` entre reinícios.
7. Gere um domínio público.
8. Abra `https://SEU-DOMINIO/whatsapp` e escaneie o QR.
9. Use o painel principal e clique `Buscar agora`.
10. Só depois de confirmar que tudo está certo, mude `AUTO_SEND=true`.

## Formato do feed extra
Array JSON ou `{"offers":[...]}`. Campos aceitos:
`title/name`, `store`, `url/link`, `price/currentPrice`, `oldPrice/originalPrice`, `discount/discountPercent`, `image/imageUrl`.

## Segurança
Nunca coloque tokens ou senhas no GitHub. Use Variables/Secrets da hospedagem.
